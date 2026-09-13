import express from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticateJWT);

router.post('/generate/:sessionId', reportController.generateReport);
router.get('/:id', reportController.getReport);

export default router;
