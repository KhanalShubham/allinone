import { Router } from 'express';
import multer from 'multer';
import * as imageController from '../controllers/image.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.post('/compress', upload.single('image'), imageController.compress);
router.post('/resize', upload.single('image'), imageController.resize);
router.post('/convert', upload.single('image'), imageController.convert);

export default router;
