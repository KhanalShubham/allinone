import { Router } from 'express';
import * as currencyController from '../controllers/currency.controller';

const router = Router();

router.get('/rates', currencyController.getRates);

export default router;
