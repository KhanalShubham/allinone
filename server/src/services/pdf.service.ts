import { PDFDocument } from 'pdf-lib';
import { PDFParse } from 'pdf-parse';

export async function mergePdfs(files: Express.Multer.File[]): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const pdf = await PDFDocument.load(file.buffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return Buffer.from(await mergedPdf.save());
}

export async function pdfToText(
  buffer: Buffer,
): Promise<{ text: string; pages: number; info: Record<string, unknown> }> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const [textResult, infoResult] = await Promise.all([parser.getText(), parser.getInfo()]);
  await parser.destroy();

  return {
    text: textResult.text,
    pages: textResult.total,
    info: (infoResult.info ?? {}) as Record<string, unknown>,
  };
}
