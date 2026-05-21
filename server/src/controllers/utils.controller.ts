import { Request, Response } from 'express';
import * as utilsService from '../services/utils.service';

export function generatePassword(req: Request, res: Response): void {
  const {
    length = 16,
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = false,
  } = req.body;

  try {
    const password = utilsService.generatePassword({
      length: Number(length),
      uppercase: Boolean(uppercase),
      lowercase: Boolean(lowercase),
      numbers: Boolean(numbers),
      symbols: Boolean(symbols),
    });
    res.json({ password });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}
