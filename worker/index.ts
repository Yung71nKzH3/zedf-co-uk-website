import vinextHandler from "vinext/server/fetch-handler";
export { RoomDurableObject } from "./room-do";

const worker = {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    if (typeof globalThis !== "undefined") {
      (globalThis as any).env = env;
    }

    const url = new URL(request.url);
    if (url.pathname === "/api/room") {
      const upgradeHeader = request.headers.get("Upgrade") || request.headers.get("upgrade");
      if (upgradeHeader === "websocket") {
        const room = url.searchParams.get("room")?.trim() || "default";
        const id = env.ROOMS.idFromName(room);
        const stub = env.ROOMS.get(id);
        return stub.fetch(request);
      }
      return new Response("Expected Upgrade: websocket", { status: 426 });
    }

    const response = await (vinextHandler as any).fetch(request, env, ctx);

    // Apply modern security headers to HTTP responses
    const headers = new Headers(response.headers);
    if (!headers.has("X-Content-Type-Options")) {
      headers.set("X-Content-Type-Options", "nosniff");
    }
    if (!headers.has("X-Frame-Options")) {
      headers.set("X-Frame-Options", "SAMEORIGIN");
    }
    if (!headers.has("Referrer-Policy")) {
      headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    }
    if (!headers.has("Permissions-Policy")) {
      headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};

export default worker;
