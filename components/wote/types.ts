export type NodeType = 
  | 'text' 
  | 'heading1' 
  | 'heading2' 
  | 'heading3' 
  | 'todo' 
  | 'code' 
  | 'markdown' 
  | 'quote' 
  | 'callout' 
  | 'image' 
  | 'divider';

export type CalloutType = 'info' | 'warning' | 'tip' | 'success';

export interface NoteNode {
  id: string;
  type: NodeType;
  content: string;
  children: NoteNode[];
  collapsed?: boolean;
  checked?: boolean;
  imageUrl?: string;
  language?: string;
  calloutType?: CalloutType;
  isEditing?: boolean;
}

export interface SerializedNode {
  i: string;
  t: NodeType;
  c: string;
  ch: SerializedNode[];
  cl?: boolean;
  ck?: boolean;
  u?: string;
  l?: string;
  co?: CalloutType;
}

export interface SerializedWoteFile {
  v: number;
  title: string;
  nodes: SerializedNode[];
  updatedAt?: number;
}

export interface WoteDoc {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  nodes: NoteNode[];
}

export type ThemeType = 'willow' | 'dark' | 'light';
