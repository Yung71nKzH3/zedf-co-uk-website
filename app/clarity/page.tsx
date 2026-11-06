'use client';
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import {
  ArrowLeft,
  Plus,
  Share2,
  Users,
  Copy,
  Check,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Download,
  Upload,
  Trash2,
  CopyPlus,
  Sparkles,
  Search,
  Volume2,
  VolumeX,
  Hand,
  MousePointer,
  GitBranch,
  CheckSquare,
  Square,
  GripHorizontal,
  FolderKanban,
  StickyNote,
  CreditCard,
  CircleDot,
  Diamond,
  MessageSquareQuote,
  Flag,
  ArrowRight,
  ArrowLeftRight,
  Radio,
  X,
  HelpCircle,
  Image as ImageIcon,
  Tag,
} from 'lucide-react';
import { InstallPwaButton } from '@/components/InstallPwaButton';
import styles from './clarity.module.css';
import {
  NodeShape,
  NodeColor,
  PortSide,
  EdgeCurve,
  EdgeStyle,
  ChecklistItem,
  ClarityNode,
  ClarityEdge,
  ClarityBoard,
  CollaboratorCursor,
  COLOR_THEMES,
  QUICK_TAGS,
  QUICK_EDGE_LABELS,
  BOARD_TEMPLATES,
} from './types';
const STORAGE_KEY_BOARDS = 'clarity-boards-v1';
const STORAGE_KEY_ACTIVE_BOARD = 'clarity-active-board-v1';
const STORAGE_KEY_USER_PROFILE = 'clarity-user-profile-v1';
const VALID_SHAPES: NodeShape[] = ['card', 'sticky', 'pill', 'diamond', 'callout', 'banner'];
const VALID_COLORS: NodeColor[] = [
  'cyan',
  'emerald',
  'rose',
  'amber',
  'violet',
  'blue',
  'orange',
  'slate',
];
const VALID_PORTS: PortSide[] = ['top', 'right', 'bottom', 'left'];
const VALID_CURVES: EdgeCurve[] = ['bezier', 'straight', 'step'];
const VALID_STYLES: EdgeStyle[] = ['solid', 'dashed', 'animated'];
const isValidRoomCode = (code: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(code);
const generateId = (prefix = 'id') => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
};
// Web Audio Subtle Synthesizers
const playPopSound = (audioCtx: AudioContext | null, pitch = 520) => {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.35, audioCtx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.14, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.07);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.07);
  } catch {
    // Ignore audio context restriction errors
  }
};
const playConnectSound = (audioCtx: AudioContext | null) => {
  if (!audioCtx) return;
  try {
    const notes = [440, 659.25];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const start = audioCtx.currentTime + idx * 0.055;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + 0.12);
    });
  } catch {
    // Ignore
  }
};
// Port coordinate calculation
function getPortCoordinates(node: ClarityNode, port: PortSide): { x: number; y: number } {
  switch (port) {
    case 'top':
      return { x: node.x + node.width / 2, y: node.y };
    case 'right':
      return { x: node.x + node.width, y: node.y + node.height / 2 };
    case 'bottom':
      return { x: node.x + node.width / 2, y: node.y + node.height };
    case 'left':
      return { x: node.x, y: node.y + node.height / 2 };
  }
}
// Build SVG Path & Midpoint for a string connection
function computeEdgePath(
  x1: number,
  y1: number,
  fromPort: PortSide,
  x2: number,
  y2: number,
  toPort: PortSide,
  curve: EdgeCurve
): { path: string; midX: number; midY: number } {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  if (curve === 'straight') {
    return {
      path: `M ${x1} ${y1} L ${x2} ${y2}`,
      midX,
      midY,
    };
  }
  if (curve === 'step') {
    if (fromPort === 'left' || fromPort === 'right') {
      return {
        path: `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`,
        midX,
        midY,
      };
    }
    return {
      path: `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`,
      midX,
      midY,
    };
  }
  // Smooth Bezier curve
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const offset = Math.min(160, Math.max(50, dist * 0.42));
  const getControlPoint = (x: number, y: number, port: PortSide) => {
    switch (port) {
      case 'top':
        return { cx: x, cy: y - offset };
      case 'bottom':
        return { cx: x, cy: y + offset };
      case 'left':
        return { cx: x - offset, cy: y };
      case 'right':
        return { cx: x + offset, cy: y };
    }
  };
  const c1 = getControlPoint(x1, y1, fromPort);
  const c2 = getControlPoint(x2, y2, toPort);
  // Cubic Bezier midpoint at t = 0.5
  const bezierMidX = 0.125 * x1 + 0.375 * c1.cx + 0.375 * c2.cx + 0.125 * x2;
  const bezierMidY = 0.125 * y1 + 0.375 * c1.cy + 0.375 * c2.cy + 0.125 * y2;
  return {
    path: `M ${x1} ${y1} C ${c1.cx} ${c1.cy}, ${c2.cx} ${c2.cy}, ${x2} ${y2}`,
    midX: bezierMidX,
    midY: bezierMidY,
  };
}
// Validate incoming Supabase payload to guard against malformed broadcasts
function validateNodesPayload(raw: unknown): ClarityNode[] | null {
  if (!Array.isArray(raw) || raw.length > 250) return null;
  const seen = new Set<string>();
  const validated: ClarityNode[] = [];
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) return null;
    const n = item as ClarityNode;
    if (typeof n.id !== 'string' || n.id.length === 0 || n.id.length > 64 || seen.has(n.id)) {
      return null;
    }
    if (
      typeof n.x !== 'number' ||
      !Number.isFinite(n.x) ||
      typeof n.y !== 'number' ||
      !Number.isFinite(n.y) ||
      typeof n.width !== 'number' ||
      n.width < 80 ||
      n.width > 1200 ||
      typeof n.height !== 'number' ||
      n.height < 50 ||
      n.height > 1200
    ) {
      return null;
    }
    if (!VALID_SHAPES.includes(n.shape) || !VALID_COLORS.includes(n.color)) return null;
    if (typeof n.title !== 'string' || n.title.length > 300) return null;
    if (typeof n.body !== 'string' || n.body.length > 5000) return null;
    if (n.tag !== undefined && (typeof n.tag !== 'string' || n.tag.length > 80)) return null;
    seen.add(n.id);
    validated.push({
      id: n.id,
      x: n.x,
      y: n.y,
      width: n.width,
      height: n.height,
      shape: n.shape,
      color: n.color,
      title: n.title,
      body: n.body,
      tag: n.tag,
      checklist: Array.isArray(n.checklist)
        ? n.checklist.slice(0, 30).map((c) => ({
            id: String(c.id || '').slice(0, 40),
            text: String(c.text || '').slice(0, 240),
            done: Boolean(c.done),
          }))
        : undefined,
      zIndex: typeof n.zIndex === 'number' && Number.isFinite(n.zIndex) ? n.zIndex : 1,
      updatedAt: typeof n.updatedAt === 'number' ? n.updatedAt : Date.now(),
    });
  }
  return validated;
}
function validateEdgesPayload(raw: unknown): ClarityEdge[] | null {
  if (!Array.isArray(raw) || raw.length > 400) return null;
  const seen = new Set<string>();
  const validated: ClarityEdge[] = [];
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) return null;
    const e = item as ClarityEdge;
    if (typeof e.id !== 'string' || e.id.length === 0 || e.id.length > 64 || seen.has(e.id)) {
      return null;
    }
    if (
      typeof e.fromNodeId !== 'string' ||
      typeof e.toNodeId !== 'string' ||
      !VALID_PORTS.includes(e.fromPort) ||
      !VALID_PORTS.includes(e.toPort) ||
      !VALID_COLORS.includes(e.color) ||
      !VALID_CURVES.includes(e.curve) ||
      !VALID_STYLES.includes(e.style)
    ) {
      return null;
    }
    seen.add(e.id);
    validated.push({
      id: e.id,
      fromNodeId: e.fromNodeId,
      fromPort: e.fromPort,
      toNodeId: e.toNodeId,
      toPort: e.toPort,
      label: typeof e.label === 'string' ? e.label.slice(0, 100) : undefined,
      color: e.color,
      curve: e.curve,
      style: e.style,
      bidirectional: Boolean(e.bidirectional),
    });
  }
  return validated;
}
export default function ClarityPage() {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  // Boards & Active Canvas State
  const [boards, setBoards] = useState<ClarityBoard[]>([
    {
      id: 'default-board',
      name: BOARD_TEMPLATES.debate.name,
      nodes: BOARD_TEMPLATES.debate.nodes,
      edges: BOARD_TEMPLATES.debate.edges,
      updatedAt: Date.now(),
    },
  ]);
  const [activeBoardId, setActiveBoardId] = useState<string>('default-board');
  const [nodes, setNodes] = useState<ClarityNode[]>(BOARD_TEMPLATES.debate.nodes);
  const [edges, setEdges] = useState<ClarityEdge[]>(BOARD_TEMPLATES.debate.edges);
  const [boardTitle, setBoardTitle] = useState<string>(BOARD_TEMPLATES.debate.name);
  // History for Undo / Redo
  const [past, setPast] = useState<{ nodes: ClarityNode[]; edges: ClarityEdge[] }[]>([]);
  const [future, setFuture] = useState<{ nodes: ClarityNode[]; edges: ClarityEdge[] }[]>([]);
  // Viewport Pan & Zoom
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 80, y: 40 });
  const [zoom, setZoom] = useState<number>(0.95);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [toolMode, setToolMode] = useState<'select' | 'pan'>('select');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  // Selection & Active Interactions
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [showSearchPanel, setShowSearchPanel] = useState<boolean>(false);
  // Active Connection Dragging ("String Pulling")
  const [connectingDraft, setConnectingDraft] = useState<{
    fromNodeId: string;
    fromPort: PortSide;
    startX: number;
    startY: number;
    currX: number;
    currY: number;
  } | null>(null);
  // Selection Marquee Box
  const [marquee, setMarquee] = useState<{
    startX: number;
    startY: number;
    currX: number;
    currY: number;
  } | null>(null);
  // Multiplayer & Supabase Realtime State
  const [roomCode, setRoomCode] = useState<string>('');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [peerCount, setPeerCount] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('Speaker 1');
  const [userColor, setUserColor] = useState<NodeColor>('cyan');
  const [remoteCursors, setRemoteCursors] = useState<Record<string, CollaboratorCursor>>({});
  // Native <dialog> Refs (following modern-web-guidance `dialog` spec)
  const roomDialogRef = useRef<HTMLDialogElement | null>(null);
  const boardsDialogRef = useRef<HTMLDialogElement | null>(null);
  const helpDialogRef = useRef<HTMLDialogElement | null>(null);
  // DOM & Mutable Refs
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const supabaseChannelRef = useRef<RealtimeChannel | null>(null);
  const myPeerIdRef = useRef<string>('');
  const lastCursorBroadcastRef = useRef<number>(0);
  const spacePressedRef = useRef<boolean>(false);
  const isPanningRef = useRef<{
    active: boolean;
    startClientX: number;
    startClientY: number;
    initialPanX: number;
    initialPanY: number;
  }>({ active: false, startClientX: 0, startClientY: 0, initialPanX: 0, initialPanY: 0 });
  // Node drag tracking ref
  const draggingNodeRef = useRef<{
    nodeId: string;
    pointerId: number;
    startCanvasX: number;
    startCanvasY: number;
    initialPositions: Record<string, { x: number; y: number }>;
    hasMoved: boolean;
  } | null>(null);
  // Node resize tracking ref
  const resizingNodeRef = useRef<{
    nodeId: string;
    pointerId: number;
    startCanvasX: number;
    startCanvasY: number;
    initialWidth: number;
    initialHeight: number;
  } | null>(null);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const panRef = useRef(pan);
  const zoomRef = useRef(zoom);
  const soundEnabledRef = useRef(soundEnabled);
  const roomCodeRef = useRef(roomCode);
  const isConnectedRef = useRef(isConnected);
  const userNameRef = useRef(userName);
  const userColorRef = useRef(userColor);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);
  useEffect(() => {
    panRef.current = pan;
  }, [pan]);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);
  useEffect(() => {
    roomCodeRef.current = roomCode;
  }, [roomCode]);
  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);
  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);
  useEffect(() => {
    userColorRef.current = userColor;
  }, [userColor]);
  const getAudioContext = useCallback(() => {
    if (!soundEnabledRef.current || typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);
  // Setup Fallback for <dialog closedby="any"> in browsers lacking native closedBy support (e.g. Safari)
  useEffect(() => {
    if (typeof window === 'undefined' || 'closedBy' in HTMLDialogElement.prototype) return;
    const dialogs = [roomDialogRef.current, boardsDialogRef.current, helpDialogRef.current].filter(
      (d): d is HTMLDialogElement => d !== null
    );
    const outside = (e: PointerEvent, dialog: HTMLDialogElement) => {
      const r = dialog.getBoundingClientRect();
      return (
        e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom
      );
    };
    const cleanups = dialogs.map((dialog) => {
      let pressedOutside = false;
      const onDown = (e: PointerEvent) => {
        pressedOutside = outside(e, dialog);
      };
      const onUp = (e: PointerEvent) => {
        if (pressedOutside && outside(e, dialog)) dialog.close();
      };
      dialog.addEventListener('pointerdown', onDown);
      dialog.addEventListener('pointerup', onUp);
      return () => {
        dialog.removeEventListener('pointerdown', onDown);
        dialog.removeEventListener('pointerup', onUp);
      };
    });
    return () => cleanups.forEach((fn) => fn());
  }, [isMounted]);
  // Convert client screen coordinates to infinite canvas world coordinates
  const screenToCanvas = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const offsetX = rect ? clientX - rect.left : clientX;
    const offsetY = rect ? clientY - rect.top : clientY;
    return {
      x: (offsetX - panRef.current.x) / zoomRef.current,
      y: (offsetY - panRef.current.y) / zoomRef.current,
    };
  }, []);
  const snapValue = useCallback(
    (val: number) => (snapToGrid ? Math.round(val / 16) * 16 : Math.round(val)),
    [snapToGrid]
  );
  // Load saved boards & user profile from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    myPeerIdRef.current = generateId('peer');
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEY_USER_PROFILE);
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (typeof parsed.name === 'string' && parsed.name.trim()) setUserName(parsed.name);
        if (VALID_COLORS.includes(parsed.color)) setUserColor(parsed.color);
      }
      const savedBoardsRaw = localStorage.getItem(STORAGE_KEY_BOARDS);
      const savedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE_BOARD);
      if (savedBoardsRaw) {
        const parsedBoards = JSON.parse(savedBoardsRaw) as ClarityBoard[];
        if (Array.isArray(parsedBoards) && parsedBoards.length > 0) {
          setBoards(parsedBoards);
          const target =
            parsedBoards.find((b) => b.id === savedActiveId) || parsedBoards[0];
          setActiveBoardId(target.id);
          setBoardTitle(target.name);
          setNodes(target.nodes);
          setEdges(target.edges);
        }
      }
    } catch (e) {
      console.error('Failed to load Clarity boards from localStorage:', e);
    }
  }, []);
  // Save current board to localStorage whenever nodes/edges/title change
  useEffect(() => {
    if (!isMounted) return;
    try {
      setBoards((prev) => {
        const updated = prev.map((b) =>
          b.id === activeBoardId
            ? { ...b, name: boardTitle, nodes, edges, updatedAt: Date.now() }
            : b
        );
        localStorage.setItem(STORAGE_KEY_BOARDS, JSON.stringify(updated));
        localStorage.setItem(STORAGE_KEY_ACTIVE_BOARD, activeBoardId);
        return updated;
      });
    } catch (e) {
      console.error('Failed to save Clarity state:', e);
    }
  }, [nodes, edges, boardTitle, activeBoardId, isMounted]);
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(
        STORAGE_KEY_USER_PROFILE,
        JSON.stringify({ name: userName, color: userColor })
      );
    } catch {
      // Ignore storage errors
    }
  }, [userName, userColor, isMounted]);
  // Broadcast board state over Supabase Realtime channel
  const broadcastBoardState = useCallback(
    (nextNodes: ClarityNode[], nextEdges: ClarityEdge[], nextTitle?: string) => {
      if (!roomCodeRef.current || !supabaseChannelRef.current || !isConnectedRef.current) return;
      supabaseChannelRef.current.send({
        type: 'broadcast',
        event: 'BOARD_STATE_SYNC',
        payload: {
          nodes: nextNodes,
          edges: nextEdges,
          boardTitle: nextTitle ?? boardTitle,
        },
      });
    },
    [boardTitle]
  );
  // Record history step and update state
  const commitGraphChange = useCallback(
    (
      nextNodes: ClarityNode[],
      nextEdges: ClarityEdge[],
      recordHistory = true
    ) => {
      if (recordHistory) {
        setPast((prev) => [
          ...prev.slice(-29),
          { nodes: nodesRef.current, edges: edgesRef.current },
        ]);
        setFuture([]);
      }
      setNodes(nextNodes);
      setEdges(nextEdges);
      broadcastBoardState(nextNodes, nextEdges);
    },
    [broadcastBoardState]
  );
  const handleUndo = useCallback(() => {
    setPast((prev) => {
      if (prev.length === 0) return prev;
      const previous = prev[prev.length - 1];
      setFuture((f) => [{ nodes: nodesRef.current, edges: edgesRef.current }, ...f.slice(0, 29)]);
      setNodes(previous.nodes);
      setEdges(previous.edges);
      broadcastBoardState(previous.nodes, previous.edges);
      return prev.slice(0, -1);
    });
  }, [broadcastBoardState]);
  const handleRedo = useCallback(() => {
    setFuture((prev) => {
      if (prev.length === 0) return prev;
      const next = prev[0];
      setPast((p) => [...p.slice(-29), { nodes: nodesRef.current, edges: edgesRef.current }]);
      setNodes(next.nodes);
      setEdges(next.edges);
      broadcastBoardState(next.nodes, next.edges);
      return prev.slice(1);
    });
  }, [broadcastBoardState]);
  // Supabase Realtime Room Connection
  const setupSupabaseRoom = useCallback(
    (code: string, isHost: boolean) => {
      const trimmed = code.trim();
      if (!isValidRoomCode(trimmed)) {
        alert('Invalid room code. Please use a valid Clarity room invite link or UUID.');
        return;
      }
      if (!supabase) {
        alert(
          'Supabase Realtime is not configured in this environment. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable online rooms.'
        );
        return;
      }
      setIsConnecting(true);
      if (supabaseChannelRef.current) {
        supabase.removeChannel(supabaseChannelRef.current);
        supabaseChannelRef.current = null;
      }
      const presenceKey = myPeerIdRef.current || generateId('peer');
      const channel = supabase.channel(`clarity-room-${trimmed}`, {
        config: {
          broadcast: { ack: false, self: false },
          presence: { key: presenceKey },
        },
      });
      supabaseChannelRef.current = channel;
      channel
        .on('broadcast', { event: 'BOARD_STATE_SYNC' }, ({ payload }) => {
          if (supabaseChannelRef.current !== channel || !payload) return;
          const validNodes = validateNodesPayload(payload.nodes);
          const validEdges = validateEdgesPayload(payload.edges);
          if (validNodes && validEdges) {
            setNodes(validNodes);
            setEdges(validEdges);
            if (typeof payload.boardTitle === 'string' && payload.boardTitle.length <= 100) {
              setBoardTitle(payload.boardTitle);
            }
          }
        })
        .on('broadcast', { event: 'CURSOR_MOVE' }, ({ payload }) => {
          if (supabaseChannelRef.current !== channel || !payload) return;
          if (
            typeof payload.peerId === 'string' &&
            typeof payload.x === 'number' &&
            Number.isFinite(payload.x) &&
            typeof payload.y === 'number' &&
            Number.isFinite(payload.y)
          ) {
            const safeColor = VALID_COLORS.includes(payload.color)
              ? COLOR_THEMES[payload.color as NodeColor].hex
              : '#06b6d4';
            const safeName =
              typeof payload.name === 'string'
                ? payload.name.slice(0, 32)
                : 'Collaborator';
            setRemoteCursors((prev) => ({
              ...prev,
              [payload.peerId]: {
                peerId: payload.peerId,
                name: safeName,
                color: safeColor,
                x: payload.x,
                y: payload.y,
                lastSeen: Date.now(),
              },
            }));
          }
        })
        .on('broadcast', { event: 'REQUEST_BOARD_SYNC' }, () => {
          if (supabaseChannelRef.current !== channel) return;
          channel.send({
            type: 'broadcast',
            event: 'BOARD_STATE_SYNC',
            payload: {
              nodes: nodesRef.current,
              edges: edgesRef.current,
              boardTitle,
            },
          });
        })
        .on('presence', { event: 'sync' }, () => {
          if (supabaseChannelRef.current !== channel) return;
          const state = channel.presenceState();
          const count = Object.keys(state).length;
          setPeerCount(Math.max(1, count));
        })
        .subscribe((status) => {
          if (supabaseChannelRef.current !== channel) return;
          if (status === 'SUBSCRIBED') {
            channel.track({
              online_at: new Date().toISOString(),
              name: userNameRef.current,
            });
            setRoomCode(trimmed);
            setIsConnected(true);
            setIsConnecting(false);
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href);
              url.searchParams.set('room', trimmed);
              window.history.replaceState(window.history.state, '', url.toString());
            }
            if (!isHost) {
              channel.send({
                type: 'broadcast',
                event: 'REQUEST_BOARD_SYNC',
                payload: {},
              });
            } else {
              channel.send({
                type: 'broadcast',
                event: 'BOARD_STATE_SYNC',
                payload: {
                  nodes: nodesRef.current,
                  edges: edgesRef.current,
                  boardTitle,
                },
              });
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            setIsConnected(false);
            setIsConnecting(false);
          }
        });
    },
    [boardTitle]
  );
  // Auto-join room from URL parameter `?room=...`
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam && isValidRoomCode(roomParam)) {
      const timer = setTimeout(() => {
        setupSupabaseRoom(roomParam, false);
      }, 0);
      return () => {
        clearTimeout(timer);
        if (supabaseChannelRef.current && supabase) {
          supabase.removeChannel(supabaseChannelRef.current);
          supabaseChannelRef.current = null;
        }
      };
    }
    return () => {
      if (supabaseChannelRef.current && supabase) {
        supabase.removeChannel(supabaseChannelRef.current);
        supabaseChannelRef.current = null;
      }
    };
  }, [setupSupabaseRoom]);
  // Prune stale remote cursors older than 12s
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setRemoteCursors((prev) => {
        const next: Record<string, CollaboratorCursor> = {};
        for (const [k, v] of Object.entries(prev)) {
          if (now - v.lastSeen < 12000) next[k] = v;
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isConnected]);
  const handleStartLiveRoom = () => {
    if (typeof window === 'undefined' || !window.crypto?.randomUUID) {
      alert('Secure UUID generation is unavailable in this browser.');
      return;
    }
    const newCode = window.crypto.randomUUID();
    setupSupabaseRoom(newCode, true);
  };
  const handleLeaveRoom = () => {
    if (supabaseChannelRef.current && supabase) {
      supabase.removeChannel(supabaseChannelRef.current);
      supabaseChannelRef.current = null;
    }
    setIsConnected(false);
    setRoomCode('');
    setPeerCount(1);
    setRemoteCursors({});
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('room');
      window.history.replaceState(window.history.state, '', url.toString());
    }
  };
  const copyRoomInviteLink = () => {
    if (typeof window === 'undefined' || !roomCode) return;
    const inviteUrl = `${window.location.origin}/clarity?room=${roomCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };
  // Add a new Node onto the canvas
  const addNode = useCallback(
    (
      shape: NodeShape = 'card',
      customCoords?: { x: number; y: number },
      presetColor?: NodeColor,
      presetTag?: string
    ) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      const centerClientX = rect ? rect.left + rect.width / 2 : 600;
      const centerClientY = rect ? rect.top + rect.height / 2 : 400;
      const worldCenter = customCoords ?? screenToCanvas(centerClientX, centerClientY);
      const defaultSizes: Record<NodeShape, { w: number; h: number }> = {
        card: { w: 290, h: 165 },
        sticky: { w: 220, h: 175 },
        pill: { w: 250, h: 105 },
        diamond: { w: 260, h: 165 },
        callout: { w: 260, h: 155 },
        banner: { w: 380, h: 82 },
      };
      const { w, h } = defaultSizes[shape];
      const maxZ = nodesRef.current.reduce((acc, n) => Math.max(acc, n.zIndex), 0);
      const defaultTitles: Record<NodeShape, string> = {
        card: 'New Argument / Point',
        sticky: 'Quick Note',
        pill: 'Core Topic / Outcome',
        diamond: 'Key Question?',
        callout: 'Side Take / Quote',
        banner: 'SECTION HEADER',
      };
      const newNode: ClarityNode = {
        id: generateId('node'),
        x: snapValue(worldCenter.x - w / 2 + (customCoords ? 0 : (Math.random() - 0.5) * 40)),
        y: snapValue(worldCenter.y - h / 2 + (customCoords ? 0 : (Math.random() - 0.5) * 40)),
        width: w,
        height: h,
        shape,
        color: presetColor ?? userColorRef.current,
        title: defaultTitles[shape],
        body:
          shape === 'banner'
            ? 'Subtitle or context'
            : 'Click to write details, notes, or evidence...',
        tag: presetTag,
        zIndex: maxZ + 1,
        updatedAt: Date.now(),
      };
      playPopSound(getAudioContext(), 540);
      const nextNodes = [...nodesRef.current, newNode];
      commitGraphChange(nextNodes, edgesRef.current);
      setSelectedNodeIds([newNode.id]);
      setSelectedEdgeId(null);
      return newNode;
    },
    [commitGraphChange, getAudioContext, screenToCanvas, snapValue]
  );
  // Quick-branch: create a connected child node right next to an existing node
  const branchFromNode = useCallback(
    (sourceNode: ClarityNode, relationLabel = 'Leads To', targetColor?: NodeColor) => {
      const maxZ = nodesRef.current.reduce((acc, n) => Math.max(acc, n.zIndex), 0);
      const newX = snapValue(sourceNode.x + sourceNode.width + 96);
      const newY = snapValue(sourceNode.y);
      const childNode: ClarityNode = {
        id: generateId('node'),
        x: newX,
        y: newY,
        width: sourceNode.shape === 'banner' ? 280 : sourceNode.width,
        height: sourceNode.shape === 'banner' ? 155 : sourceNode.height,
        shape: sourceNode.shape === 'banner' ? 'card' : sourceNode.shape,
        color: targetColor ?? sourceNode.color,
        title: 'Connected Point',
        body: 'Follow-up thought, rebuttal, or next step...',
        tag: sourceNode.tag,
        zIndex: maxZ + 1,
        updatedAt: Date.now(),
      };
      const newEdge: ClarityEdge = {
        id: generateId('edge'),
        fromNodeId: sourceNode.id,
        fromPort: 'right',
        toNodeId: childNode.id,
        toPort: 'left',
        label: relationLabel,
        color: targetColor ?? sourceNode.color,
        curve: 'bezier',
        style: 'solid',
      };
      playConnectSound(getAudioContext());
      commitGraphChange([...nodesRef.current, childNode], [...edgesRef.current, newEdge]);
      setSelectedNodeIds([childNode.id]);
      setSelectedEdgeId(null);
    },
    [commitGraphChange, getAudioContext, snapValue]
  );
  // Update a specific node's fields
  const updateNode = useCallback(
    (nodeId: string, patch: Partial<ClarityNode>, recordHistory = false) => {
      const nextNodes = nodesRef.current.map((n) =>
        n.id === nodeId ? { ...n, ...patch, updatedAt: Date.now() } : n
      );
      commitGraphChange(nextNodes, edgesRef.current, recordHistory);
    },
    [commitGraphChange]
  );
  // Delete selected nodes or edge
  const deleteSelected = useCallback(() => {
    if (selectedEdgeId) {
      const nextEdges = edgesRef.current.filter((e) => e.id !== selectedEdgeId);
      commitGraphChange(nodesRef.current, nextEdges, true);
      setSelectedEdgeId(null);
      return;
    }
    if (selectedNodeIds.length > 0) {
      const idSet = new Set(selectedNodeIds);
      const nextNodes = nodesRef.current.filter((n) => !idSet.has(n.id));
      const nextEdges = edgesRef.current.filter(
        (e) => !idSet.has(e.fromNodeId) && !idSet.has(e.toNodeId)
      );
      commitGraphChange(nextNodes, nextEdges, true);
      setSelectedNodeIds([]);
    }
  }, [commitGraphChange, selectedEdgeId, selectedNodeIds]);
  // Duplicate selected nodes
  const duplicateSelected = useCallback(() => {
    if (selectedNodeIds.length === 0) return;
    const maxZ = nodesRef.current.reduce((acc, n) => Math.max(acc, n.zIndex), 0);
    const clones: ClarityNode[] = [];
    selectedNodeIds.forEach((id, idx) => {
      const orig = nodesRef.current.find((n) => n.id === id);
      if (orig) {
        clones.push({
          ...orig,
          id: generateId('node'),
          x: orig.x + 32,
          y: orig.y + 32,
          checklist: orig.checklist
            ? orig.checklist.map((item) => ({ ...item, id: generateId('chk') }))
            : undefined,
          zIndex: maxZ + idx + 1,
          updatedAt: Date.now(),
        });
      }
    });
    if (clones.length > 0) {
      playPopSound(getAudioContext(), 620);
      commitGraphChange([...nodesRef.current, ...clones], edgesRef.current, true);
      setSelectedNodeIds(clones.map((c) => c.id));
    }
  }, [commitGraphChange, getAudioContext, selectedNodeIds]);
  // Fit all nodes cleanly into the viewport
  const fitToScreen = useCallback(() => {
    if (nodesRef.current.length === 0 || !canvasRef.current) {
      setPan({ x: 80, y: 40 });
      setZoom(1);
      return;
    }
    const rect = canvasRef.current.getBoundingClientRect();
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const n of nodesRef.current) {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + n.width);
      maxY = Math.max(maxY, n.y + n.height);
    }
    const contentW = Math.max(300, maxX - minX + 180);
    const contentH = Math.max(300, maxY - minY + 220);
    const nextZoom = Math.min(1.25, Math.max(0.25, Math.min(rect.width / contentW, rect.height / contentH)));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    setZoom(Number(nextZoom.toFixed(2)));
    setPan({
      x: Math.round(rect.width / 2 - centerX * nextZoom),
      y: Math.round(rect.height / 2 - centerY * nextZoom),
    });
  }, []);
  // Keyboard shortcuts (Undo, Redo, Delete, Spacebar Pan, Escape)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditingText =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (e.code === 'Space' && !isEditingText) {
        spacePressedRef.current = true;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !isEditingText) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y' && !isEditingText) {
        e.preventDefault();
        handleRedo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && !isEditingText) {
        e.preventDefault();
        duplicateSelected();
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isEditingText) {
        e.preventDefault();
        deleteSelected();
        return;
      }
      if (e.key === 'Escape') {
        setSelectedNodeIds([]);
        setSelectedEdgeId(null);
        setConnectingDraft(null);
        setShowSearchPanel(false);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spacePressedRef.current = false;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [deleteSelected, duplicateSelected, handleRedo, handleUndo]);
  // Mouse wheel zoom & trackpad pan on canvas
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;
      // Zoom around cursor position
      const zoomFactor = e.deltaY < 0 ? 1.09 : 0.91;
      const nextZoom = Math.min(2.4, Math.max(0.2, Number((zoomRef.current * zoomFactor).toFixed(3))));
      const worldX = (cursorX - panRef.current.x) / zoomRef.current;
      const worldY = (cursorY - panRef.current.y) / zoomRef.current;
      setZoom(nextZoom);
      setPan({
        x: cursorX - worldX * nextZoom,
        y: cursorY - worldY * nextZoom,
      });
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);
  // Canvas pointer handlers (Panning, Marquee box selection, String connection dragging, Live Cursor broadcast)
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only trigger when clicking directly on the canvas background or SVG layer
    const target = e.target as HTMLElement;
    const isBackground =
      target === canvasRef.current || target.dataset.canvasBg === 'true';
    // Middle mouse button or Spacebar or Hand tool -> Pan canvas
    if (e.button === 1 || spacePressedRef.current || toolMode === 'pan') {
      e.preventDefault();
      isPanningRef.current = {
        active: true,
        startClientX: e.clientX,
        startClientY: e.clientY,
        initialPanX: panRef.current.x,
        initialPanY: panRef.current.y,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }
    if (e.button === 0 && isBackground) {
      setSelectedNodeIds([]);
      setSelectedEdgeId(null);
      // Start selection marquee box
      const worldPos = screenToCanvas(e.clientX, e.clientY);
      setMarquee({
        startX: worldPos.x,
        startY: worldPos.y,
        currX: worldPos.x,
        currY: worldPos.y,
      });
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };
  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const worldPos = screenToCanvas(e.clientX, e.clientY);
    // Broadcast live cursor position to collaborators (throttled to ~45ms)
    if (isConnectedRef.current && supabaseChannelRef.current) {
      const now = Date.now();
      if (now - lastCursorBroadcastRef.current > 45) {
        lastCursorBroadcastRef.current = now;
        supabaseChannelRef.current.send({
          type: 'broadcast',
          event: 'CURSOR_MOVE',
          payload: {
            peerId: myPeerIdRef.current,
            name: userNameRef.current,
            color: userColorRef.current,
            x: Math.round(worldPos.x),
            y: Math.round(worldPos.y),
          },
        });
      }
    }
    // Active Canvas Pan
    if (isPanningRef.current.active) {
      const dx = e.clientX - isPanningRef.current.startClientX;
      const dy = e.clientY - isPanningRef.current.startClientY;
      setPan({
        x: isPanningRef.current.initialPanX + dx,
        y: isPanningRef.current.initialPanY + dy,
      });
      return;
    }
    // Active Connection String Pull
    if (connectingDraft) {
      setConnectingDraft((prev) =>
        prev ? { ...prev, currX: worldPos.x, currY: worldPos.y } : null
      );
      return;
    }
    // Active Selection Marquee
    if (marquee) {
      const nextMarquee = { ...marquee, currX: worldPos.x, currY: worldPos.y };
      setMarquee(nextMarquee);
      const minX = Math.min(nextMarquee.startX, nextMarquee.currX);
      const maxX = Math.max(nextMarquee.startX, nextMarquee.currX);
      const minY = Math.min(nextMarquee.startY, nextMarquee.currY);
      const maxY = Math.max(nextMarquee.startY, nextMarquee.currY);
      const insideIds = nodesRef.current
        .filter(
          (n) =>
            n.x + n.width >= minX &&
            n.x <= maxX &&
            n.y + n.height >= minY &&
            n.y <= maxY
        )
        .map((n) => n.id);
      setSelectedNodeIds(insideIds);
    }
  };
  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanningRef.current.active) {
      isPanningRef.current.active = false;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    }
    if (marquee) {
      setMarquee(null);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    }
    // If releasing a connection string in empty space, spawn a new node & connect it!
    if (connectingDraft) {
      const worldPos = screenToCanvas(e.clientX, e.clientY);
      const dist = Math.hypot(
        worldPos.x - connectingDraft.startX,
        worldPos.y - connectingDraft.startY
      );
      if (dist > 45) {
        const sourceNode = nodesRef.current.find((n) => n.id === connectingDraft.fromNodeId);
        const maxZ = nodesRef.current.reduce((acc, n) => Math.max(acc, n.zIndex), 0);
        const newNode: ClarityNode = {
          id: generateId('node'),
          x: snapValue(worldPos.x - 135),
          y: snapValue(worldPos.y - 75),
          width: 270,
          height: 155,
          shape: 'card',
          color: sourceNode?.color ?? userColorRef.current,
          title: 'Connected Point',
          body: 'Add your note, rebuttal, or follow-up point...',
          tag: sourceNode?.tag,
          zIndex: maxZ + 1,
          updatedAt: Date.now(),
        };
        const oppositePort: Record<PortSide, PortSide> = {
          top: 'bottom',
          bottom: 'top',
          left: 'right',
          right: 'left',
        };
        const newEdge: ClarityEdge = {
          id: generateId('edge'),
          fromNodeId: connectingDraft.fromNodeId,
          fromPort: connectingDraft.fromPort,
          toNodeId: newNode.id,
          toPort: oppositePort[connectingDraft.fromPort],
          label: 'Leads To',
          color: sourceNode?.color ?? userColorRef.current,
          curve: 'bezier',
          style: 'solid',
        };
        playConnectSound(getAudioContext());
        commitGraphChange([...nodesRef.current, newNode], [...edgesRef.current, newEdge], true);
        setSelectedNodeIds([newNode.id]);
        setSelectedEdgeId(newEdge.id);
      }
      setConnectingDraft(null);
    }
  };
  // Double-click on empty canvas spawns a node right at the cursor
  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target === canvasRef.current || target.dataset.canvasBg === 'true') {
      const coords = screenToCanvas(e.clientX, e.clientY);
      addNode('card', coords);
    }
  };
  // Dedicated Node Drag Handle Handlers (following modern-web-guidance `drag` guide)
  const handleNodeHandlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    node: ClarityNode
  ) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button, input, textarea, a')) return;
    e.stopPropagation();
    const isSelected = selectedNodeIds.includes(node.id);
    const activeIds = e.shiftKey
      ? isSelected
        ? selectedNodeIds.filter((id) => id !== node.id)
        : [...selectedNodeIds, node.id]
      : isSelected
        ? selectedNodeIds
        : [node.id];
    setSelectedNodeIds(activeIds);
    setSelectedEdgeId(null);
    // Bring dragged node to front
    const maxZ = nodesRef.current.reduce((acc, n) => Math.max(acc, n.zIndex), 0);
    setPast((prev) => [
      ...prev.slice(-29),
      { nodes: nodesRef.current, edges: edgesRef.current },
    ]);
    setFuture([]);
    const initialPositions: Record<string, { x: number; y: number }> = {};
    nodesRef.current.forEach((n) => {
      if (activeIds.includes(n.id)) {
        initialPositions[n.id] = { x: n.x, y: n.y };
      }
    });
    const startWorld = screenToCanvas(e.clientX, e.clientY);
    draggingNodeRef.current = {
      nodeId: node.id,
      pointerId: e.pointerId,
      startCanvasX: startWorld.x,
      startCanvasY: startWorld.y,
      initialPositions,
      hasMoved: false,
    };
    setNodes((prev) =>
      prev.map((n) => (n.id === node.id ? { ...n, zIndex: maxZ + 1 } : n))
    );
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handleNodeHandlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = draggingNodeRef.current;
    if (!drag || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const currWorld = screenToCanvas(e.clientX, e.clientY);
    const dx = currWorld.x - drag.startCanvasX;
    const dy = currWorld.y - drag.startCanvasY;
    if (!drag.hasMoved && Math.hypot(dx, dy) < 3) return;
    drag.hasMoved = true;
    const nextNodes = nodesRef.current.map((n) => {
      const initPos = drag.initialPositions[n.id];
      if (!initPos) return n;
      return {
        ...n,
        x: snapValue(initPos.x + dx),
        y: snapValue(initPos.y + dy),
        updatedAt: Date.now(),
      };
    });
    setNodes(nextNodes);
    broadcastBoardState(nextNodes, edgesRef.current);
  };
  const handleNodeHandleLostCapture = () => {
    draggingNodeRef.current = null;
  };
  // Keyboard arrow key movement when drag handle is focused
  const handleNodeHandleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    node: ClarityNode
  ) => {
    const step = e.shiftKey ? 4 : 16;
    let dx = 0;
    let dy = 0;
    if (e.key === 'ArrowLeft') dx = -step;
    else if (e.key === 'ArrowRight') dx = step;
    else if (e.key === 'ArrowUp') dy = -step;
    else if (e.key === 'ArrowDown') dy = step;
    else return;
    e.preventDefault();
    updateNode(node.id, { x: node.x + dx, y: node.y + dy }, true);
  };
  // Node Resize Handle
  const handleResizePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    node: ClarityNode
  ) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const startWorld = screenToCanvas(e.clientX, e.clientY);
    resizingNodeRef.current = {
      nodeId: node.id,
      pointerId: e.pointerId,
      startCanvasX: startWorld.x,
      startCanvasY: startWorld.y,
      initialWidth: node.width,
      initialHeight: node.height,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handleResizePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const res = resizingNodeRef.current;
    if (!res || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const currWorld = screenToCanvas(e.clientX, e.clientY);
    const dw = currWorld.x - res.startCanvasX;
    const dh = currWorld.y - res.startCanvasY;
    const nextW = Math.max(150, snapValue(res.initialWidth + dw));
    const nextH = Math.max(72, snapValue(res.initialHeight + dh));
    const nextNodes = nodesRef.current.map((n) =>
      n.id === res.nodeId ? { ...n, width: nextW, height: nextH } : n
    );
    setNodes(nextNodes);
    broadcastBoardState(nextNodes, edgesRef.current);
  };
  const handleResizeLostCapture = () => {
    resizingNodeRef.current = null;
  };
  // Start pulling a string connection from a node port
  const handlePortPointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    node: ClarityNode,
    port: PortSide
  ) => {
    e.stopPropagation();
    const coords = getPortCoordinates(node, port);
    setConnectingDraft({
      fromNodeId: node.id,
      fromPort: port,
      startX: coords.x,
      startY: coords.y,
      currX: coords.x,
      currY: coords.y,
    });
  };
  // Complete a string connection onto a target port or node
  const completeConnectionOnPort = (targetNode: ClarityNode, targetPort: PortSide) => {
    if (!connectingDraft || connectingDraft.fromNodeId === targetNode.id) {
      setConnectingDraft(null);
      return;
    }
    const exists = edgesRef.current.some(
      (edge) =>
        edge.fromNodeId === connectingDraft.fromNodeId &&
        edge.toNodeId === targetNode.id &&
        edge.fromPort === connectingDraft.fromPort &&
        edge.toPort === targetPort
    );
    if (!exists) {
      const sourceNode = nodesRef.current.find((n) => n.id === connectingDraft.fromNodeId);
      const newEdge: ClarityEdge = {
        id: generateId('edge'),
        fromNodeId: connectingDraft.fromNodeId,
        fromPort: connectingDraft.fromPort,
        toNodeId: targetNode.id,
        toPort: targetPort,
        label: 'Supports',
        color: sourceNode?.color ?? 'cyan',
        curve: 'bezier',
        style: 'solid',
      };
      playConnectSound(getAudioContext());
      commitGraphChange(nodesRef.current, [...edgesRef.current, newEdge], true);
      setSelectedEdgeId(newEdge.id);
      setSelectedNodeIds([]);
    }
    setConnectingDraft(null);
  };
  // Update an edge's properties
  const updateEdge = useCallback(
    (edgeId: string, patch: Partial<ClarityEdge>) => {
      const nextEdges = edgesRef.current.map((e) =>
        e.id === edgeId ? { ...e, ...patch } : e
      );
      commitGraphChange(nodesRef.current, nextEdges, true);
    },
    [commitGraphChange]
  );
  // Switch or Load Template / Board
  const handleLoadTemplate = (templateKey: string) => {
    const tpl = BOARD_TEMPLATES[templateKey];
    if (!tpl) return;
    const clonedNodes = tpl.nodes.map((n) => ({ ...n, id: `${n.id}-${Date.now().toString(36)}` }));
    const idMap = new Map<string, string>();
    tpl.nodes.forEach((n, i) => idMap.set(n.id, clonedNodes[i].id));
    const clonedEdges = tpl.edges.map((e) => ({
      ...e,
      id: generateId('edge'),
      fromNodeId: idMap.get(e.fromNodeId) ?? e.fromNodeId,
      toNodeId: idMap.get(e.toNodeId) ?? e.toNodeId,
    }));
    const newBoard: ClarityBoard = {
      id: generateId('board'),
      name: tpl.name,
      nodes: clonedNodes,
      edges: clonedEdges,
      updatedAt: Date.now(),
    };
    setBoards((prev) => [...prev, newBoard]);
    setActiveBoardId(newBoard.id);
    setBoardTitle(newBoard.name);
    commitGraphChange(clonedNodes, clonedEdges, false);
    setSelectedNodeIds([]);
    setSelectedEdgeId(null);
    boardsDialogRef.current?.close();
    setTimeout(() => fitToScreen(), 60);
  };
  const handleSwitchBoard = (board: ClarityBoard) => {
    setActiveBoardId(board.id);
    setBoardTitle(board.name);
    setNodes(board.nodes);
    setEdges(board.edges);
    setPast([]);
    setFuture([]);
    setSelectedNodeIds([]);
    setSelectedEdgeId(null);
    broadcastBoardState(board.nodes, board.edges, board.name);
    boardsDialogRef.current?.close();
  };
  const handleDeleteBoard = (boardId: string) => {
    if (boards.length <= 1) return;
    const remaining = boards.filter((b) => b.id !== boardId);
    setBoards(remaining);
    if (activeBoardId === boardId) {
      handleSwitchBoard(remaining[0]);
    }
  };
  // Export Board JSON
  const handleExportJson = () => {
    const data = JSON.stringify(
      {
        name: boardTitle,
        exportedAt: new Date().toISOString(),
        nodes,
        edges,
      },
      null,
      2
    );
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${boardTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'clarity-board'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  // Import Board JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const validNodes = validateNodesPayload(parsed.nodes);
        const validEdges = validateEdgesPayload(parsed.edges);
        if (validNodes && validEdges) {
          const importedName =
            typeof parsed.name === 'string' && parsed.name.trim()
              ? parsed.name.slice(0, 80)
              : 'Imported Board';
          setBoardTitle(importedName);
          commitGraphChange(validNodes, validEdges, true);
          setTimeout(() => fitToScreen(), 60);
        } else {
          alert('Invalid Clarity JSON file format.');
        }
      } catch {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
  // Export Canvas Snapshot as PNG Image
  const handleExportPng = () => {
    if (nodes.length === 0) return;
    const pad = 80;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    nodes.forEach((n) => {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + n.width);
      maxY = Math.max(maxY, n.y + n.height);
    });
    const width = Math.min(4000, Math.max(800, maxX - minX + pad * 2));
    const height = Math.min(4000, Math.max(600, maxY - minY + pad * 2));
    const offX = -minX + pad;
    const offY = -minY + pad;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Background
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, width, height);
    // Subtle Grid Dots
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    for (let gx = 0; gx < width; gx += 32) {
      for (let gy = 0; gy < height; gy += 32) {
        ctx.fillRect(gx, gy, 2, 2);
      }
    }
    // Draw Edges
    edges.forEach((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.fromNodeId);
      const toNode = nodes.find((n) => n.id === edge.toNodeId);
      if (!fromNode || !toNode) return;
      const p1 = getPortCoordinates(fromNode, edge.fromPort);
      const p2 = getPortCoordinates(toNode, edge.toPort);
      ctx.save();
      ctx.strokeStyle = COLOR_THEMES[edge.color].hex;
      ctx.lineWidth = 3;
      if (edge.style !== 'solid') ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(p1.x + offX, p1.y + offY);
      ctx.lineTo(p2.x + offX, p2.y + offY);
      ctx.stroke();
      if (edge.label) {
        const mx = (p1.x + p2.x) / 2 + offX;
        const my = (p1.y + p2.y) / 2 + offY;
        ctx.font = 'bold 12px sans-serif';
        const textW = ctx.measureText(edge.label).width + 16;
        ctx.fillStyle = '#0c1422';
        ctx.fillRect(mx - textW / 2, my - 12, textW, 24);
        ctx.strokeStyle = COLOR_THEMES[edge.color].hex;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
        ctx.strokeRect(mx - textW / 2, my - 12, textW, 24);
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(edge.label, mx, my);
      }
      ctx.restore();
    });
    // Draw Nodes
    nodes.forEach((node) => {
      const theme = COLOR_THEMES[node.color];
      const nx = node.x + offX;
      const ny = node.y + offY;
      ctx.save();
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = theme.hex;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(nx, ny, node.width, node.height, node.shape === 'pill' ? 40 : 16);
      ctx.fill();
      ctx.stroke();
      if (node.tag) {
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = theme.badgeText;
        ctx.fillText(node.tag.toUpperCase(), nx + 16, ny + 24);
      }
      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(node.title.slice(0, 38), nx + 16, ny + (node.tag ? 48 : 32));
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#94a3b8';
      const words = node.body.split(' ');
      let line = '';
      let ly = ny + (node.tag ? 72 : 56);
      for (const word of words) {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > node.width - 32) {
          ctx.fillText(line, nx + 16, ly);
          line = word + ' ';
          ly += 18;
          if (ly > ny + node.height - 14) break;
        } else {
          line = test;
        }
      }
      if (ly <= ny + node.height - 14) {
        ctx.fillText(line, nx + 16, ly);
      }
      ctx.restore();
    });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${boardTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'clarity'}.png`;
    a.click();
  };
  // Single selected node & edge references for the Inspector
  const primarySelectedNode = useMemo(
    () =>
      selectedNodeIds.length === 1
        ? nodes.find((n) => n.id === selectedNodeIds[0]) ?? null
        : null,
    [nodes, selectedNodeIds]
  );
  const selectedEdge = useMemo(
    () => (selectedEdgeId ? edges.find((e) => e.id === selectedEdgeId) ?? null : null),
    [edges, selectedEdgeId]
  );
  // Filtered nodes for Search / Tag jumper
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      const matchesTag = !activeTagFilter || n.tag === activeTagFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        (n.tag && n.tag.toLowerCase().includes(q));
      return matchesTag && matchesSearch;
    });
  }, [nodes, searchQuery, activeTagFilter]);
  const allUsedTags = useMemo(() => {
    const s = new Set<string>();
    nodes.forEach((n) => {
      if (n.tag) s.add(n.tag);
    });
    return Array.from(s);
  }, [nodes]);
  const focusOnNode = (node: ClarityNode) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const targetZoom = Math.max(0.85, zoomRef.current);
    setZoom(targetZoom);
    setPan({
      x: Math.round(rect.width / 2 - (node.x + node.width / 2) * targetZoom),
      y: Math.round(rect.height / 2 - (node.y + node.height / 2) * targetZoom),
    });
    setSelectedNodeIds([node.id]);
    setSelectedEdgeId(null);
  };
  return (
    <div className={styles.canvasRoot}>
      {/* Hidden JSON File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImportJson}
      />
      {/* TOP NAVIGATION & COLLABORATION BAR */}
      <header className="fixed top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Back to ZEDF, Board Switcher, Title Input */}
        <div className="flex items-center gap-2 bg-[#0c1422]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.6)] pointer-events-auto">
          <Link
            href="/"
            className="p-2 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-slate-800/70 transition-colors"
            title="Back to ZEDF Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="h-5 w-[1px] bg-slate-800" />
          <button
            type="button"
            onClick={() => boardsDialogRef.current?.showModal()}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/70 text-cyan-400 text-xs font-semibold transition-all"
            title="Switch Board or Load Template"
          >
            <FolderKanban className="w-4 h-4" />
            <span className="hidden sm:inline">Boards & Templates</span>
          </button>
          <input
            type="text"
            value={boardTitle}
            onChange={(e) => {
              setBoardTitle(e.target.value);
              broadcastBoardState(nodesRef.current, edgesRef.current, e.target.value);
            }}
            aria-label="Board Title"
            className="bg-transparent text-slate-100 font-bold text-sm sm:text-base px-2 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500/60 w-36 sm:w-52 truncate"
            placeholder="Untitled Board..."
          />
        </div>
        {/* Center/Right: Undo/Redo, Search, Export, Multiplayer Live Room */}
        <div className="flex items-center gap-2 bg-[#0c1422]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.6)] pointer-events-auto">
          <button
            type="button"
            onClick={handleUndo}
            disabled={past.length === 0}
            className="p-2 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-slate-800/70 disabled:opacity-35 disabled:pointer-events-none transition-colors"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={future.length === 0}
            className="p-2 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-slate-800/70 disabled:opacity-35 disabled:pointer-events-none transition-colors"
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />
          <button
            type="button"
            onClick={() => setShowSearchPanel((prev) => !prev)}
            className={`p-2 rounded-xl transition-colors ${
              showSearchPanel || activeTagFilter
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/70'
            }`}
            title="Find Points & Filter by Speaker/Tag"
            aria-label="Find Points and Filter"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleExportPng}
            className="p-2 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-slate-800/70 transition-colors hidden md:flex"
            title="Export Board as PNG Image"
            aria-label="Export Board as PNG Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleExportJson}
            className="p-2 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-slate-800/70 transition-colors hidden sm:flex"
            title="Save Backup (.json)"
            aria-label="Save JSON Backup"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-slate-800/70 transition-colors hidden sm:flex"
            title="Load Backup (.json)"
            aria-label="Import JSON Backup"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setSoundEnabled((s) => !s)}
            className="p-2 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-slate-800/70 transition-colors hidden sm:flex"
            title={soundEnabled ? 'Sound Effects On' : 'Sound Effects Muted'}
            aria-label="Toggle Sound Effects"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <InstallPwaButton className="hidden lg:inline-flex px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs text-cyan-300 font-medium" />
          {/* Live Multiplayer Button */}
          <button
            type="button"
            onClick={() => roomDialogRef.current?.showModal()}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isConnected
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
            }`}
          >
            {isConnected ? (
              <>
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                <span>Live ({peerCount})</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Multiplayer</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => helpDialogRef.current?.showModal()}
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800/70 transition-colors"
            title="Shortcuts & Guide"
            aria-label="Shortcuts and Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>
      {/* SEARCH & SPEAKER TAG FILTER DRAWER */}
      {showSearchPanel && (
        <aside className="fixed top-20 right-4 z-30 w-80 bg-[#0c1422]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" /> Find Points & Speakers
            </h3>
            <button
              type="button"
              onClick={() => setShowSearchPanel(false)}
              className="text-slate-400 hover:text-slate-200 p-1"
              aria-label="Close Search Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search claims, notes, tags..."
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 mb-3"
          />
          {allUsedTags.length > 0 && (
            <div className="mb-3">
              <div className="text-[11px] text-slate-400 mb-1.5">Filter by Tag / Speaker:</div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTagFilter(null)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                    activeTagFilter === null
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  All ({nodes.length})
                </button>
                {allUsedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveTagFilter((prev) => (prev === tag ? null : tag))}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                      activeTagFilter === tag
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
            {filteredNodes.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => focusOnNode(n)}
                className="w-full text-left p-2 rounded-xl bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 flex items-start gap-2 transition-colors"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                  style={{ backgroundColor: COLOR_THEMES[n.color].hex }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-100 truncate">{n.title}</div>
                  {n.tag && (
                    <span className="inline-block text-[10px] text-cyan-400 font-mono">
                      [{n.tag}]
                    </span>
                  )}
                  <p className="text-[11px] text-slate-400 truncate">{n.body}</p>
                </div>
              </button>
            ))}
            {filteredNodes.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">No matching nodes found.</p>
            )}
          </div>
        </aside>
      )}
      {/* LEFT FLOATING TOOLBOX PALETTE (Spawn Any Shape or Switch Tool) */}
      <aside className="fixed left-3 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1.5 bg-[#0c1422]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-2 shadow-[0_12px_35px_rgba(0,0,0,0.65)]">
        <button
          type="button"
          onClick={() => setToolMode('select')}
          className={`p-2.5 rounded-xl transition-all ${
            toolMode === 'select'
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-cyan-300'
          }`}
          title="Select & Move Tool (V)"
          aria-label="Select and Move Tool"
        >
          <MousePointer className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setToolMode('pan')}
          className={`p-2.5 rounded-xl transition-all ${
            toolMode === 'pan'
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-cyan-300'
          }`}
          title="Pan Hand Tool (Hold Spacebar or Middle Click)"
          aria-label="Pan Canvas Tool"
        >
          <Hand className="w-4 h-4" />
        </button>
        <div className="h-[1px] w-full bg-slate-800 my-0.5" />
        <button
          type="button"
          onClick={() => addNode('card')}
          className="p-2.5 rounded-xl text-cyan-400 hover:bg-slate-800/80 transition-colors flex flex-col items-center gap-0.5"
          title="Add Point / Note Card"
        >
          <CreditCard className="w-4 h-4" />
          <span className="text-[9px] font-semibold">Card</span>
        </button>
        <button
          type="button"
          onClick={() => addNode('sticky', undefined, 'amber')}
          className="p-2.5 rounded-xl text-amber-400 hover:bg-slate-800/80 transition-colors flex flex-col items-center gap-0.5"
          title="Add Sticky Note"
        >
          <StickyNote className="w-4 h-4" />
          <span className="text-[9px] font-semibold">Sticky</span>
        </button>
        <button
          type="button"
          onClick={() => addNode('pill', undefined, 'emerald')}
          className="p-2.5 rounded-xl text-emerald-400 hover:bg-slate-800/80 transition-colors flex flex-col items-center gap-0.5"
          title="Add Pill / Topic Capsule"
        >
          <CircleDot className="w-4 h-4" />
          <span className="text-[9px] font-semibold">Pill</span>
        </button>
        <button
          type="button"
          onClick={() => addNode('diamond', undefined, 'violet')}
          className="p-2.5 rounded-xl text-violet-400 hover:bg-slate-800/80 transition-colors flex flex-col items-center gap-0.5"
          title="Add Decision Diamond"
        >
          <Diamond className="w-4 h-4" />
          <span className="text-[9px] font-semibold">Decide</span>
        </button>
        <button
          type="button"
          onClick={() => addNode('callout', undefined, 'rose')}
          className="p-2.5 rounded-xl text-rose-400 hover:bg-slate-800/80 transition-colors flex flex-col items-center gap-0.5"
          title="Add Speech Callout / Side Take"
        >
          <MessageSquareQuote className="w-4 h-4" />
          <span className="text-[9px] font-semibold">Quote</span>
        </button>
        <button
          type="button"
          onClick={() => addNode('banner', undefined, 'blue')}
          className="p-2.5 rounded-xl text-blue-400 hover:bg-slate-800/80 transition-colors flex flex-col items-center gap-0.5"
          title="Add Section Header Banner"
        >
          <Flag className="w-4 h-4" />
          <span className="text-[9px] font-semibold">Banner</span>
        </button>
      </aside>
      {/* CONTEXTUAL INSPECTOR FOR SELECTED NODE */}
      {primarySelectedNode && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-30 flex flex-wrap items-center gap-2 bg-[#0c1422]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl px-3.5 py-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.75)] max-w-[95vw]">
          {/* Color Picker Swatches */}
          <div className="flex items-center gap-1 pr-2 border-r border-slate-800">
            {VALID_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => updateNode(primarySelectedNode.id, { color: c }, true)}
                className={`w-5 h-5 rounded-full transition-transform ${
                  primarySelectedNode.color === c
                    ? 'scale-125 ring-2 ring-white'
                    : 'opacity-75 hover:opacity-100 hover:scale-110'
                }`}
                style={{ backgroundColor: COLOR_THEMES[c].hex }}
                title={`Color: ${COLOR_THEMES[c].label}`}
                aria-label={`Set color ${COLOR_THEMES[c].label}`}
              />
            ))}
          </div>
          {/* Shape Switcher */}
          <div className="flex items-center gap-1 pr-2 border-r border-slate-800">
            {VALID_SHAPES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => updateNode(primarySelectedNode.id, { shape: s }, true)}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold capitalize transition-colors ${
                  primarySelectedNode.shape === s
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {/* Speaker / Role Tag Input + Presets */}
          <div className="flex items-center gap-1.5 pr-2 border-r border-slate-800">
            <Tag className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <input
              type="text"
              value={primarySelectedNode.tag ?? ''}
              onChange={(e) => updateNode(primarySelectedNode.id, { tag: e.target.value })}
              placeholder="Tag / Speaker..."
              list="clarity-quick-tags"
              className="bg-slate-900/90 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-100 w-28 focus:outline-none focus:border-cyan-400"
            />
            <datalist id="clarity-quick-tags">
              {QUICK_TAGS.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>
          {/* Add Checklist Item */}
          <button
            type="button"
            onClick={() => {
              const existing = primarySelectedNode.checklist ?? [];
              updateNode(
                primarySelectedNode.id,
                {
                  checklist: [
                    ...existing,
                    { id: generateId('chk'), text: 'Action or sub-point', done: false },
                  ],
                  height: Math.max(primarySelectedNode.height, 195),
                },
                true
              );
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors"
            title="Add Checklist Item to Node"
          >
            <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>+ Task</span>
          </button>
          {/* 1-Click Branch Node */}
          <button
            type="button"
            onClick={() => branchFromNode(primarySelectedNode, 'Supports')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs text-emerald-300 font-semibold transition-colors"
            title="Spawn Connected Point"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>+ Branch</span>
          </button>
          <button
            type="button"
            onClick={() => branchFromNode(primarySelectedNode, 'Rebuts / Counters', 'rose')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-xs text-rose-300 font-semibold transition-colors"
            title="Spawn Connected Counterpoint"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ Counter</span>
          </button>
          <button
            type="button"
            onClick={duplicateSelected}
            className="p-1.5 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
            title="Duplicate Node (Ctrl+D)"
            aria-label="Duplicate Node"
          >
            <CopyPlus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={deleteSelected}
            className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-colors"
            title="Delete Node (Del)"
            aria-label="Delete Node"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* CONTEXTUAL INSPECTOR FOR SELECTED STRING / CONNECTION */}
      {selectedEdge && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-30 flex flex-wrap items-center gap-2 bg-[#0c1422]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl px-3.5 py-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.75)] max-w-[95vw]">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider mr-1">
            String:
          </span>
          {/* Edge Label Input & Quick Presets */}
          <input
            type="text"
            value={selectedEdge.label ?? ''}
            onChange={(e) => updateEdge(selectedEdge.id, { label: e.target.value })}
            placeholder="Connection label..."
            list="clarity-edge-labels"
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 w-36 focus:outline-none focus:border-cyan-400"
          />
          <datalist id="clarity-edge-labels">
            {QUICK_EDGE_LABELS.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
          {/* Edge Color Swatches */}
          <div className="flex items-center gap-1 px-2 border-x border-slate-800">
            {VALID_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => updateEdge(selectedEdge.id, { color: c })}
                className={`w-4 h-4 rounded-full transition-transform ${
                  selectedEdge.color === c ? 'scale-125 ring-2 ring-white' : 'opacity-70'
                }`}
                style={{ backgroundColor: COLOR_THEMES[c].hex }}
                title={`String color: ${c}`}
                aria-label={`Set string color ${c}`}
              />
            ))}
          </div>
          {/* Curve Style */}
          <div className="flex items-center gap-1 pr-2 border-r border-slate-800">
            {VALID_CURVES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => updateEdge(selectedEdge.id, { curve: c })}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold capitalize ${
                  selectedEdge.curve === c
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          {/* Line Dash / Flow Style */}
          <div className="flex items-center gap-1 pr-2 border-r border-slate-800">
            {VALID_STYLES.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => updateEdge(selectedEdge.id, { style: st })}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold capitalize ${
                  selectedEdge.style === st
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          {/* Bidirectional Toggle */}
          <button
            type="button"
            onClick={() =>
              updateEdge(selectedEdge.id, { bidirectional: !selectedEdge.bidirectional })
            }
            className={`p-1.5 rounded-xl border text-xs transition-colors ${
              selectedEdge.bidirectional
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Two-Way Arrow"
            aria-label="Toggle Two-Way Arrow"
          >
            {selectedEdge.bidirectional ? (
              <ArrowLeftRight className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={deleteSelected}
            className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-colors"
            title="Remove String Connection"
            aria-label="Remove String Connection"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* BOTTOM ZOOM & GRID CONTROLS */}
      <footer className="fixed bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 bg-[#0c1422]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl px-2.5 py-1.5 shadow-lg pointer-events-auto">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.2, Number((z - 0.1).toFixed(2))))}
            className="p-1.5 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-slate-800/70"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="px-2 py-1 rounded-lg text-xs font-mono text-slate-200 hover:bg-slate-800/70"
            title="Reset Zoom to 100%"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.4, Number((z + 0.1).toFixed(2))))}
            className="p-1.5 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-slate-800/70"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-4 w-[1px] bg-slate-800 mx-0.5" />
          <button
            type="button"
            onClick={fitToScreen}
            className="p-1.5 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-slate-800/70"
            title="Fit All Nodes to Screen"
            aria-label="Fit All Nodes to Screen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setSnapToGrid((s) => !s)}
            className={`p-1.5 rounded-lg transition-colors ${
              snapToGrid
                ? 'text-cyan-400 bg-cyan-500/15'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title={snapToGrid ? 'Snap to Grid: ON' : 'Snap to Grid: OFF'}
            aria-label="Toggle Snap to Grid"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
        {/* Right Hint Pill */}
        <div className="hidden md:flex items-center gap-3 bg-[#0c1422]/85 backdrop-blur-md border border-slate-800/80 rounded-2xl px-3.5 py-1.5 text-[11px] text-slate-400 pointer-events-auto">
          <span>
            <strong className="text-slate-200">Double-click</strong> empty space to add node
          </span>
          <span>•</span>
          <span>
            <strong className="text-slate-200">Drag ports</strong> to string points together
          </span>
          <span>•</span>
          <span>
            <strong className="text-slate-200">Space + Drag</strong> to pan
          </span>
        </div>
      </footer>
      {/* INFINITE INTERACTIVE CANVAS SURFACE */}
      <div
        ref={canvasRef}
        data-canvas-bg="true"
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onDoubleClick={handleCanvasDoubleClick}
        className={`w-full h-full relative select-none ${styles.gridPattern} ${
          toolMode === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
        style={{
          backgroundPosition: `${pan.x}px ${pan.y}px`,
          backgroundSize: `${32 * zoom}px ${32 * zoom}px, ${128 * zoom}px ${128 * zoom}px, ${128 * zoom}px ${128 * zoom}px`,
        }}
      >
        {/* TRANSFORMED WORLD CONTAINER */}
        <div
          data-canvas-bg="true"
          className="absolute top-0 left-0 origin-top-left"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          }}
        >
          {/* SVG LAYER FOR STRINGS / CONNECTIONS */}
          <svg
            data-canvas-bg="true"
            className="overflow-visible pointer-events-none"
            width={1}
            height={1}
          >
            <defs>
              {VALID_COLORS.map((c) => (
                <React.Fragment key={c}>
                  <marker
                    id={`arrow-end-${c}`}
                    viewBox="0 0 10 10"
                    refX="7"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill={COLOR_THEMES[c].hex} />
                  </marker>
                </React.Fragment>
              ))}
            </defs>
            {edges.map((edge) => {
              const fromNode = nodes.find((n) => n.id === edge.fromNodeId);
              const toNode = nodes.find((n) => n.id === edge.toNodeId);
              if (!fromNode || !toNode) return null;
              const p1 = getPortCoordinates(fromNode, edge.fromPort);
              const p2 = getPortCoordinates(toNode, edge.toPort);
              const { path, midX, midY } = computeEdgePath(
                p1.x,
                p1.y,
                edge.fromPort,
                p2.x,
                p2.y,
                edge.toPort,
                edge.curve
              );
              const theme = COLOR_THEMES[edge.color];
              const isSelected = selectedEdgeId === edge.id;
              return (
                <g key={edge.id} className="pointer-events-auto">
                  {/* Wide Invisible Hit Path for easy clicking */}
                  <path
                    d={path}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={18}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEdgeId(edge.id);
                      setSelectedNodeIds([]);
                    }}
                  />
                  {/* Outer Glow when selected */}
                  {isSelected && (
                    <path
                      d={path}
                      fill="none"
                      stroke={theme.hex}
                      strokeWidth={7}
                      strokeOpacity={0.35}
                      strokeLinecap="round"
                    />
                  )}
                  {/* Visible Connection String */}
                  <path
                    d={path}
                    fill="none"
                    stroke={theme.hex}
                    strokeWidth={isSelected ? 3.5 : 2.5}
                    strokeDasharray={edge.style === 'dashed' ? '9 7' : undefined}
                    className={edge.style === 'animated' ? styles.animatedEdge : undefined}
                    markerEnd={`url(#arrow-end-${edge.color})`}
                    markerStart={
                      edge.bidirectional ? `url(#arrow-end-${edge.color})` : undefined
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEdgeId(edge.id);
                      setSelectedNodeIds([]);
                    }}
                  />
                  {/* Inline Pill Label on the String */}
                  {edge.label && (
                    <foreignObject
                      x={midX - 75}
                      y={midY - 14}
                      width={150}
                      height={28}
                      className="overflow-visible pointer-events-auto"
                    >
                      <div className="flex justify-center items-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEdgeId(edge.id);
                            setSelectedNodeIds([]);
                          }}
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap border shadow-md transition-transform hover:scale-105"
                          style={{
                            backgroundColor: '#0c1422',
                            borderColor: theme.hex,
                            color: theme.badgeText,
                          }}
                        >
                          {edge.label}
                        </button>
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
            {/* Active String Connection Draft Line */}
            {connectingDraft && (
              <path
                d={
                  computeEdgePath(
                    connectingDraft.startX,
                    connectingDraft.startY,
                    connectingDraft.fromPort,
                    connectingDraft.currX,
                    connectingDraft.currY,
                    'left',
                    'bezier'
                  ).path
                }
                fill="none"
                stroke="#22d3ee"
                strokeWidth={3}
                strokeDasharray="6 6"
              />
            )}
          </svg>
          {/* NODES LAYER */}
          {nodes.map((node) => {
            const theme = COLOR_THEMES[node.color];
            const isSelected = selectedNodeIds.includes(node.id);
            const isDimmed =
              (activeTagFilter && node.tag !== activeTagFilter) ||
              (searchQuery.trim() !== '' && !filteredNodes.some((fn) => fn.id === node.id));
            return (
              <div
                key={node.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (e.shiftKey) {
                    setSelectedNodeIds((prev) =>
                      prev.includes(node.id)
                        ? prev.filter((id) => id !== node.id)
                        : [...prev, node.id]
                    );
                  } else {
                    setSelectedNodeIds([node.id]);
                  }
                  setSelectedEdgeId(null);
                }}
                onPointerUp={() => {
                  if (connectingDraft && connectingDraft.fromNodeId !== node.id) {
                    completeConnectionOnPort(node, 'left');
                  }
                }}
                style={
                  {
                    transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
                    width: `${node.width}px`,
                    height: `${node.height}px`,
                    zIndex: node.zIndex,
                    '--node-border': theme.border,
                    '--node-bg': theme.bg,
                  } as React.CSSProperties
                }
                className={`absolute top-0 left-0 flex flex-col transition-opacity duration-150 ${
                  isDimmed ? 'opacity-30' : 'opacity-100'
                }`}
              >
                {/* SHAPE VISUAL CONTAINER */}
                <div
                  className={`relative w-full h-full flex flex-col overflow-hidden backdrop-blur-md transition-shadow ${
                    node.shape === 'pill'
                      ? 'rounded-full px-5 py-3 justify-center items-center text-center'
                      : node.shape === 'banner'
                        ? 'rounded-2xl px-5 py-2.5 justify-center'
                        : node.shape === 'sticky'
                          ? 'rounded-xl p-3.5'
                          : 'rounded-2xl p-3.5'
                  }`}
                  style={{
                    background:
                      node.shape === 'sticky'
                        ? theme.stickyBg
                        : node.shape === 'diamond'
                          ? 'transparent'
                          : theme.bg,
                    border:
                      node.shape === 'diamond'
                        ? 'none'
                        : `2px solid ${isSelected ? '#ffffff' : theme.border}`,
                    boxShadow: isSelected
                      ? `0 0 0 3px ${theme.hex}, 0 18px 40px -10px rgba(0,0,0,0.75)`
                      : `0 12px 28px -8px rgba(0,0,0,0.6), 0 0 18px ${theme.glow}`,
                  }}
                >
                  {/* Geometric Diamond Polygon Background when shape === 'diamond' */}
                  {node.shape === 'diamond' && (
                    <svg
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      className="absolute inset-0 w-full h-full pointer-events-none"
                    >
                      <polygon
                        points="50,3 97,50 50,97 3,50"
                        fill={theme.bg}
                        stroke={isSelected ? '#ffffff' : theme.border}
                        strokeWidth="2.5"
                      />
                    </svg>
                  )}
                  {/* Dedicated Accessible Drag Handle Bar */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={`Drag ${node.title || 'node'} or use arrow keys to move`}
                    onPointerDown={(e) => handleNodeHandlePointerDown(e, node)}
                    onPointerMove={handleNodeHandlePointerMove}
                    onLostPointerCapture={handleNodeHandleLostCapture}
                    onKeyDown={(e) => handleNodeHandleKeyDown(e, node)}
                    className={`relative z-10 flex items-center justify-between gap-2 pb-1.5 mb-1 ${styles.dragHandle}`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <GripHorizontal className="w-3.5 h-3.5 text-slate-400/80 shrink-0" />
                      {node.tag && (
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider truncate"
                          style={{
                            backgroundColor: theme.badgeBg,
                            color: theme.badgeText,
                          }}
                        >
                          {node.tag}
                        </span>
                      )}
                    </div>
                    {/* Quick 1-Click Branch Button on Card Header */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        branchFromNode(node);
                      }}
                      className="opacity-60 hover:opacity-100 p-0.5 rounded hover:bg-white/10 text-slate-200 transition-opacity"
                      title="Quick Branch (+ Connected Node)"
                      aria-label="Quick Branch Connected Node"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {/* Editable Node Content */}
                  <div
                    className={`relative z-10 flex-1 flex flex-col min-h-0 ${
                      node.shape === 'diamond' ? 'px-9 py-3 items-center text-center justify-center' : ''
                    }`}
                  >
                    <input
                      type="text"
                      value={node.title}
                      onChange={(e) => updateNode(node.id, { title: e.target.value })}
                      placeholder="Point title..."
                      className={`w-full bg-transparent text-slate-100 font-bold focus:outline-none placeholder-slate-500 ${
                        node.shape === 'banner'
                          ? 'text-lg tracking-wide uppercase'
                          : node.shape === 'pill' || node.shape === 'diamond'
                            ? 'text-sm text-center'
                            : 'text-sm'
                      }`}
                    />
                    {node.shape !== 'banner' && (
                      <textarea
                        value={node.body}
                        onChange={(e) => updateNode(node.id, { body: e.target.value })}
                        placeholder="Add notes, details, or evidence..."
                        className={`w-full flex-1 bg-transparent text-slate-300 text-xs leading-relaxed resize-none focus:outline-none mt-1 placeholder-slate-500 ${
                          node.shape === 'pill' || node.shape === 'diamond' ? 'text-center' : ''
                        }`}
                      />
                    )}
                    {/* Optional Interactive Checklist inside Node */}
                    {node.checklist && node.checklist.length > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-white/10 space-y-1 max-h-28 overflow-y-auto">
                        {node.checklist.map((item) => (
                          <div key={item.id} className="flex items-center gap-1.5 text-xs">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const updatedList = (node.checklist ?? []).map((c) =>
                                  c.id === item.id ? { ...c, done: !c.done } : c
                                );
                                updateNode(node.id, { checklist: updatedList }, true);
                              }}
                              className="text-cyan-400 hover:text-cyan-300 shrink-0"
                              aria-label={item.done ? 'Mark incomplete' : 'Mark complete'}
                            >
                              {item.done ? (
                                <CheckSquare className="w-3.5 h-3.5" />
                              ) : (
                                <Square className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <input
                              type="text"
                              value={item.text}
                              onChange={(e) => {
                                const updatedList = (node.checklist ?? []).map((c) =>
                                  c.id === item.id ? { ...c, text: e.target.value } : c
                                );
                                updateNode(node.id, { checklist: updatedList });
                              }}
                              className={`bg-transparent flex-1 text-xs focus:outline-none ${
                                item.done ? 'line-through text-slate-500' : 'text-slate-200'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const updatedList = (node.checklist ?? []).filter(
                                  (c) => c.id !== item.id
                                );
                                updateNode(node.id, { checklist: updatedList }, true);
                              }}
                              className="text-slate-500 hover:text-rose-400"
                              aria-label="Remove checklist item"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Resize Corner Grip */}
                  <div
                    onPointerDown={(e) => handleResizePointerDown(e, node)}
                    onPointerMove={handleResizePointerMove}
                    onLostPointerCapture={handleResizeLostCapture}
                    className="absolute bottom-1 right-1 w-4 h-4 cursor-nwse-resize opacity-40 hover:opacity-100 flex items-end justify-end p-0.5 z-20"
                    title="Drag to Resize"
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path
                        d="M7 1L1 7M7 4.5L4.5 7"
                        stroke="#cbd5e1"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
                {/* Speech Bubble Tail when shape === 'callout' */}
                {node.shape === 'callout' && <div className={styles.calloutTail} />}
                {/* 4 CONNECTION PORTS (Top, Right, Bottom, Left) */}
                {VALID_PORTS.map((port) => {
                  const posClasses: Record<PortSide, string> = {
                    top: '-top-2 left-1/2 -translate-x-1/2',
                    right: '-right-2 top-1/2 -translate-y-1/2',
                    bottom: '-bottom-2 left-1/2 -translate-x-1/2',
                    left: '-left-2 top-1/2 -translate-y-1/2',
                  };
                  return (
                    <button
                      key={port}
                      type="button"
                      onPointerDown={(e) => handlePortPointerDown(e, node, port)}
                      onPointerUp={(e) => {
                        e.stopPropagation();
                        completeConnectionOnPort(node, port);
                      }}
                      className={`absolute ${posClasses[port]} w-4 h-4 rounded-full border-2 border-slate-950 z-30 ${styles.portHandle}`}
                      style={{
                        backgroundColor: theme.hex,
                        color: theme.hex,
                      }}
                      title="Drag to connect string"
                      aria-label={`Connect from ${port} port`}
                    />
                  );
                })}
              </div>
            );
          })}
          {/* SELECTION MARQUEE BOX */}
          {marquee && (
            <div
              className="absolute border border-cyan-400 bg-cyan-500/15 pointer-events-none rounded"
              style={{
                left: Math.min(marquee.startX, marquee.currX),
                top: Math.min(marquee.startY, marquee.currY),
                width: Math.abs(marquee.currX - marquee.startX),
                height: Math.abs(marquee.currY - marquee.startY),
              }}
            />
          )}
          {/* LIVE REMOTE COLLABORATOR CURSORS */}
          {Object.values(remoteCursors).map((cursor) => (
            <div
              key={cursor.peerId}
              className="absolute top-0 left-0 pointer-events-none z-50 transition-transform duration-75"
              style={{
                transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={cursor.color}
                className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
              >
                <path
                  d="M4 3l16 7.5-7.5 2L9 20 4 3z"
                  stroke="#090d16"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                className="ml-3 -mt-1 inline-block px-2 py-0.5 rounded-full text-[11px] font-bold text-slate-950 shadow-md whitespace-nowrap"
                style={{ backgroundColor: cursor.color }}
              >
                {cursor.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* NATIVE MODAL DIALOG 1: LIVE MULTIPLAYER ROOMS */}
      <dialog
        ref={roomDialogRef}
        {...({ closedby: 'any' } as React.DialogHTMLAttributes<HTMLDialogElement>)}
        aria-labelledby="clarity-room-dialog-title"
        className={styles.modalDialog}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2
              id="clarity-room-dialog-title"
              className="text-lg font-bold text-slate-100 flex items-center gap-2"
            >
              <Users className="w-5 h-5 text-cyan-400" />
              Real-Time Multiplayer Relay
            </h2>
            <form method="dialog">
              <button
                type="submit"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                aria-label="Close Multiplayer Dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Collaborate simultaneously on two devices or online! Both people can drop points, connect
            strings, and see live cursors in real time.
          </p>
          {/* Identity / Speaker Tag Setup */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 mb-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Display Name / Speaker Tag
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Speaker A, Alex..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-300 mb-1.5">
                Your Default Node & Cursor Color
              </span>
              <div className="flex items-center gap-2">
                {VALID_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setUserColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      userColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: COLOR_THEMES[c].hex }}
                    aria-label={`Select cursor color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>
          {isConnected ? (
            <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  Connected • {peerCount} {peerCount === 1 ? 'person' : 'people'} in room
                </span>
                <button
                  type="button"
                  onClick={handleLeaveRoom}
                  className="text-xs text-rose-400 hover:underline font-semibold"
                >
                  Disconnect
                </button>
              </div>
              <div className="text-xs font-mono bg-slate-950/90 border border-slate-800 rounded-lg p-2.5 text-slate-300 break-all">
                {roomCode}
              </div>
              <button
                type="button"
                onClick={copyRoomInviteLink}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" /> Copied Shareable Invite Link!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy Shareable Room Link
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleStartLiveRoom}
                disabled={isConnecting}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
              >
                <Sparkles className="w-4 h-4" />
                {isConnecting ? 'Starting Live Room...' : 'Host New Live Room'}
              </button>
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800" />
                <span className="flex-shrink mx-3 text-[11px] uppercase text-slate-500 font-semibold">
                  Or Join Existing Room
                </span>
                <div className="flex-grow border-t border-slate-800" />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  placeholder="Paste Room UUID Code..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setupSupabaseRoom(joinCodeInput, false)}
                  disabled={!joinCodeInput.trim() || isConnecting}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-cyan-300 transition-colors"
                >
                  Join
                </button>
              </div>
            </div>
          )}
        </div>
      </dialog>
      {/* NATIVE MODAL DIALOG 2: BOARDS & TEMPLATES */}
      <dialog
        ref={boardsDialogRef}
        {...({ closedby: 'any' } as React.DialogHTMLAttributes<HTMLDialogElement>)}
        aria-labelledby="clarity-boards-dialog-title"
        className={styles.modalDialog}
      >
        <div className="p-6 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2
              id="clarity-boards-dialog-title"
              className="text-lg font-bold text-slate-100 flex items-center gap-2"
            >
              <FolderKanban className="w-5 h-5 text-cyan-400" />
              Your Local Boards & Starter Templates
            </h2>
            <form method="dialog">
              <button
                type="submit"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                aria-label="Close Boards Dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </div>
          {/* Saved Local Boards */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Saved Local Boards ({boards.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {boards.map((b) => (
                <div
                  key={b.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    b.id === activeBoardId
                      ? 'bg-cyan-950/40 border-cyan-500/50'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSwitchBoard(b)}
                    className="flex-1 text-left"
                  >
                    <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      {b.name}
                      {b.id === activeBoardId && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {b.nodes.length} nodes • {b.edges.length} strings
                    </div>
                  </button>
                  {boards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteBoard(b.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400"
                      title="Delete Board"
                      aria-label={`Delete board ${b.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Create New Board from Template */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2.5">
              Create New Board from Template
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.entries(BOARD_TEMPLATES).map(([key, tpl]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleLoadTemplate(key)}
                  className="text-left p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 transition-all group"
                >
                  <div className="text-sm font-bold text-slate-100 group-hover:text-cyan-300">
                    {tpl.name}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tpl.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </dialog>
      {/* NATIVE MODAL DIALOG 3: HELP & KEYBOARD SHORTCUTS */}
      <dialog
        ref={helpDialogRef}
        {...({ closedby: 'any' } as React.DialogHTMLAttributes<HTMLDialogElement>)}
        aria-labelledby="clarity-help-dialog-title"
        className={styles.modalDialog}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2
              id="clarity-help-dialog-title"
              className="text-lg font-bold text-slate-100 flex items-center gap-2"
            >
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              Clarity Playground Guide & Shortcuts
            </h2>
            <form method="dialog">
              <button
                type="submit"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                aria-label="Close Help Dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </div>
          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <strong className="text-cyan-300 block mb-1">
                1. Creating & Connecting Nodes ("Strings")
              </strong>
              Double-click anywhere on the canvas to drop a card, or pick any shape from the left
              toolbar. Drag from any of the 4 colored circle ports on a node to connect it to
              another node—or release in empty space to automatically spawn a linked point!
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <strong className="text-emerald-300 block mb-1">
                2. Customizing Shapes, Colors & Labels
              </strong>
              Click any node to change its color, shape (Card, Sticky, Pill, Decision Diamond,
              Quote Callout, Banner), or Speaker Tag. Click any connecting string to label it (e.g.,{' '}
              <em>Rebuts</em>, <em>Supports</em>, <em>Side Tangent</em>) or animate it.
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                <span className="text-cyan-400">Space + Drag</span> : Pan Canvas
              </div>
              <div className="bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                <span className="text-cyan-400">Mouse Wheel</span> : Zoom In/Out
              </div>
              <div className="bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                <span className="text-cyan-400">Ctrl + Z / Y</span> : Undo / Redo
              </div>
              <div className="bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                <span className="text-cyan-400">Ctrl + D</span> : Duplicate
              </div>
              <div className="bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                <span className="text-cyan-400">Del / Backspace</span> : Delete
              </div>
              <div className="bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                <span className="text-cyan-400">Arrow Keys</span> : Nudge Node
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
