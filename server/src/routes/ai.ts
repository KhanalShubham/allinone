import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';

const router = Router();

router.post('/summarize', aiController.summarize);
router.post('/grammar', aiController.fixGrammar);
router.post('/rewrite', aiController.rewrite);
router.post('/hashtags', aiController.generateHashtags);

export default router;
