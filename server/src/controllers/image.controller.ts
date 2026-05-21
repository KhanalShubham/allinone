import { Request, Response } from 'express';
import * as imageService from '../services/image.service';
import type { ImageFormat } from '../types';

export async function compress(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: 'No image uploaded' });
    return;
  }

  const quality = parseInt(req.body.quality || '80', 10);
  const format = (req.body.format || 'jpeg') as 'jpeg' | 'webp' | 'png';

  try {
    const { data, format: fmt } = await imageService.compressImage(req.file.buffer, quality, format);
    res.set('Content-Type', `image/${fmt}`);
    res.set('Content-Disposition', `attachment; filename="compressed.${fmt}"`);
    res.send(data);
  } catch {
    res.status(500).json({ error: 'Failed to compress image' });
  }
}

export async function resize(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: 'No image uploaded' });
    return;
  }

  const width = req.body.width ? parseInt(req.body.width, 10) : undefined;
  const height = req.body.height ? parseInt(req.body.height, 10) : undefined;

  try {
    const { data, format } = await imageService.resizeImage(req.file.buffer, width, height);
    res.set('Content-Type', `image/${format}`);
    res.set('Content-Disposition', `attachment; filename="resized.${format}"`);
    res.send(data);
  } catch {
    res.status(500).json({ error: 'Failed to resize image' });
  }
}

export async function convert(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: 'No image uploaded' });
    return;
  }

  const format = (req.body.format || 'jpeg') as ImageFormat;
  const allowed: ImageFormat[] = ['jpeg', 'webp', 'png', 'avif'];

  if (!allowed.includes(format)) {
    res.status(400).json({ error: 'Invalid format. Allowed: jpeg, webp, png, avif' });
    return;
  }

  try {
    const data = await imageService.convertImage(req.file.buffer, format);
    res.set('Content-Type', `image/${format}`);
    res.set('Content-Disposition', `attachment; filename="converted.${format}"`);
    res.send(data);
  } catch (err) {
    console.error('Image convert error:', err);
    res.status(500).json({ error: 'Failed to convert image' });
  }
}
