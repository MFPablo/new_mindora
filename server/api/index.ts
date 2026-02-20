import { handle } from "@vercel/hono";
import { app } from "../src/index.js";

export default handle(app);
