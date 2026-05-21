import { Router, Request, Response } from 'express';
import QRCode from 'qrcode';

const router = Router();

router.post('/generate', async (req: Request, res: Response) => {
  const { text, size = 256, color = '#000000', background = '#ffffff' } = req.body;

  if (!text) {
    res.status(400).json({ error: 'text is required' });
    return;
  }

  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: Number(size),
      color: { dark: color, light: background },
      errorCorrectionLevel: 'H',
    });
    res.json({ dataUrl });
  } catch {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

export default router;
