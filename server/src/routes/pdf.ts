import { Router } from 'express';
import multer from 'multer';
import * as pdfController from '../controllers/pdf.controller';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.post('/merge', upload.array('files', 20), pdfController.merge);
router.post('/to-text', upload.single('file'), pdfController.toText);

export default router;
