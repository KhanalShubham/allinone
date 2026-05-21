import youtubedl from 'youtube-dl-exec';
import ffmpeg from 'fluent-ffmpeg';
import https from 'https';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import os from 'os';
import { Response } from 'express';

export const YOUTUBE_URL_RE =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)/i;

export const TIKTOK_URL_RE =
  /^(https?:\/\/)?(www\.)?(tiktok\.com\/|vm\.tiktok\.com\/|vt\.tiktok\.com\/)/i;

export function isYouTubeUrl(url: string): boolean {
  return YOUTUBE_URL_RE.test(url.trim());
}

export function isTikTokUrl(url: string): boolean {
  return TIKTOK_URL_RE.test(url.trim());
}

export function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.slice(1).split('/')[0] || null;
    }
    if (parsed.pathname.startsWith('/shorts/')) {
      return parsed.pathname.split('/')[2] || null;
    }
    return parsed.searchParams.get('v');
  } catch {
    return null;
  }
}

export async function cleanupDir(dir: string): Promise<void> {
  try {
    const files = await fs.readdir(dir);
    await Promise.all(files.map((f) => fs.unlink(path.join(dir, f)).catch(() => undefined)));
    await fs.rmdir(dir).catch(() => undefined);
  } catch {
    // ignore cleanup errors
  }
}

async function downloadYouTubeFile(
  url: string,
  format: 'mp3' | 'mp4',
  quality = 'best',
): Promise<{ filePath: string; tmpDir: string; ext: string }> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'turuntai-yt-'));
  const outputTemplate = path.join(tmpDir, 'download.%(ext)s');

  if (format === 'mp3') {
    await youtubedl(url, {
      output: outputTemplate,
      format: 'bestaudio[ext=mp3]/bestaudio[ext=m4a]/bestaudio/best',
      noPlaylist: true,
      noWarnings: true,
    });
  } else {
    const height = quality && quality !== 'best' ? quality.replace('p', '') : null;
    const mp4Format = height
      ? `best[ext=mp4][height<=${height}]/best[ext=mp4]/best`
      : 'best[ext=mp4]/best';
    await youtubedl(url, {
      output: outputTemplate,
      format: mp4Format,
      noPlaylist: true,
      noWarnings: true,
    });
  }

  const files = await fs.readdir(tmpDir);
  const downloaded = files.find((f) => f.startsWith('download.'));
  if (!downloaded) {
    await cleanupDir(tmpDir);
    throw new Error('Download finished but no output file was created');
  }

  const ext = path.extname(downloaded).slice(1) || (format === 'mp3' ? 'mp3' : 'mp4');
  return { filePath: path.join(tmpDir, downloaded), tmpDir, ext };
}

export async function downloadYouTubeMedia(
  url: string,
  format: 'mp3' | 'mp4',
  quality?: string,
): Promise<{ filePath: string; tmpDir: string; ext: string; title: string }> {
  const info = (await youtubedl(url, {
    dumpSingleJson: true,
    noPlaylist: true,
    noWarnings: true,
  })) as { title?: string };

  const title =
    (info.title ?? 'download').replace(/[^a-z0-9_\- ]/gi, '_').trim() || 'download';

  const { filePath, tmpDir, ext } = await downloadYouTubeFile(url, format, quality);
  return { filePath, tmpDir, ext, title };
}

export function pipeFileToResponse(
  res: Response,
  filePath: string,
  tmpDir: string,
  contentType: string,
  filename: string,
): void {
  res.set('Content-Type', contentType);
  res.set('Content-Disposition', `attachment; filename="${filename}"`);

  const stream = createReadStream(filePath);
  stream.on('error', (err) => {
    console.error('File stream error:', err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
    cleanupDir(tmpDir);
  });
  stream.on('end', () => cleanupDir(tmpDir));
  stream.pipe(res);
}

export async function createGif(
  buffer: Buffer,
  originalname: string,
  startTime: number,
  duration: number,
): Promise<{ filePath: string; tmpDir: string }> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'turuntai-gif-'));
  const inputPath = path.join(tmpDir, `input${path.extname(originalname) || '.mp4'}`);
  const outputPath = path.join(tmpDir, 'output.gif');

  await fs.writeFile(inputPath, buffer);

  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(startTime)
      .setDuration(duration)
      .outputOptions([
        '-vf',
        'fps=12,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
      ])
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });

  return { filePath: outputPath, tmpDir };
}

export interface TikTokResult {
  downloadUrl: string;
  downloadUrlWatermark?: string;
  title?: string;
  author?: string;
  filename: string;
}

export async function downloadTikTok(url: string): Promise<TikTokResult> {
  const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url.trim())}&hd=1`;
  const response = await fetch(apiUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Turuntai/1.0)' },
  });
  const data = (await response.json()) as {
    code: number;
    msg?: string;
    data?: { play?: string; wmplay?: string; title?: string; author?: { nickname?: string } };
  };

  if (data.code !== 0 || !data.data?.play) {
    throw new Error(data.msg ?? 'Could not fetch this TikTok video. Check the URL and try again.');
  }

  const safeTitle = (data.data.title ?? 'tiktok_video')
    .replace(/[^a-z0-9_\- ]/gi, '_')
    .trim()
    .slice(0, 80);

  return {
    downloadUrl: data.data.play,
    downloadUrlWatermark: data.data.wmplay,
    title: data.data.title,
    author: data.data.author?.nickname,
    filename: `${safeTitle || 'tiktok_video'}.mp4`,
  };
}

export function fetchJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let data = '';
        response.on('data', (chunk: string) => { data += chunk; });
        response.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(e); }
        });
      })
      .on('error', reject);
  });
}

export async function getYouTubeThumbnail(url: string): Promise<{
  videoId: string;
  thumbnailUrl: string;
  fallbackUrl: string;
  title?: string;
}> {
  const videoId = extractYouTubeId(url);
  if (!videoId) throw new Error('Could not parse video ID from URL');

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const fallbackUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  let title: string | undefined;
  try {
    const info = (await youtubedl(url, {
      dumpSingleJson: true,
      noPlaylist: true,
      noWarnings: true,
    })) as { title?: string };
    title = info.title;
  } catch {
    try {
      const noembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
      const titleData = await fetchJson(noembedUrl);
      title = (titleData as { title?: string }).title;
    } catch {
      // title is optional
    }
  }

  return { videoId, thumbnailUrl, fallbackUrl, ...(title ? { title } : {}) };
}
