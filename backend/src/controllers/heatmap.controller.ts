import { Request, Response, NextFunction } from 'express';
import heatmapService from '../services/heatmap.service';
import asyncWrapper from '../utils/asyncWrapper';

export class HeatmapController {
  /**
   * GET /api/sessions/:id/heatmap
   * Fetch simulated heat-map analysis for a session
   */
  getSessionHeatmap = asyncWrapper(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user!.id;
    const sessionId = req.params.id as string;

    const heatmap = await heatmapService.getSessionHeatmap(userId, sessionId);

    res.status(200).json({
      success: true,
      data: heatmap
    });
  });
}

export default new HeatmapController();
