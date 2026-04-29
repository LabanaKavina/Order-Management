import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../server/dist/app';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // The request comes in as /api/menu or /api/orders
  // Express app expects these paths as-is
  return app(req, res);
}
