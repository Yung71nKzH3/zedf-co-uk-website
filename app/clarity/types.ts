export type NodeShape = 'card' | 'sticky' | 'pill' | 'diamond' | 'callout' | 'banner';

export type NodeColor =
  | 'cyan'
  | 'emerald'
  | 'rose'
  | 'amber'
  | 'violet'
  | 'blue'
  | 'orange'
  | 'slate';

export type PortSide = 'top' | 'right' | 'bottom' | 'left';

export type EdgeCurve = 'bezier' | 'straight' | 'step';
export type EdgeStyle = 'solid' | 'dashed' | 'animated';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ClarityNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: NodeShape;
  color: NodeColor;
  title: string;
  body: string;
  tag?: string;
  checklist?: ChecklistItem[];
  zIndex: number;
  updatedAt: number;
}

export interface ClarityEdge {
  id: string;
  fromNodeId: string;
  fromPort: PortSide;
  toNodeId: string;
  toPort: PortSide;
  label?: string;
  color: NodeColor;
  curve: EdgeCurve;
  style: EdgeStyle;
  bidirectional?: boolean;
}

export interface ClarityBoard {
  id: string;
  name: string;
  nodes: ClarityNode[];
  edges: ClarityEdge[];
  updatedAt: number;
}

export interface CollaboratorCursor {
  peerId: string;
  name: string;
  color: string;
  x: number;
  y: number;
  lastSeen: number;
}

export interface ColorThemeConfig {
  id: NodeColor;
  label: string;
  hex: string;
  bg: string;
  border: string;
  glow: string;
  badgeBg: string;
  badgeText: string;
  stickyBg: string;
}

export const COLOR_THEMES: Record<NodeColor, ColorThemeConfig> = {
  cyan: {
    id: 'cyan',
    label: 'Cyan',
    hex: '#06b6d4',
    bg: 'rgba(8, 35, 52, 0.88)',
    border: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.28)',
    badgeBg: 'rgba(6, 182, 212, 0.18)',
    badgeText: '#67e8f9',
    stickyBg: 'linear-gradient(145deg, rgba(8, 51, 68, 0.95), rgba(6, 34, 48, 0.95))',
  },
  emerald: {
    id: 'emerald',
    label: 'Emerald',
    hex: '#10b981',
    bg: 'rgba(6, 40, 32, 0.88)',
    border: '#10b981',
    glow: 'rgba(16, 185, 129, 0.28)',
    badgeBg: 'rgba(16, 185, 129, 0.18)',
    badgeText: '#6ee7b7',
    stickyBg: 'linear-gradient(145deg, rgba(6, 59, 44, 0.95), rgba(5, 38, 29, 0.95))',
  },
  rose: {
    id: 'rose',
    label: 'Rose',
    hex: '#f43f5e',
    bg: 'rgba(48, 12, 26, 0.88)',
    border: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.28)',
    badgeBg: 'rgba(244, 63, 94, 0.18)',
    badgeText: '#fda4af',
    stickyBg: 'linear-gradient(145deg, rgba(68, 15, 34, 0.95), rgba(45, 10, 23, 0.95))',
  },
  amber: {
    id: 'amber',
    label: 'Amber',
    hex: '#f59e0b',
    bg: 'rgba(48, 30, 8, 0.88)',
    border: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.28)',
    badgeBg: 'rgba(245, 158, 11, 0.2)',
    badgeText: '#fcd34d',
    stickyBg: 'linear-gradient(145deg, rgba(69, 42, 10, 0.95), rgba(46, 28, 7, 0.95))',
  },
  violet: {
    id: 'violet',
    label: 'Violet',
    hex: '#8b5cf6',
    bg: 'rgba(30, 16, 56, 0.88)',
    border: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.28)',
    badgeBg: 'rgba(139, 92, 246, 0.2)',
    badgeText: '#c4b5fd',
    stickyBg: 'linear-gradient(145deg, rgba(46, 22, 84, 0.95), rgba(29, 14, 54, 0.95))',
  },
  blue: {
    id: 'blue',
    label: 'Blue',
    hex: '#3b82f6',
    bg: 'rgba(12, 28, 58, 0.88)',
    border: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.28)',
    badgeBg: 'rgba(59, 130, 246, 0.2)',
    badgeText: '#93c5fd',
    stickyBg: 'linear-gradient(145deg, rgba(18, 41, 82, 0.95), rgba(11, 25, 51, 0.95))',
  },
  orange: {
    id: 'orange',
    label: 'Orange',
    hex: '#f97316',
    bg: 'rgba(50, 22, 8, 0.88)',
    border: '#f97316',
    glow: 'rgba(249, 115, 22, 0.28)',
    badgeBg: 'rgba(249, 115, 22, 0.2)',
    badgeText: '#fdba74',
    stickyBg: 'linear-gradient(145deg, rgba(72, 30, 10, 0.95), rgba(45, 19, 7, 0.95))',
  },
  slate: {
    id: 'slate',
    label: 'Slate',
    hex: '#94a3b8',
    bg: 'rgba(19, 28, 46, 0.9)',
    border: '#64748b',
    glow: 'rgba(148, 163, 184, 0.2)',
    badgeBg: 'rgba(100, 116, 139, 0.25)',
    badgeText: '#cbd5e1',
    stickyBg: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))',
  },
};

export const QUICK_TAGS = [
  'Root Point',
  'Speaker A',
  'Speaker B',
  'Counterpoint',
  'Supporting Point',
  'Side Tangent',
  'Evidence / Fact',
  'Question',
  'Agreed / Resolved',
  'Action Item',
];

export const QUICK_EDGE_LABELS = [
  'Supports',
  'Rebuts / Counters',
  'Side Tangent',
  'Clarifies',
  'Evidence For',
  'Agreed On',
  'Leads To',
  'Depends On',
];

export const BOARD_TEMPLATES: Record<
  string,
  { name: string; description: string; nodes: ClarityNode[]; edges: ClarityEdge[] }
> = {
  debate: {
    name: 'Debate & Point Tracker',
    description: 'Keep the original root point anchored while mapping claims, rebuttals, side tangents, and common ground.',
    nodes: [
      {
        id: 'node-root',
        x: 380,
        y: 60,
        width: 340,
        height: 150,
        shape: 'card',
        color: 'cyan',
        title: 'Original Core Topic / Question',
        body: 'Write the main topic here so neither side loses track of what you actually started discussing!',
        tag: 'Root Point',
        zIndex: 1,
        updatedAt: 1,
      },
      {
        id: 'node-p1',
        x: 90,
        y: 280,
        width: 290,
        height: 165,
        shape: 'card',
        color: 'emerald',
        title: 'First Main Argument',
        body: 'Drag from any circle port on a node to string connections together. Click any text to edit inline.',
        tag: 'Speaker A',
        zIndex: 2,
        updatedAt: 2,
      },
      {
        id: 'node-p2',
        x: 690,
        y: 280,
        width: 290,
        height: 165,
        shape: 'card',
        color: 'rose',
        title: 'Direct Counter-Take',
        body: 'Color-coordinate points by speaker or stance so you can see the whole conversation structure at a glance.',
        tag: 'Speaker B',
        zIndex: 3,
        updatedAt: 3,
      },
      {
        id: 'node-tangent',
        x: 1030,
        y: 290,
        width: 230,
        height: 155,
        shape: 'sticky',
        color: 'amber',
        title: 'Side Tangent!',
        body: 'Park side-takes here so they are not forgotten, without derailing the main thread.',
        tag: 'Side Tangent',
        zIndex: 4,
        updatedAt: 4,
      },
      {
        id: 'node-agreed',
        x: 395,
        y: 510,
        width: 310,
        height: 135,
        shape: 'pill',
        color: 'violet',
        title: 'Common Ground / Resolution',
        body: 'Link both sides into a shared conclusion or compromise!',
        tag: 'Agreed / Resolved',
        zIndex: 5,
        updatedAt: 5,
      },
    ],
    edges: [
      {
        id: 'edge-1',
        fromNodeId: 'node-root',
        fromPort: 'bottom',
        toNodeId: 'node-p1',
        toPort: 'top',
        label: 'Supports',
        color: 'emerald',
        curve: 'bezier',
        style: 'solid',
      },
      {
        id: 'edge-2',
        fromNodeId: 'node-root',
        fromPort: 'bottom',
        toNodeId: 'node-p2',
        toPort: 'top',
        label: 'Rebuts / Counters',
        color: 'rose',
        curve: 'bezier',
        style: 'dashed',
      },
      {
        id: 'edge-3',
        fromNodeId: 'node-p2',
        fromPort: 'right',
        toNodeId: 'node-tangent',
        toPort: 'left',
        label: 'Side Tangent',
        color: 'amber',
        curve: 'bezier',
        style: 'animated',
      },
      {
        id: 'edge-4',
        fromNodeId: 'node-p1',
        fromPort: 'bottom',
        toNodeId: 'node-agreed',
        toPort: 'left',
        label: 'Agreed On',
        color: 'violet',
        curve: 'bezier',
        style: 'solid',
      },
      {
        id: 'edge-5',
        fromNodeId: 'node-p2',
        fromPort: 'bottom',
        toNodeId: 'node-agreed',
        toPort: 'right',
        label: 'Agreed On',
        color: 'violet',
        curve: 'bezier',
        style: 'solid',
      },
    ],
  },
  flowchart: {
    name: 'System & Decision Flowchart',
    description: 'Clean geometric shapes, decision diamonds, and directional arrows for mapping processes or architectures.',
    nodes: [
      {
        id: 'fc-start',
        x: 420,
        y: 60,
        width: 240,
        height: 95,
        shape: 'pill',
        color: 'cyan',
        title: 'Start Process',
        body: 'User triggers workflow or proposal',
        tag: 'Entry',
        zIndex: 1,
        updatedAt: 1,
      },
      {
        id: 'fc-decision',
        x: 400,
        y: 230,
        width: 280,
        height: 170,
        shape: 'diamond',
        color: 'amber',
        title: 'Meets Criteria?',
        body: 'Evaluate speed, cost & clarity',
        tag: 'Decision',
        zIndex: 2,
        updatedAt: 2,
      },
      {
        id: 'fc-yes',
        x: 110,
        y: 460,
        width: 260,
        height: 140,
        shape: 'card',
        color: 'emerald',
        title: 'Ship to Production',
        body: 'Deploy immediately and monitor metrics.',
        tag: 'Approved',
        zIndex: 3,
        updatedAt: 3,
      },
      {
        id: 'fc-no',
        x: 710,
        y: 460,
        width: 260,
        height: 140,
        shape: 'callout',
        color: 'rose',
        title: 'Iterate & Refine',
        body: 'Gather feedback and revise the prototype.',
        tag: 'Needs Work',
        zIndex: 4,
        updatedAt: 4,
      },
    ],
    edges: [
      {
        id: 'fc-e1',
        fromNodeId: 'fc-start',
        fromPort: 'bottom',
        toNodeId: 'fc-decision',
        toPort: 'top',
        label: 'Leads To',
        color: 'cyan',
        curve: 'step',
        style: 'solid',
      },
      {
        id: 'fc-e2',
        fromNodeId: 'fc-decision',
        fromPort: 'left',
        toNodeId: 'fc-yes',
        toPort: 'top',
        label: 'Yes',
        color: 'emerald',
        curve: 'step',
        style: 'solid',
      },
      {
        id: 'fc-e3',
        fromNodeId: 'fc-decision',
        fromPort: 'right',
        toNodeId: 'fc-no',
        toPort: 'top',
        label: 'No',
        color: 'rose',
        curve: 'step',
        style: 'dashed',
      },
    ],
  },
  brainstorm: {
    name: 'Freeform Idea Playground',
    description: 'Sticky notes, checklists, banners, and callouts for rapid solo or collaborative brainstorming.',
    nodes: [
      {
        id: 'bs-banner',
        x: 320,
        y: 40,
        width: 440,
        height: 80,
        shape: 'banner',
        color: 'violet',
        title: 'PROJECT BRAINSTORM PLAYGROUND',
        body: 'Drop anything anywhere — zero friction',
        zIndex: 1,
        updatedAt: 1,
      },
      {
        id: 'bs-center',
        x: 390,
        y: 190,
        width: 300,
        height: 185,
        shape: 'card',
        color: 'cyan',
        title: 'Launch Checklist',
        body: 'Track key tasks right inside any card:',
        tag: 'Action Item',
        checklist: [
          { id: 'c1', text: 'Create infinite node canvas', done: true },
          { id: 'c2', text: 'Connect strings between points', done: true },
          { id: 'c3', text: 'Invite a friend via Live Room', done: false },
        ],
        zIndex: 2,
        updatedAt: 2,
      },
      {
        id: 'bs-s1',
        x: 90,
        y: 200,
        width: 220,
        height: 170,
        shape: 'sticky',
        color: 'amber',
        title: 'Quick Sticky',
        body: 'Double-click anywhere on the empty background to spawn a new node instantly!',
        zIndex: 3,
        updatedAt: 3,
      },
      {
        id: 'bs-s2',
        x: 770,
        y: 200,
        width: 240,
        height: 170,
        shape: 'callout',
        color: 'emerald',
        title: 'Hot Take / Quote',
        body: 'Use speech bubble callouts to highlight memorable quotes or key takeaways.',
        tag: 'Highlight',
        zIndex: 4,
        updatedAt: 4,
      },
    ],
    edges: [
      {
        id: 'bs-e1',
        fromNodeId: 'bs-s1',
        fromPort: 'right',
        toNodeId: 'bs-center',
        toPort: 'left',
        label: 'Idea',
        color: 'amber',
        curve: 'bezier',
        style: 'animated',
      },
      {
        id: 'bs-e2',
        fromNodeId: 'bs-center',
        fromPort: 'right',
        toNodeId: 'bs-s2',
        toPort: 'left',
        label: 'Outcome',
        color: 'emerald',
        curve: 'bezier',
        style: 'solid',
      },
    ],
  },
  blank: {
    name: 'Blank Playground',
    description: 'Start with a completely clean infinite canvas.',
    nodes: [],
    edges: [],
  },
};
