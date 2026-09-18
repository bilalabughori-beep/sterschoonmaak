import type { Env } from "./types";

function allowedOrigins(env: Env) { return (env.ALLOWED_ORIGINS ?? "http://localhost:3000,http://127.0.0.1:3000").split(",").map((origin) => origin.trim()).filter(Boolean); }

export function corsHeaders(request: Request, env: Env): Headers {
  const headers = new Headers({ "access-control-allow-methods": "GET,POST,PATCH,OPTIONS", "access-control-allow-headers": "content-type, authorization, x-site-locale", vary: "Origin" });
  const origin = request.headers.get("Origin");
  if (origin && allowedOrigins(env).includes(origin)) headers.set("access-control-allow-origin", origin);
  return headers;
}

export function withCors(response: Response, request: Request, env: Env) {
  const headers = new Headers(response.headers);
  corsHeaders(request, env).forEach((value, key) => headers.set(key, value));
  return new Response(response.body, { status: response.status, headers });
}

export function isAllowedOrigin(request: Request, env: Env) { const origin = request.headers.get("Origin"); return !origin || allowedOrigins(env).includes(origin); }
