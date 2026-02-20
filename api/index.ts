import { handle } from "hono/vercel";
import app from "../server/src/index";


export default handle(app);
