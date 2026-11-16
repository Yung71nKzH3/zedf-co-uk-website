import vinextHandler from "vinext/server/fetch-handler";
export { RoomDurableObject } from "./room-do";

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
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
    return (vinextHandler as any).fetch(request, env, ctx);
  },
};
