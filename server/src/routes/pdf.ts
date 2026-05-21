import { Router, Request, Response } from 'express';
import multer from 'multer';
import { PDFDocument } from 'pdf-lib';
import { PDFParse } from 'pdf-parse';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

// POST /merge — merge multiple PDFs
router.post('/merge', upload.array('files', 20), async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    res.status(400).json({ error: 'No PDF files uploaded' });
    return;
  }

  try {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const pdf = await PDFDocument.load(file.buffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save();

    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="merged.pdf"');
    res.send(Buffer.from(mergedBytes));
  } catch (err) {
    console.error('PDF merge error:', err);
    res.status(500).json({ error: 'Failed to merge PDFs' });
  }
});

// POST /to-text — extract text from a PDF
router.post('/to-text', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No PDF file uploaded' });
    return;
  }

  try {
    const parser = new PDFParse({ data: new Uint8Array(req.file.buffer) });
    const [textResult, infoResult] = await Promise.all([
      parser.getText(),
      parser.getInfo(),
    ]);
    await parser.destroy();

    res.json({
      text: textResult.text,
      pages: textResult.total,
      info: infoResult.info ?? {},
    });
  } catch (err) {
    console.error('PDF to-text error:', err);
    res.status(500).json({ error: 'Failed to extract text from PDF' });
  }
});

export default router;
