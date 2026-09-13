import http from 'http';
import app from '../src/app';

export function runHealthTest(): Promise<boolean> {
  return new Promise((resolve) => {
    const server = app.listen(0, async () => {
      const port = (server.address() as any).port;
      process.stdout.write(`Health test server running on port ${port}\n`);

      http.get(`http://localhost:${port}/api/health`, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const hasRequiredFields =
              parsed.status !== undefined &&
              parsed.environment !== undefined &&
              parsed.timestamp !== undefined &&
              parsed.database !== undefined;

            if (res.statusCode === 200 && hasRequiredFields) {
              process.stdout.write('✅ PASS: GET /api/health verification passed!\n');
              server.close(() => resolve(true));
            } else {
              process.stderr.write('❌ FAIL: Response payload missing required fields or invalid status code.\n');
              server.close(() => resolve(false));
            }
          } catch (e) {
            process.stderr.write(`❌ FAIL: Invalid JSON returned from health endpoint. ${e}\n`);
            server.close(() => resolve(false));
          }
        });
      }).on('error', (err) => {
        process.stderr.write(`HTTP Request failed: ${err}\n`);
        server.close(() => resolve(false));
      });
    });
  });
}

if (require.main === module) {
  runHealthTest().then((success) => process.exit(success ? 0 : 1));
}
