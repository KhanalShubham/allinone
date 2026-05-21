import { Router } from 'express';
import * as qrController from '../controllers/qr.controller';

const router = Router();

router.post('/generate', qrController.generate);

export default router;
