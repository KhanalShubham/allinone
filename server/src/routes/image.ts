import { Router, Request, Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.post('/compress', upload.single('image'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image uploaded' });
    return;
  }

  const quality = parseInt(req.body.quality || '80', 10);
  const format = (req.body.format || 'jpeg') as 'jpeg' | 'webp' | 'png';

  try {
    const compressed = await sharp(req.file.buffer)
      .toFormat(format, { quality })
      .toBuffer();

    res.set('Content-Type', `image/${format}`);
    res.set('Content-Disposition', `attachment; filename="compressed.${format}"`);
    res.send(compressed);
  } catch {
    res.status(500).json({ error: 'Failed to compress image' });
  }
});

router.post('/resize', upload.single('image'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image uploaded' });
    return;
  }

  const width = req.body.width ? parseInt(req.body.width, 10) : undefined;
  const height = req.body.height ? parseInt(req.body.height, 10) : undefined;

  try {
    const resized = await sharp(req.file.buffer)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .toBuffer({ resolveWithObject: true });

    res.set('Content-Type', `image/${resized.info.format}`);
    res.set('Content-Disposition', `attachment; filename="resized.${resized.info.format}"`);
    res.send(resized.data);
  } catch {
    res.status(500).json({ error: 'Failed to resize image' });
  }
});

router.post('/convert', upload.single('image'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image uploaded' });
    return;
  }

  const format = (req.body.format || 'jpeg') as 'jpeg' | 'webp' | 'png' | 'avif';
  const allowed: Array<'jpeg' | 'webp' | 'png' | 'avif'> = ['jpeg', 'webp', 'png', 'avif'];
  if (!allowed.includes(format)) {
    res.status(400).json({ error: 'Invalid format. Allowed: jpeg, webp, png, avif' });
    return;
  }

  try {
    const converted = await sharp(req.file.buffer)
      .toFormat(format)
      .toBuffer();

    res.set('Content-Type', `image/${format}`);
    res.set('Content-Disposition', `attachment; filename="converted.${format}"`);
    res.send(converted);
  } catch (err) {
    console.error('Image convert error:', err);
    res.status(500).json({ error: 'Failed to convert image' });
  }
});

export default router;
