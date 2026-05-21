import { Router } from 'express';
import * as utilsController from '../controllers/utils.controller';

const router = Router();

router.post('/password', utilsController.generatePassword);

export default router;
