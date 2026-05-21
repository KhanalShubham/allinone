import { Router, Request, Response } from 'express';
import crypto from 'crypto';

const router = Router();

router.post('/password', (req: Request, res: Response) => {
  const {
    length = 16,
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = false,
  } = req.body;

  let charset = '';
  if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (numbers) charset += '0123456789';
  if (symbols) charset += '!@#$%^&*()-_=+[]{}|;:,.<>?';

  if (!charset) {
    res.status(400).json({ error: 'Select at least one character type' });
    return;
  }

  const password = Array.from(crypto.randomBytes(Number(length)))
    .map((b) => charset[b % charset.length])
    .join('');

  res.json({ password });
});

export default router;
