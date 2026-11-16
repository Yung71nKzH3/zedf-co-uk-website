/**
 * Native Cloudflare WebSocket Room Client
 * Replaces Supabase Realtime Channels with direct WebSocket communication
 * powered by Cloudflare Workers Durable Objects.
 */

export interface RoomMessage<T = any> {
  type: 'broadcast' | 'presence';
  event?: string;
  payload?: T;
  count?: number;
}

export interface RoomSocket {
  send: (event: string, payload: any) => void;
  close: () => void;
}

export function connectRoom({
  roomCode,
  onEvent,
  onPresence,
  onStatus,
}: {
  roomCode: string;
  onEvent: (event: string, payload: any) => void;
  onPresence: (count: number) => void;
  onStatus: (status: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED') => void;
}): RoomSocket {
  if (typeof window === 'undefined') {
    return { send: () => {}, close: () => {} };
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  const wsUrl = `${protocol}//${host}/api/room?room=${encodeURIComponent(roomCode)}`;

  let ws: WebSocket | null = new WebSocket(wsUrl);
  let isClosed = false;

  onStatus('CONNECTING');

  ws.onopen = () => {
    if (isClosed) {
      ws?.close();
      return;
    }
    onStatus('CONNECTED');
  };

  ws.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      if (data.type === 'presence' && typeof data.count === 'number') {
        onPresence(data.count);
      } else if (data.type === 'broadcast' && data.event) {
        onEvent(data.event, data.payload);
      }
    } catch (err) {
      console.error('Failed to parse realtime message:', err);
    }
  };

  ws.onclose = () => {
    if (!isClosed) {
      onStatus('DISCONNECTED');
    }
  };

  ws.onerror = () => {
    if (!isClosed) {
      onStatus('DISCONNECTED');
    }
  };

  return {
    send: (event: string, payload: any) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: 'broadcast', event, payload }));
        } catch (err) {
          console.error('Failed to send realtime message:', err);
        }
      }
    },
    close: () => {
      isClosed = true;
      try {
        ws?.close();
      } catch {}
      ws = null;
    },
  };
}
