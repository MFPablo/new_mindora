import app from '../server/src/index';
import { handle } from 'hono/vercel';

export const runtime = 'nodejs';
export default handle(app);