import { handle } from "@vercel/hono";
import { app } from "../src/index";

export default handle(app);
