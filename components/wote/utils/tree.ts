import { NoteNode, SerializedNode, SerializedWoteFile, NodeType, CalloutType } from '../types';

export const generateId = (): string => Math.random().toString(36).substring(2, 11);

export interface NodeLocation {
  node: NoteNode;
  parent: NoteNode[];
  index: number;
  parentNode: NoteNode | null;
}

export const cloneTree = (nodes: NoteNode[]): NoteNode[] => {
  return JSON.parse(JSON.stringify(nodes));
};

export const findNodeLocation = (
  nodes: NoteNode[],
  id: string,
  parentNode: NoteNode | null = null
): NodeLocation | null => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.id === id) {
      return { node, parent: nodes, index: i, parentNode };
    }
    if (node.children && node.children.length > 0) {
      const found = findNodeLocation(node.children, id, node);
      if (found) return found;
    }
  }
  return null;
};

export const findNodeById = (nodes: NoteNode[], id: string): NoteNode | null => {
  const loc = findNodeLocation(nodes, id);
  return loc ? loc.node : null;
};

export const findPathToNode = (nodes: NoteNode[], id: string): NoteNode[] => {
  const path: NoteNode[] = [];
  const search = (current: NoteNode[]): boolean => {
    for (const node of current) {
      path.push(node);
      if (node.id === id) return true;
      if (node.children && node.children.length > 0) {
        if (search(node.children)) return true;
      }
      path.pop();
    }
    return false;
  };
  search(nodes);
  return path;
};

export const getFlatVisibleNodeIds = (nodes: NoteNode[], zoomRootId?: string | null): string[] => {
  let rootList = nodes;
  if (zoomRootId) {
    const zoomNode = findNodeById(nodes, zoomRootId);
    if (zoomNode) {
      rootList = [zoomNode];
    }
  }

  const ids: string[] = [];
  const traverse = (list: NoteNode[]) => {
    for (const node of list) {
      ids.push(node.id);
      if (!node.collapsed && node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  };
  traverse(rootList);
  return ids;
};

export const addSibling = (
  nodes: NoteNode[],
  targetId: string,
  newNode: NoteNode
): NoteNode[] => {
  const tree = cloneTree(nodes);
  const loc = findNodeLocation(tree, targetId);
  if (loc) {
    loc.parent.splice(loc.index + 1, 0, newNode);
    return tree;
  }
  return [...tree, newNode];
};

export const addChild = (
  nodes: NoteNode[],
  parentId: string,
  newNode: NoteNode
): NoteNode[] => {
  const tree = cloneTree(nodes);
  const loc = findNodeLocation(tree, parentId);
  if (loc) {
    loc.node.children = loc.node.children || [];
    loc.node.children.push(newNode);
    loc.node.collapsed = false;
    return tree;
  }
  return tree;
};

export const deleteNode = (nodes: NoteNode[], targetId: string): NoteNode[] => {
  const tree = cloneTree(nodes);
  const loc = findNodeLocation(tree, targetId);
  if (loc) {
    const children = loc.node.children || [];
    loc.parent.splice(loc.index, 1, ...children);
    if (tree.length === 0) {
      tree.push({ id: generateId(), type: 'text', content: '', children: [] });
    }
    return tree;
  }
  return tree;
};

export const indentNode = (nodes: NoteNode[], targetId: string): NoteNode[] => {
  const tree = cloneTree(nodes);
  const loc = findNodeLocation(tree, targetId);
  if (loc && loc.index > 0) {
    const prevSibling = loc.parent[loc.index - 1];
    loc.parent.splice(loc.index, 1);
    prevSibling.children = prevSibling.children || [];
    prevSibling.children.push(loc.node);
    prevSibling.collapsed = false;
    return tree;
  }
  return tree;
};

export const outdentNode = (nodes: NoteNode[], targetId: string): NoteNode[] => {
  const tree = cloneTree(nodes);
  const loc = findNodeLocation(tree, targetId);
  if (loc && loc.parentNode) {
    const parentLoc = findNodeLocation(tree, loc.parentNode.id);
    if (parentLoc) {
      loc.parent.splice(loc.index, 1);
      parentLoc.parent.splice(parentLoc.index + 1, 0, loc.node);
      return tree;
    }
  }
  return tree;
};

export const moveNode = (
  nodes: NoteNode[],
  sourceId: string,
  targetId: string,
  position: 'before' | 'after' | 'inside'
): NoteNode[] => {
  if (sourceId === targetId) return nodes;
  const tree = cloneTree(nodes);
  
  // Prevent moving into itself or its own descendants
  const sourcePath = findPathToNode(tree, sourceId);
  const targetPath = findPathToNode(tree, targetId);
  if (targetPath.some(n => n.id === sourceId)) {
    return nodes;
  }

  const sourceLoc = findNodeLocation(tree, sourceId);
  if (!sourceLoc) return nodes;

  const [removed] = sourceLoc.parent.splice(sourceLoc.index, 1);
  const targetLoc = findNodeLocation(tree, targetId);
  if (!targetLoc) return nodes;

  if (position === 'inside') {
    targetLoc.node.children = targetLoc.node.children || [];
    targetLoc.node.children.push(removed);
    targetLoc.node.collapsed = false;
  } else if (position === 'before') {
    targetLoc.parent.splice(targetLoc.index, 0, removed);
  } else {
    targetLoc.parent.splice(targetLoc.index + 1, 0, removed);
  }

  return tree;
};

export const serializeNode = (node: NoteNode): SerializedNode => ({
  i: node.id,
  t: node.type,
  c: node.content,
  cl: node.collapsed,
  ck: node.checked,
  u: node.imageUrl,
  l: node.language,
  co: node.calloutType,
  ch: (node.children || []).map(serializeNode),
});

export const deserializeNode = (s: SerializedNode): NoteNode => ({
  id: s.i || generateId(),
  type: s.t || 'text',
  content: s.c || '',
  collapsed: !!s.cl,
  checked: !!s.ck,
  imageUrl: s.u,
  language: s.l,
  calloutType: s.co,
  children: (s.ch || []).map(deserializeNode),
});

export const serializeWote = (title: string, nodes: NoteNode[]): string => {
  const file: SerializedWoteFile = {
    v: 1,
    title,
    nodes: nodes.map(serializeNode),
    updatedAt: Date.now(),
  };
  return JSON.stringify(file, null, 2);
};

export const exportToMarkdown = (title: string, nodes: NoteNode[]): string => {
  let md = `# ${title || 'Wote'}\n\n`;

  const renderNodes = (list: NoteNode[], depth: number) => {
    const indent = '  '.repeat(depth);
    for (const node of list) {
      switch (node.type) {
        case 'heading1':
          md += `\n# ${node.content}\n\n`;
          break;
        case 'heading2':
          md += `\n## ${node.content}\n\n`;
          break;
        case 'heading3':
          md += `\n### ${node.content}\n\n`;
          break;
        case 'todo':
          md += `${indent}- [${node.checked ? 'x' : ' '}] ${node.content}\n`;
          break;
        case 'code':
          md += `\n\`\`\`${node.language || ''}\n${node.content}\n\`\`\`\n\n`;
          break;
        case 'quote':
          md += `${indent}> ${node.content}\n`;
          break;
        case 'callout':
          md += `${indent}> [!${(node.calloutType || 'NOTE').toUpperCase()}]\n${indent}> ${node.content}\n`;
          break;
        case 'image':
          md += `${indent}![image](${node.imageUrl || ''})\n`;
          break;
        case 'divider':
          md += `\n---\n\n`;
          break;
        default:
          md += `${indent}- ${node.content}\n`;
          break;
      }
      if (node.children && node.children.length > 0) {
        renderNodes(node.children, depth + 1);
      }
    }
  };

  renderNodes(nodes, 0);
  return md;
};
