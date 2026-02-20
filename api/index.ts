import { handle } from "hono/vercel";
import app from "../server/src/index.js";

export default handle(app);
