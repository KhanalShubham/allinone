import { Router, Request, Response } from 'express';
import multer from 'multer';
import youtubedl from 'youtube-dl-exec';
import ffmpeg from 'fluent-ffmpeg';
import https from 'https';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import os from 'os';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

const YOUTUBE_URL_RE =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)/i;

const TIKTOK_URL_RE =
  /^(https?:\/\/)?(www\.)?(tiktok\.com\/|vm\.tiktok\.com\/|vt\.tiktok\.com\/)/i;

function isYouTubeUrl(url: string): boolean {
  return YOUTUBE_URL_RE.test(url.trim());
}

function extractYouTubeId(url: string): string | null {
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

async function cleanupDir(dir: string) {
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
    // Prefer native audio formats — no ffmpeg merge/conversion required
    await youtubedl(url, {
      output: outputTemplate,
      format: 'bestaudio[ext=mp3]/bestaudio[ext=m4a]/bestaudio/best',
      noPlaylist: true,
      noWarnings: true,
    });
  } else {
    // Prefer single-file MP4 streams — avoids ffmpeg merge step
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

function pipeFileToResponse(
  res: Response,
  filePath: string,
  tmpDir: string,
  contentType: string,
  filename: string,
) {
  res.set('Content-Type', contentType);
  res.set('Content-Disposition', `attachment; filename="${filename}"`);

  const stream = createReadStream(filePath);
  stream.on('error', (err) => {
    console.error('File stream error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
    cleanupDir(tmpDir);
  });
  stream.on('end', () => cleanupDir(tmpDir));
  stream.pipe(res);
}

// POST /youtube — download YouTube video or audio via yt-dlp
router.post('/youtube', async (req: Request, res: Response) => {
  const { url, format, quality } = req.body as {
    url: string;
    format: 'mp3' | 'mp4';
    quality?: string;
  };

  if (!url || !format) {
    res.status(400).json({ error: 'url and format are required' });
    return;
  }

  if (!isYouTubeUrl(url)) {
    res.status(400).json({ error: 'Invalid YouTube URL' });
    return;
  }

  let tmpDir = '';
  try {
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noPlaylist: true,
      noWarnings: true,
    }) as { title?: string };

    const title =
      (info.title ?? 'download').replace(/[^a-z0-9_\- ]/gi, '_').trim() || 'download';

    const { filePath, tmpDir: dir, ext } = await downloadYouTubeFile(url, format, quality);
    tmpDir = dir;

    if (format === 'mp3') {
      const audioType = ext === 'mp3' ? 'audio/mpeg' : 'audio/mp4';
      const audioName = ext === 'mp3' ? `${title}.mp3` : `${title}.m4a`;
      pipeFileToResponse(res, filePath, tmpDir, audioType, audioName);
    } else {
      pipeFileToResponse(
        res,
        filePath,
        tmpDir,
        ext === 'webm' ? 'video/webm' : 'video/mp4',
        `${title}.${ext === 'webm' ? 'webm' : 'mp4'}`,
      );
    }
  } catch (err) {
    if (tmpDir) await cleanupDir(tmpDir);
    console.error('YouTube download error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (!res.headersSent) {
      const needsFfmpeg = message.includes('ffmpeg') || message.includes('ffprobe');
      res.status(500).json({
        error: needsFfmpeg
          ? 'FFmpeg is required for this format. Install FFmpeg from https://ffmpeg.org or try again (audio may save as .m4a without it).'
          : message.includes('ENOENT') || message.includes('not found')
            ? 'yt-dlp is not available. Run npm install in the server folder.'
            : message,
      });
    }
  }
});

// POST /gif — convert uploaded video clip to GIF (requires ffmpeg)
router.post('/gif', upload.single('video'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No video uploaded' });
    return;
  }

  const startTime = Math.max(0, parseFloat(String(req.body.startTime ?? '0')) || 0);
  const duration = Math.min(10, Math.max(1, parseFloat(String(req.body.duration ?? '3')) || 3));

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'turuntai-gif-'));
  const inputPath = path.join(tmpDir, `input${path.extname(req.file.originalname) || '.mp4'}`);
  const outputPath = path.join(tmpDir, 'output.gif');

  try {
    await fs.writeFile(inputPath, req.file.buffer);

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

    const stat = await fs.stat(outputPath);
    res.set('Content-Type', 'image/gif');
    res.set('Content-Disposition', 'attachment; filename="animation.gif"');
    res.set('Content-Length', String(stat.size));

    const stream = createReadStream(outputPath);
    stream.on('end', () => cleanupDir(tmpDir));
    stream.on('error', () => cleanupDir(tmpDir));
    stream.pipe(res);
  } catch (err) {
    await cleanupDir(tmpDir);
    console.error('GIF creation error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    const needsFfmpeg =
      message.toLowerCase().includes('ffmpeg') ||
      message.toLowerCase().includes('cannot find') ||
      message.includes('ENOENT');

    res.status(500).json({
      error: needsFfmpeg
        ? 'FFmpeg is not installed. Install it from https://ffmpeg.org and restart the server.'
        : `GIF creation failed: ${message}`,
    });
  }
});

// POST /tiktok — resolve TikTok download URL (server-side, no browser CORS)
router.post('/tiktok', async (req: Request, res: Response) => {
  const { url } = req.body as { url?: string };

  if (!url?.trim()) {
    res.status(400).json({ error: 'url is required' });
    return;
  }

  if (!TIKTOK_URL_RE.test(url.trim())) {
    res.status(400).json({ error: 'Invalid TikTok URL' });
    return;
  }

  try {
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url.trim())}&hd=1`;
    const response = await fetch(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Turuntai/1.0)' },
    });
    const data = (await response.json()) as {
      code: number;
      msg?: string;
      data?: {
        play?: string;
        wmplay?: string;
        title?: string;
        author?: { nickname?: string };
      };
    };

    if (data.code !== 0 || !data.data?.play) {
      res.status(400).json({
        error: data.msg ?? 'Could not fetch this TikTok video. Check the URL and try again.',
      });
      return;
    }

    const safeTitle = (data.data.title ?? 'tiktok_video')
      .replace(/[^a-z0-9_\- ]/gi, '_')
      .trim()
      .slice(0, 80);

    res.json({
      downloadUrl: data.data.play,
      downloadUrlWatermark: data.data.wmplay,
      title: data.data.title,
      author: data.data.author?.nickname,
      filename: `${safeTitle || 'tiktok_video'}.mp4`,
    });
  } catch (err) {
    console.error('TikTok download error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// GET /thumbnail — get YouTube video thumbnail and metadata
router.get('/thumbnail', async (req: Request, res: Response) => {
  const { url } = req.query as { url?: string };

  if (!url) {
    res.status(400).json({ error: 'url query parameter is required' });
    return;
  }

  if (!isYouTubeUrl(url)) {
    res.status(400).json({ error: 'Invalid YouTube URL' });
    return;
  }

  try {
    const videoId = extractYouTubeId(url);
    if (!videoId) {
      res.status(400).json({ error: 'Could not parse video ID from URL' });
      return;
    }

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const fallbackUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    let title: string | undefined;
    try {
      const info = await youtubedl(url, {
        dumpSingleJson: true,
        noPlaylist: true,
        noWarnings: true,
      }) as { title?: string };
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

    res.json({
      videoId,
      thumbnailUrl,
      fallbackUrl,
      ...(title ? { title } : {}),
    });
  } catch (err) {
    console.error('Thumbnail error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

function fetchJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let data = '';
        response.on('data', (chunk: string) => {
          data += chunk;
        });
        response.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

export default router;
