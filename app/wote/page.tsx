'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Settings, Plus, ChevronRight, ChevronDown, Trash2, 
  Code, Type, CheckSquare, Image as ImageIcon, FileText, Download,
  Upload, Info, X, Keyboard, Moon, Sun, Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

// Types
type NodeType = 'text' | 'code' | 'markdown' | 'todo' | 'image';

interface NoteNode {
  id: string;
  type: NodeType;
  content: string;
  children: NoteNode[];
  collapsed?: boolean;
  checked?: boolean;
  imageUrl?: string;
  isEditing?: boolean;
}

interface SerializedNode {
  i: string;
  t: NodeType;
  c: string;
  ch: SerializedNode[];
  cl?: boolean;
  ck?: boolean;
  u?: string;
}

const THEME_STYLES = {
  willow: {
    bg: 'bg-[#1a1f16]',
    text: 'text-[#e2e8e0]',
    primary: 'text-[#95a38d]',
    nodeBg: 'group-hover/node:bg-[#252c20]/50',
    bodyBorder: 'border-white/10',
    c: {
      muted: 'text-white/40',
      mutedBg: 'bg-white/5',
      mutedHoverBg: 'hover:bg-white/10',
      mutedBorder: 'border-white/5',
      closeIcon: 'text-white/20 hover:text-white',
      kbbBg: 'bg-black/40 border-white/10',
      editorBg: 'bg-white/5 ring-cyan-500/20',
      todoBorder: 'border-white/20 hover:border-cyan-500/50'
    }
  },
  dark: {
    bg: 'bg-[#0a0a0a]',
    text: 'text-[#d4d4d4]',
    primary: 'text-[#737373]',
    nodeBg: 'group-hover/node:bg-[#171717]',
    bodyBorder: 'border-white/10',
    c: {
      muted: 'text-white/40',
      mutedBg: 'bg-white/5',
      mutedHoverBg: 'hover:bg-white/10',
      mutedBorder: 'border-white/5',
      closeIcon: 'text-white/20 hover:text-white',
      kbbBg: 'bg-black/40 border-white/10',
      editorBg: 'bg-white/5 ring-cyan-500/20',
      todoBorder: 'border-white/20 hover:border-cyan-500/50'
    }
  },
  light: {
    bg: 'bg-[#fafafa]',
    text: 'text-[#171717]',
    primary: 'text-[#737373]',
    nodeBg: 'group-hover/node:bg-[#f5f5f5]',
    bodyBorder: 'border-black/10',
    c: {
      muted: 'text-black/40',
      mutedBg: 'bg-black/5',
      mutedHoverBg: 'hover:bg-black/10',
      mutedBorder: 'border-black/5',
      closeIcon: 'text-black/40 hover:text-black',
      kbbBg: 'bg-black/5 border-black/10',
      editorBg: 'bg-black/5 ring-cyan-500/30 border-black/10',
      todoBorder: 'border-black/20 hover:border-cyan-500/50'
    }
  }
};

type ThemeType = 'willow' | 'dark' | 'light';

interface NodeActions {
  updateNode: (id: string, updates: Partial<NoteNode>) => void;
  addSibling: (id: string) => void;
  deleteNode: (id: string) => void;
  indentNode: (id: string) => void;
  outdentNode: (id: string) => void;
  cycleType: (id: string) => void;
  focusRelativeNode: (id: string, dir: 'up' | 'down') => void;
  theme: ThemeType;
  c: typeof THEME_STYLES['willow']['c'];
  nodeBgStyle: string;
  bodyBorder: string;
}

// Extract NodeItem to top level so React doesn't unmount it
const NodeItem = memo(({ node, depth, actions }: { node: NoteNode; depth: number, actions: NodeActions }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const lastContent = useRef(node.content);
  const { c, theme, bodyBorder } = actions;

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerText = node.content;
      lastContent.current = node.content;
    }
  }, []); // Set initial content

  useEffect(() => {
    if (contentRef.current && lastContent.current !== node.content) {
      contentRef.current.innerText = node.content;
      lastContent.current = node.content;
    }
  }, [node.content]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      actions.addSibling(node.id);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) actions.outdentNode(node.id);
      else actions.indentNode(node.id);
    } else if (e.key === '/' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      actions.updateNode(node.id, { collapsed: !node.collapsed });
    } else if (e.key === 't' && e.altKey) {
      e.preventDefault();
      actions.cycleType(node.id);
    } else if (e.key === 'Backspace' && e.shiftKey && (e.ctrlKey || e.metaKey)) {
      actions.deleteNode(node.id);
    } else if (e.key === 'ArrowUp' && e.altKey) {
      e.preventDefault();
      actions.focusRelativeNode(node.id, 'up');
    } else if (e.key === 'ArrowDown' && e.altKey) {
      e.preventDefault();
      actions.focusRelativeNode(node.id, 'down');
    }
  };

  const renderContent = () => {
    if (node.type === 'image') {
      return (
        <div className="space-y-2">
          <input 
            type="text" 
            placeholder="Paste Image URL..." 
            value={node.imageUrl || ''}
            onChange={(e) => actions.updateNode(node.id, { imageUrl: e.target.value })}
            className={`w-full ${c.mutedBg} border ${c.mutedBorder} rounded px-2 py-1 text-xs focus:outline-none focus:border-cyan-500/50`}
          />
          {node.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={node.imageUrl} className={`max-h-64 rounded-lg border ${bodyBorder} shadow-lg`} alt="node content" />
          )}
        </div>
      );
    }

    if (node.type === 'code' && !node.isEditing) {
      return (
        <pre 
          onClick={() => actions.updateNode(node.id, { isEditing: true })}
          className={`p-4 bg-black/40 rounded-xl border ${bodyBorder} font-mono text-sm overflow-x-auto cursor-text hover:border-cyan-500/30 transition-colors`}
        >
          <code dangerouslySetInnerHTML={{ __html: hljs.highlightAuto(node.content).value || ' ' }} />
        </pre>
      );
    }

    if (node.type === 'markdown' && !node.isEditing) {
      return (
        <div 
          onClick={() => actions.updateNode(node.id, { isEditing: true })}
          className="prose prose-invert prose-sm max-w-none cursor-text p-1"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(node.content || '...') as string) }}
        />
      );
    }

    return (
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        onInput={(e) => {
          lastContent.current = e.currentTarget.innerText;
          actions.updateNode(node.id, { content: e.currentTarget.innerText });
        }}
        onBlur={() => (node.type === 'code' || node.type === 'markdown') && actions.updateNode(node.id, { isEditing: false })}
        className={`outline-none min-h-[1.5em] w-full p-1 selection:bg-cyan-500/30 font-medium ${
          node.type === 'code' ? 'font-mono text-cyan-300' : 
          theme === 'willow' ? 'font-serif' : 'font-sans'
        } ${node.checked ? 'line-through opacity-40' : ''}`}
      />
    );
  };

  const renderIcon = () => {
    switch(node.type) {
      case 'code': return <Code className="w-3.5 h-3.5 text-orange-400" />;
      case 'markdown': return <FileText className="w-3.5 h-3.5 text-cyan-400" />;
      case 'todo': return <CheckSquare className="w-3.5 h-3.5 text-green-400" />;
      case 'image': return <ImageIcon className="w-3.5 h-3.5 text-purple-400" />;
      default: return <Type className={`w-3.5 h-3.5 ${c.muted}`} />;
    }
  };

  return (
    <div className="group/node" data-id={node.id}>
      <div className="flex items-start gap-2 py-1">
        <div className="flex items-center gap-1 opacity-0 group-hover/node:opacity-100 transition-opacity translate-y-1">
          <button 
            onClick={() => actions.updateNode(node.id, { collapsed: !node.collapsed })}
            className={`p-0.5 rounded ${c.mutedHoverBg} transition-colors ${node.children.length === 0 ? 'invisible' : ''}`}
          >
            {node.collapsed ? <ChevronRight className={`w-4 h-4 ${c.muted}`} /> : <ChevronDown className={`w-4 h-4 ${c.muted}`} />}
          </button>
        </div>

        <div className={`flex-grow flex items-start gap-3 rounded-xl p-1.5 transition-all duration-300 border border-transparent ${node.isEditing ? `${c.editorBg} ring-1` : actions.nodeBgStyle}`}>
          {node.type === 'todo' && (
            <button 
              onClick={() => actions.updateNode(node.id, { checked: !node.checked })}
              className={`mt-1.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${node.checked ? 'bg-cyan-500 border-cyan-500' : c.todoBorder}`}
            >
              {node.checked && <X className="w-3 h-3 text-black font-bold" />}
            </button>
          )}
          
          <div className="flex-grow min-w-0">
             {renderContent()}
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover/node:opacity-100 transition-opacity px-2 pt-1 h-full">
            <div 
               onClick={() => actions.cycleType(node.id)}
               className={`${c.mutedBg} p-1 rounded-lg flex items-center gap-1.5 cursor-pointer ${c.mutedHoverBg} transition-colors`}
               title="Click to change node type"
            >
               {renderIcon()}
               <span className={`text-[9px] font-bold uppercase tracking-widest ${c.muted}`}>{node.type}</span>
            </div>
            <button 
              onClick={() => actions.deleteNode(node.id)}
              className={`p-1.5 ${c.muted} hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!node.collapsed && node.children.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`ml-6 border-l-2 ${c.mutedBorder} pl-4 overflow-hidden`}
          >
            {node.children.map(child => (
              <NodeItem key={child.id} node={child} depth={depth + 1} actions={actions} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
NodeItem.displayName = 'NodeItem';

export default function WotePage() {
  const [nodes, setNodes] = useState<NoteNode[]>([]);
  const [title, setTitle] = useState<string>('Your Wote');
  const [noteId, setNoteId] = useState<string>('default');
  const [theme, setTheme] = useState<ThemeType>('willow');
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasBackup, setHasBackup] = useState(false);
  const [showBackupPrompt, setShowBackupPrompt] = useState(false);

  const generateId = () => Math.random().toString(36).substring(2, 11);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let id = params.get('id');
    if (!id) {
      id = generateId();
      window.history.replaceState({}, '', `?id=${id}`);
    }
    setNoteId(id);

    const backupKey = `wote-session-backup-${id}`;
    const savedBackup = localStorage.getItem(backupKey);
    const savedTheme = localStorage.getItem('wote-theme') as ThemeType;
    if (savedTheme) setTheme(savedTheme);

    const loadHelp = async () => {
      try {
        const res = await fetch('/help.wote');
        if (res.ok) {
           const parsed = await res.json();
           setTitle(parsed.title || 'Help Manual');
           setNodes(parsed.nodes.map(deserializeNode));
        } else {
           setTitle('Help Manual');
           setNodes([{ id: generateId(), type: 'text', content: 'Missing help.wote in public folder', children: [] }]);
        }
      } catch (e) {
         console.error(e);
      } finally { setIsLoaded(true); }
    };

    if (id === 'help') {
      loadHelp();
    } else if (savedBackup) {
      setHasBackup(true);
      setShowBackupPrompt(true);
      setIsLoaded(true);
      setNodes([{ id: generateId(), type: 'text', content: '', children: [] }]);
    } else {
      setIsLoaded(true);
      setNodes([{ id: generateId(), type: 'text', content: '', children: [] }]);
    }
  }, []);

  // True Session Sync & Backup
  useEffect(() => {
    if (!isLoaded || noteId === 'help' || showBackupPrompt) return;
    const backupKey = `wote-session-backup-${noteId}`;
    
    // Sync to localStorage for tabs
    const timeout = setTimeout(() => {
      const data = { title, nodes };
      localStorage.setItem(backupKey, JSON.stringify(data));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [nodes, title, noteId, isLoaded, showBackupPrompt]);

  // Handle cross-tab sync
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
       const backupKey = `wote-session-backup-${noteId}`;
       if (e.key === backupKey && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            setNodes(parsed.nodes || []);
            if (parsed.title) setTitle(parsed.title);
          } catch {}
       }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [noteId]);

  const restoreSession = () => {
    const backupKey = `wote-session-backup-${noteId}`;
    const saved = localStorage.getItem(backupKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNodes(parsed.nodes || []);
        if (parsed.title) setTitle(parsed.title);
        setShowBackupPrompt(false);
      } catch {
        alert("Backup corrupted");
      }
    }
  };

  useEffect(() => {
    localStorage.setItem('wote-theme', theme);
  }, [theme]);

  // Tree Utilities
  const findNoteById = (id: string, currentNodes: NoteNode[]): { note: NoteNode; parent: NoteNode[] } | null => {
    for (const node of currentNodes) {
      if (node.id === id) return { note: node, parent: currentNodes };
      if (node.children.length > 0) {
        const result = findNoteById(id, node.children);
        if (result) return result;
      }
    }
    return null;
  };

  const focusNode = useCallback((id: string) => {
    setTimeout(() => {
      const el = document.querySelector(`[data-id="${id}"] [contenteditable]`) as HTMLElement;
      if (el) {
        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }, 10);
  }, []);

  const updateNode = useCallback((id: string, updates: Partial<NoteNode>) => {
    setNodes(prev => {
      const newNodes = JSON.parse(JSON.stringify(prev));
      const target = findNoteById(id, newNodes);
      if (target) {
        Object.assign(target.note, updates);
        return newNodes;
      }
      return prev;
    });
  }, []);

  const addSibling = useCallback((id: string) => {
    setNodes(prev => {
      const newNodes = JSON.parse(JSON.stringify(prev));
      const target = findNoteById(id, newNodes);
      if (target) {
        const idx = target.parent.findIndex(n => n.id === id);
        const newNode: NoteNode = { id: generateId(), type: target.note.type, content: '', children: [] };
        target.parent.splice(idx + 1, 0, newNode);
        focusNode(newNode.id);
        return newNodes;
      }
      return prev;
    });
  }, [focusNode]);

  const deleteNode = useCallback((id: string) => {
    setNodes(prev => {
      const newNodes = JSON.parse(JSON.stringify(prev));
      const target = findNoteById(id, newNodes);
      if (target) {
        const idx = target.parent.findIndex(n => n.id === id);
        const children = target.note.children;
        target.parent.splice(idx, 1);
        if (children.length > 0) {
          target.parent.splice(idx, 0, ...children);
        }
        if (newNodes.length === 0) {
          newNodes.push({ id: generateId(), type: 'text', content: '', children: [] });
        }
        return newNodes;
      }
      return prev;
    });
  }, []);

  const indentNode = useCallback((id: string) => {
    setNodes(prev => {
      const newNodes = JSON.parse(JSON.stringify(prev));
      const target = findNoteById(id, newNodes);
      if (target && target.parent.findIndex(n => n.id === id) > 0) {
        const idx = target.parent.findIndex(n => n.id === id);
        const previous = target.parent[idx - 1];
        target.parent.splice(idx, 1);
        previous.children.push(target.note);
        previous.collapsed = false;
        focusNode(id);
        return newNodes;
      }
      return prev;
    });
  }, [focusNode]);

  const outdentNode = useCallback((id: string) => {
    setNodes(prev => {
      const newNodes = JSON.parse(JSON.stringify(prev));
      const findParentOfArray = (arr: NoteNode[], targetArr: NoteNode[]): NoteNode | null => {
        for (const node of arr) {
          if (node.children === targetArr) return node;
          const result = findParentOfArray(node.children, targetArr);
          if (result) return result;
        }
        return null;
      };

      const target = findNoteById(id, newNodes);
      if (target) {
        const parentNode = findParentOfArray(newNodes, target.parent);
        if (parentNode) {
          const grandTarget = findNoteById(parentNode.id, newNodes);
          if (grandTarget) {
            const idx = target.parent.findIndex(n => n.id === id);
            target.parent.splice(idx, 1);
            const pIdx = grandTarget.parent.findIndex(n => n.id === parentNode.id);
            grandTarget.parent.splice(pIdx + 1, 0, target.note);
            focusNode(id);
            return newNodes;
          }
        }
      }
      return prev;
    });
  }, [focusNode]);

  const focusRelativeNode = useCallback((id: string, direction: 'up' | 'down') => {
    setNodes(prev => {
      const getFlatVisibleNodes = (arr: NoteNode[]): string[] => {
        let flat: string[] = [];
        for (const node of arr) {
          flat.push(node.id);
          if (!node.collapsed && node.children.length > 0) {
            flat = [...flat, ...getFlatVisibleNodes(node.children)];
          }
        }
        return flat;
      };
      const flat = getFlatVisibleNodes(prev);
      const idx = flat.indexOf(id);
      if (idx !== -1) {
        if (direction === 'up' && idx > 0) focusNode(flat[idx - 1]);
        else if (direction === 'down' && idx < flat.length - 1) focusNode(flat[idx + 1]);
      }
      return prev;
    });
  }, [focusNode]);

  const cycleType = useCallback((id: string) => {
    const types: NodeType[] = ['text', 'markdown', 'code', 'todo', 'image'];
    setNodes(prev => {
      const newNodes = JSON.parse(JSON.stringify(prev));
      const target = findNoteById(id, newNodes);
      if (target) {
        const next = types[(types.indexOf(target.note.type) + 1) % types.length];
        target.note.type = next;
        return newNodes;
      }
      return prev;
    });
  }, []);

  const serializeNode = (node: NoteNode): SerializedNode => ({
    i: node.id, t: node.type, c: node.content,
    cl: node.collapsed, ck: node.checked, u: node.imageUrl,
    ch: node.children.map(serializeNode)
  });

  const deserializeNode = (s: SerializedNode): NoteNode => ({
    id: s.i, type: s.t, content: s.c,
    collapsed: s.cl, checked: s.ck, imageUrl: s.u,
    children: (s.ch || []).map(deserializeNode)
  });

  const handleExport = () => {
    const serialized = nodes.map(serializeNode);
    const data = JSON.stringify({ v: 1, title, nodes: serialized });
    const blob = new Blob([data], { type: 'application/wote' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'save'}.wote`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setNodes(parsed.map(deserializeNode));
          setTitle('Imported Wote');
        } else if (parsed.v === 1) {
          setTitle(parsed.title || 'Untitled');
          setNodes((parsed.nodes || []).map(deserializeNode));
        } else {
          throw new Error("Invalid format");
        }
      } catch {
        alert("Invalid .wote file format");
      }
    };
    reader.readAsText(file);
  };

  const c = THEME_STYLES[theme].c;

  const actions: NodeActions = {
    updateNode, addSibling, deleteNode, indentNode, outdentNode, cycleType, focusRelativeNode, 
    theme, c, nodeBgStyle: THEME_STYLES[theme].nodeBg, bodyBorder: THEME_STYLES[theme].bodyBorder
  };

  if (!isLoaded) return null;

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans selection:bg-cyan-500/30 ${THEME_STYLES[theme].bg} ${THEME_STYLES[theme].text}`}>
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <header className="fixed top-0 inset-x-0 z-50 p-6 flex items-center justify-between pointer-events-none">
         <Link 
          href="/" 
          className={`${c.mutedBg} ${c.mutedHoverBg} p-3 rounded-2xl border ${c.mutedBorder} backdrop-blur-md transition-all active:scale-95 group pointer-events-auto`}
         >
            <ArrowLeft className="w-5 h-5 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
         </Link>

         <div className="flex items-center gap-3 pointer-events-auto">
            <button 
                onClick={handleExport}
                className="bg-cyan-500 hover:bg-cyan-400 text-black p-3 px-5 rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95"
            >
                <Download className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest hidden md:block">Save .wote</span>
            </button>
            <label className={`${c.mutedBg} ${c.mutedHoverBg} p-3 px-5 rounded-2xl border ${c.mutedBorder} backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer active:scale-95`}>
                <Upload className={`w-5 h-5 ${c.muted}`} />
                <span className={`text-xs font-bold uppercase tracking-widest ${c.muted} hidden md:block`}>Load</span>
                <input type="file" className="hidden" onChange={handleImport} accept=".wote" />
            </label>
            <button 
              onClick={() => setShowShortcuts(true)}
              className={`${c.mutedBg} ${c.mutedHoverBg} p-3 rounded-2xl border ${c.mutedBorder} backdrop-blur-md transition-all flex items-center gap-3 px-4`}
            >
              <Keyboard className={`w-5 h-5 ${c.muted}`} />
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className={`${c.mutedBg} ${c.mutedHoverBg} p-3 rounded-2xl border ${c.mutedBorder} backdrop-blur-md transition-all`}
            >
              <Settings className={`w-5 h-5 ${c.muted}`} />
            </button>
         </div>
      </header>

      <main className="max-w-4xl mx-auto pt-32 px-6 pb-40">
        <div className="flex flex-col gap-2">
           <div className="mb-12 space-y-2">
              {noteId === 'help' ? (
                <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter bg-gradient-to-br from-cyan-400 to-cyan-500 bg-clip-text text-transparent opacity-80 cursor-default">
                  Help Manual
                </h1>
              ) : (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full bg-transparent text-4xl md:text-6xl font-black italic tracking-tighter outline-none placeholder-${theme === 'light' ? 'black' : 'white'}/20 transition-all`}
                  style={{ backgroundImage: `linear-gradient(to bottom right, currentColor, ${theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)'})`, WebkitBackgroundClip: 'text', color: 'transparent', opacity: 0.8 }}
                  placeholder="Your Wote"
                />
              )}
              <div className="flex items-center gap-2">
                <div className="h-1 w-12 bg-cyan-500 rounded-full" />
                <span className={`text-[10px] font-bold ${c.muted} uppercase tracking-[0.3em]`}>Minimalist Tree Node Editor</span>
              </div>
           </div>

           <div className="space-y-1">
              {nodes.map(node => (
                <NodeItem key={node.id} node={node} depth={0} actions={actions} />
              ))}
           </div>
           
           <button 
            onClick={() => setNodes([...nodes, { id: generateId(), type: 'text', content: '', children: [] }])}
            className={`mt-8 flex items-center gap-2 px-4 py-3 ${c.mutedBg} ${c.mutedHoverBg} border ${c.mutedBorder} rounded-2xl transition-all ${c.muted} hover:text-cyan-500 w-fit`}
           >
              <Plus className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">New Root Node</span>
           </button>
        </div>
      </main>

      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className={`absolute inset-0 ${theme === 'light' ? 'bg-white/80' : 'bg-black/80'} backdrop-blur-sm`}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-sm border ${c.mutedBorder} rounded-[2rem] shadow-2xl overflow-hidden p-8 flex flex-col gap-8 ${THEME_STYLES[theme].bg}`}
            >
              <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-black italic tracking-tighter">Settings</h2>
                 <X 
                  className={`w-6 h-6 ${c.closeIcon} cursor-pointer`}
                  onClick={() => setShowSettings(false)} 
                />
              </div>

              <div className="space-y-6">
                 <div className="space-y-4">
                    <p className={`text-[10px] font-bold ${c.muted} uppercase tracking-[0.2em]`}>Appearance</p>
                    <div className="grid grid-cols-3 gap-2">
                       {([['willow', Sun], ['dark', Moon], ['light', Monitor]] as const).map(([t, Icon]) => (
                         <button 
                          key={t}
                          onClick={() => setTheme(t)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${theme === t ? 'bg-cyan-500 text-black border-cyan-500 shadow-lg shadow-cyan-500/20' : `${c.mutedBg} ${c.mutedBorder} ${c.muted} hover:text-cyan-500`}`}
                         >
                            <Icon className="w-5 h-5" />
                            <span className="text-[10px] font-bold uppercase">{t}</span>
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className={`space-y-4 pt-4 border-t ${c.mutedBorder}`}>
                    <p className={`text-[10px] font-bold ${c.muted} uppercase tracking-[0.2em]`}>Data Management</p>
                    <div className="grid grid-cols-2 gap-3">
                       <button 
                        onClick={handleExport}
                        className={`flex items-center justify-center gap-2 p-3 ${c.mutedBg} ${c.mutedHoverBg} border ${c.mutedBorder} rounded-2xl transition-all text-sm font-bold`}
                       >
                          <Download className="w-4 h-4" />
                          Export
                       </button>
                       <label className={`flex items-center justify-center gap-2 p-3 ${c.mutedBg} ${c.mutedHoverBg} border ${c.mutedBorder} rounded-2xl transition-all text-sm font-bold cursor-pointer`}>
                          <Upload className="w-4 h-4" />
                          Import
                          <input type="file" className="hidden" onChange={handleImport} accept=".wote,.json" />
                       </label>
                    </div>
                    <Link 
                      href="?id=help"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowSettings(false)}
                      className="flex items-center justify-center gap-2 p-3 w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 border border-cyan-500/20 rounded-2xl transition-all text-sm font-bold"
                    >
                      <Info className="w-4 h-4" />
                      View Help Manual
                    </Link>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShortcuts && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShortcuts(false)}
              className={`absolute inset-0 ${theme === 'light' ? 'bg-white/80' : 'bg-black/80'} backdrop-blur-sm`}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-sm border ${c.mutedBorder} rounded-[2rem] shadow-2xl overflow-hidden p-8 flex flex-col gap-6 ${THEME_STYLES[theme].bg}`}
            >
               <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-black italic tracking-tighter">Shortcuts</h2>
                 <X 
                  className={`w-6 h-6 ${c.closeIcon} cursor-pointer`}
                  onClick={() => setShowShortcuts(false)} 
                />
              </div>

              <div className="space-y-3">
                 {[
                   ['Enter', 'Create Node'],
                   ['Tab / Shift+Tab', 'Indent / Outdent'],
                   ['Ctrl + /', 'Toggle Collapse'],
                   ['Alt + T', 'Cycle Node Type'],
                   ['Alt + Up / Down', 'Move Focus'],
                   ['Ctrl + Shift + Backspace', 'Delete Node'],
                 ].map(([keys, desc]) => (
                   <div key={keys} className={`flex items-center justify-between p-3 ${c.mutedBg} rounded-xl border ${c.mutedBorder}`}>
                      <span className={`text-xs font-bold ${c.muted} uppercase tracking-tight`}>{desc}</span>
                      <kbd className={`px-2 py-1 ${c.kbbBg} rounded border text-[10px] font-mono font-bold text-cyan-500`}>{keys}</kbd>
                   </div>
                 ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBackupPrompt && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
          >
            <div className={`${THEME_STYLES[theme].bg} border border-cyan-500/30 rounded-3xl p-6 shadow-2xl flex items-center justify-between gap-6 backdrop-blur-xl`}>
               <div className="space-y-1">
                  <p className="text-sm font-bold">Unsaved session found!</p>
                  <p className="text-[10px] uppercase font-bold text-cyan-500/70 tracking-widest">Crash Recovery active</p>
               </div>
               <div className="flex gap-2">
                 <button 
                   onClick={() => setShowBackupPrompt(false)}
                   className={`px-4 py-2 text-xs font-bold uppercase tracking-widest ${c.muted} ${c.closeIcon} transition-colors`}
                 >
                   Ignore
                 </button>
                 <button 
                   onClick={restoreSession}
                   className="px-6 py-2 bg-cyan-500 text-black rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                 >
                   Restore
                 </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
