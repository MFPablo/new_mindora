import app from '../server/src/index';
import { handle } from 'hono/vercel';

export const runtime = 'edge';
export default handle(app);