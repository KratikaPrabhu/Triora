import express from 'express';
import * as sessionController from '../controllers/session.controller';
import validateBody from '../middleware/validate.middleware';
import { authenticateJWT } from '../middleware/auth.middleware';
import { createSessionSchema, updateSessionSchema } from '../validators/session.validator';

import heatmapController from '../controllers/heatmap.controller';

const router = express.Router();

router.use(authenticateJWT);

router.post('/', validateBody(createSessionSchema), sessionController.createSession);
router.get('/', sessionController.getSessions);
router.get('/:id', sessionController.getSessionById);
router.get('/:id/heatmap', heatmapController.getSessionHeatmap);
router.patch('/:id', validateBody(updateSessionSchema), sessionController.updateSession);

router.post('/:id/next-question', sessionController.respondSession);
router.post('/:id/respond', sessionController.respondSession);

export default router;
