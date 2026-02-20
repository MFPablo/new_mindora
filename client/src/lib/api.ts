const rawUrl = import.meta.env.VITE_SERVER_URL ||
  (import.meta.env.PROD ? window.location.origin : "http://localhost:3000");

export const SERVER_URL = rawUrl.replace(/\/$/, "");

if (import.meta.env.PROD && !import.meta.env.VITE_SERVER_URL) {
  console.warn("VITE_SERVER_URL is missing in production. Falling back to window.location.origin:", SERVER_URL);
} else {
  console.log("Using API SERVER_URL:", SERVER_URL);
}
