import { Request, Response } from 'express';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import * as mediaService from '../services/media.service';

export async function downloadYoutube(req: Request, res: Response): Promise<void> {
  const { url, format, quality } = req.body as {
    url: string;
    format: 'mp3' | 'mp4';
    quality?: string;
  };

  if (!url || !format) {
    res.status(400).json({ error: 'url and format are required' });
    return;
  }

  if (!mediaService.isYouTubeUrl(url)) {
    res.status(400).json({ error: 'Invalid YouTube URL' });
    return;
  }

  let tmpDir = '';
  try {
    const { filePath, tmpDir: dir, ext, title } = await mediaService.downloadYouTubeMedia(
      url,
      format,
      quality,
    );
    tmpDir = dir;

    if (format === 'mp3') {
      const audioType = ext === 'mp3' ? 'audio/mpeg' : 'audio/mp4';
      const audioName = ext === 'mp3' ? `${title}.mp3` : `${title}.m4a`;
      mediaService.pipeFileToResponse(res, filePath, tmpDir, audioType, audioName);
    } else {
      mediaService.pipeFileToResponse(
        res,
        filePath,
        tmpDir,
        ext === 'webm' ? 'video/webm' : 'video/mp4',
        `${title}.${ext === 'webm' ? 'webm' : 'mp4'}`,
      );
    }
  } catch (err) {
    if (tmpDir) await mediaService.cleanupDir(tmpDir);
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
}

export async function createGif(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: 'No video uploaded' });
    return;
  }

  const startTime = Math.max(0, parseFloat(String(req.body.startTime ?? '0')) || 0);
  const duration = Math.min(10, Math.max(1, parseFloat(String(req.body.duration ?? '3')) || 3));

  let tmpDir = '';
  try {
    const { filePath, tmpDir: dir } = await mediaService.createGif(
      req.file.buffer,
      req.file.originalname,
      startTime,
      duration,
    );
    tmpDir = dir;

    const stat = await fs.stat(filePath);
    res.set('Content-Type', 'image/gif');
    res.set('Content-Disposition', 'attachment; filename="animation.gif"');
    res.set('Content-Length', String(stat.size));

    const stream = createReadStream(filePath);
    stream.on('end', () => mediaService.cleanupDir(tmpDir));
    stream.on('error', () => mediaService.cleanupDir(tmpDir));
    stream.pipe(res);
  } catch (err) {
    if (tmpDir) await mediaService.cleanupDir(tmpDir);
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
}

export async function downloadTikTok(req: Request, res: Response): Promise<void> {
  const { url } = req.body as { url?: string };

  if (!url?.trim()) {
    res.status(400).json({ error: 'url is required' });
    return;
  }

  if (!mediaService.isTikTokUrl(url)) {
    res.status(400).json({ error: 'Invalid TikTok URL' });
    return;
  }

  try {
    const result = await mediaService.downloadTikTok(url);
    res.json(result);
  } catch (err) {
    console.error('TikTok download error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
}

export async function getThumbnail(req: Request, res: Response): Promise<void> {
  const { url } = req.query as { url?: string };

  if (!url) {
    res.status(400).json({ error: 'url query parameter is required' });
    return;
  }

  if (!mediaService.isYouTubeUrl(url)) {
    res.status(400).json({ error: 'Invalid YouTube URL' });
    return;
  }

  try {
    const result = await mediaService.getYouTubeThumbnail(url);
    res.json(result);
  } catch (err) {
    console.error('Thumbnail error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
}
