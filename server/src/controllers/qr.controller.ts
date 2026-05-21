import { Request, Response } from 'express';
import * as qrService from '../services/qr.service';

export async function generate(req: Request, res: Response): Promise<void> {
  const { text, size = 256, color = '#000000', background = '#ffffff' } = req.body;

  if (!text) {
    res.status(400).json({ error: 'text is required' });
    return;
  }

  try {
    const dataUrl = await qrService.generateQr(text, Number(size), color, background);
    res.json({ dataUrl });
  } catch {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
}
