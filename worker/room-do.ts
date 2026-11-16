import { DurableObject } from "cloudflare:workers";

export class RoomDurableObject extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader !== "websocket") {
      return new Response("Expected Upgrade: websocket", { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Accept WebSocket connection into the Durable Object's hibernation manager
    this.ctx.acceptWebSocket(server);

    // Notify all peers in the room about the new connection
    this.broadcastPresence();

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    // Broadcast incoming messages to all other connected peers in this room
    const sockets = this.ctx.getWebSockets();
    for (const socket of sockets) {
      if (socket !== ws) {
        try {
          socket.send(message);
        } catch {
          // Socket might have dropped
        }
      }
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, _wasClean: boolean): Promise<void> {
    try {
      ws.close(code, reason);
    } catch {}
    this.broadcastPresence();
  }

  async webSocketError(ws: WebSocket, _error: unknown): Promise<void> {
    try {
      ws.close(1011, "WebSocket error");
    } catch {}
    this.broadcastPresence();
  }

  private broadcastPresence(): void {
    const sockets = this.ctx.getWebSockets();
    const count = sockets.length;
    const presencePayload = JSON.stringify({
      type: "presence",
      count: Math.max(1, count),
    });

    for (const socket of sockets) {
      try {
        socket.send(presencePayload);
      } catch {}
    }
  }
}
