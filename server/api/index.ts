import { app } from "../src/index.js";

export default async function handler(req: any, res: any) {
  // Build full URL
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["host"] || "localhost";
  const url = `${protocol}://${host}${req.url}`;

  // Convert Node.js headers to Web Headers
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (key && value) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value as string);
      }
    }
  }

  // Buffer body for non-GET/HEAD requests
  let body: ArrayBuffer | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      req.on("data", (chunk: Buffer) => chunks.push(chunk));
      req.on("end", () => resolve());
      req.on("error", reject);
    });
    const buf = Buffer.concat(chunks);
    if (buf.length > 0) body = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  }

  // Create proper Web Request and call Hono
  const webRequest = new Request(url, {
    method: req.method,
    headers,
    body,
  });

  const webResponse = await app.fetch(webRequest);

  // Write response: status + headers
  const resHeaders: Record<string, string | string[]> = {};
  webResponse.headers.forEach((value, key) => {
    const existing = resHeaders[key];
    if (existing) {
      resHeaders[key] = Array.isArray(existing)
        ? [...existing, value]
        : [existing, value];
    } else {
      resHeaders[key] = value;
    }
  });
  res.writeHead(webResponse.status, resHeaders);

  // Write response body
  if (webResponse.body) {
    const reader = webResponse.body.getReader();
    let chunk = await reader.read();
    while (!chunk.done) {
      res.write(chunk.value);
      chunk = await reader.read();
    }
  }
  res.end();
}
