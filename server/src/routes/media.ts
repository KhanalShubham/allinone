import { Router } from 'express';
import multer from 'multer';
import * as mediaController from '../controllers/media.controller';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

router.post('/youtube', mediaController.downloadYoutube);
router.post('/gif', upload.single('video'), mediaController.createGif);
router.post('/tiktok', mediaController.downloadTikTok);
router.get('/thumbnail', mediaController.getThumbnail);

export default router;
