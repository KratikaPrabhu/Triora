import { getDBStatus } from '../config/db';
import env from '../config/env';

export class HealthService {
  getHealthStatus() {
    const dbStatus = getDBStatus();

    return {
      status: 'ok',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      database: dbStatus
    };
  }
}

export default new HealthService();
