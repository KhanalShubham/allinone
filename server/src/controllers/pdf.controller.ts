import { Request, Response } from 'express';
import * as pdfService from '../services/pdf.service';

export async function merge(req: Request, res: Response): Promise<void> {
  const files = req.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    res.status(400).json({ error: 'No PDF files uploaded' });
    return;
  }

  try {
    const merged = await pdfService.mergePdfs(files);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="merged.pdf"');
    res.send(merged);
  } catch (err) {
    console.error('PDF merge error:', err);
    res.status(500).json({ error: 'Failed to merge PDFs' });
  }
}

export async function toText(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: 'No PDF file uploaded' });
    return;
  }

  try {
    const result = await pdfService.pdfToText(req.file.buffer);
    res.json(result);
  } catch (err) {
    console.error('PDF to-text error:', err);
    res.status(500).json({ error: 'Failed to extract text from PDF' });
  }
}
