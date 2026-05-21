import { Request, Response } from 'express';
import * as currencyService from '../services/currency.service';

export async function getRates(req: Request, res: Response): Promise<void> {
  const base = ((req.query.base as string) || 'USD').toUpperCase();

  try {
    const data = await currencyService.getRates(base);
    res.json(data);
  } catch (err) {
    console.error('Currency rates error:', err);
    res.status(502).json({ error: 'Failed to fetch exchange rates' });
  }
}
