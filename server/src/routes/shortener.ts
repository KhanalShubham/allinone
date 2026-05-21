import { Router } from 'express';
import * as shortenerController from '../controllers/shortener.controller';

const router = Router();

router.post('/create', shortenerController.create);
router.get('/', shortenerController.list);
router.get('/:code', shortenerController.redirect);

export default router;
