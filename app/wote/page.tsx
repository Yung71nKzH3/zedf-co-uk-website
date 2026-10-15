'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Plus, ArrowLeft, Home, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { NoteNode, NodeType, ThemeType, SerializedNode, SerializedWoteFile } from '@/components/wote/types';
import { THEMES } from '@/components/wote/theme';
import { 
  generateId, 
  cloneTree, 
  findNodeById, 
  findPathToNode, 
  getFlatVisibleNodeIds,
  addSibling, 
  addChild, 
  deleteNode, 
  indentNode, 
  outdentNode, 
  moveNode, 
  serializeWote, 
  deserializeNode, 
  exportToMarkdown 
} from '@/components/wote/utils/tree';

import { NodeItem, NodeActions } from '@/components/wote/NodeItem';
import { NoteDrawer, NoteSummary } from '@/components/wote/NoteDrawer';
import { WoteHeader } from '@/components/wote/WoteHeader';
import { SearchModal } from '@/components/wote/SearchModal';
import { ShortcutsModal } from '@/components/wote/ShortcutsModal';
import { SettingsModal } from '@/components/wote/SettingsModal';

const WOTE_3_HELP_MANUAL: NoteNode[] = [
  {
    id: 'h-intro',
    type: 'heading1',
    content: 'Welcome to Wote 3.0!',
    children: [
      {
        id: 'h-tagline',
        type: 'text',
        content: 'A distraction-free, tree-structured outliner workspace designed for the web.',
        children: []
      },
      {
        id: 'h-callout-welcome',
        type: 'callout',
        calloutType: 'tip',
        content: 'Interactive Guide: This manual is a real, live Wote document! Feel free to click, edit, expand, drag, and test everything right here.',
        children: []
      }
    ]
  },
  {
    id: 'h-mouse',
    type: 'heading2',
    content: '1. Mouse Controls & Visual Superpowers',
    children: [
      {
        id: 'h-zoom',
        type: 'text',
        content: 'Bullet Zoom (Focus Mode): Click the dot on the left of this bullet to zoom into this branch!',
        children: [
          {
            id: 'h-zoom-sub1',
            type: 'text',
            content: 'Notice how the rest of the document fades away and breadcrumbs appear at the top?',
            children: []
          },
          {
            id: 'h-zoom-sub2',
            type: 'text',
            content: 'Click "Root" in the top bar or press Esc anytime to return to the full document.',
            children: []
          }
        ]
      },
      {
        id: 'h-drag',
        type: 'text',
        content: 'Drag-and-Drop: Hover over this line and grab the 6-dot grip handle to move or nest notes visually.',
        children: []
      },
      {
        id: 'h-collapse',
        type: 'text',
        content: 'Expand & Collapse: Click the chevron arrow to fold thoughts away.',
        collapsed: true,
        children: [
          {
            id: 'h-secret-1',
            type: 'callout',
            calloutType: 'success',
            content: 'You found the collapsed note! Notice the counter badge (+2) when folded.',
            children: []
          },
          {
            id: 'h-secret-2',
            type: 'text',
            content: 'Collapsing keeps long outlines clean and focused.',
            children: []
          }
        ]
      },
      {
        id: 'h-hover-bar',
        type: 'text',
        content: 'Hover Quick Actions: Hover to the right of any line to quickly add a child (+), switch block type, or delete.',
        children: []
      }
    ]
  },
  {
    id: 'h-blocks',
    type: 'heading2',
    content: '2. Dedicated Block Types & The Slash Menu',
    children: [
      {
        id: 'h-slash',
        type: 'callout',
        calloutType: 'info',
        content: 'Type / on any empty line to summon the Command Menu and pick any block type.',
        children: []
      },
      {
        id: 'h-todo-example',
        type: 'todo',
        checked: true,
        content: 'Interactive To-Dos: Click this checkbox to toggle complete with strikethrough!',
        children: []
      },
      {
        id: 'h-todo-2',
        type: 'todo',
        checked: false,
        content: 'Press Enter from a to-do to create another task immediately.',
        children: []
      },
      {
        id: 'h-quote-example',
        type: 'quote',
        content: 'Simplicity is about subtracting the obvious and adding the meaningful. — John Maeda',
        children: []
      },
      {
        id: 'h-code-example',
        type: 'code',
        language: 'typescript',
        content: '// Code blocks feature syntax highlighting and a 1-click Copy button!\ninterface WoteNote {\n  id: string;\n  type: "text" | "heading1" | "todo" | "code" | "quote" | "callout";\n  children: WoteNote[];\n}\n\nconsole.log("Distraction-free outliner ready!");',
        children: []
      },
      {
        id: 'h-div',
        type: 'divider',
        content: '',
        children: []
      },
      {
        id: 'h-img-tip',
        type: 'text',
        content: 'Clipboard Image Paste: Copy any image or screenshot to your clipboard and hit Ctrl+V right here!',
        children: []
      }
    ]
  },
  {
    id: 'h-keyboard',
    type: 'heading2',
    content: '3. Keyboard Shortcuts & Workflow',
    children: [
      {
        id: 'k-enter',
        type: 'todo',
        checked: true,
        content: 'Enter: Create a new sibling note below',
        children: []
      },
      {
        id: 'k-tab',
        type: 'todo',
        checked: true,
        content: 'Tab: Indent / nest note under the previous item',
        children: []
      },
      {
        id: 'k-outdent',
        type: 'todo',
        checked: true,
        content: 'Shift + Tab: Outdent note back up a level',
        children: []
      },
      {
        id: 'k-nav',
        type: 'todo',
        checked: true,
        content: 'Alt + Up / Down: Move cursor focus smoothly between notes',
        children: []
      },
      {
        id: 'k-collapse',
        type: 'todo',
        checked: true,
        content: 'Ctrl + /: Toggle collapse/expand on current branch',
        children: []
      },
      {
        id: 'k-search',
        type: 'todo',
        checked: true,
        content: 'Ctrl + K: Quick Search across all bullets in the document',
        children: []
      },
      {
        id: 'k-history',
        type: 'todo',
        checked: true,
        content: 'Ctrl + Z & Ctrl + Y: Full undo / redo history stack',
        children: []
      }
    ]
  },
  {
    id: 'h-library',
    type: 'heading2',
    content: '4. Document Library & Exporting',
    children: [
      {
        id: 'lib-1',
        type: 'text',
        content: 'Notes Drawer: Click "Notes" at the top left to manage multiple saved documents, filter, or create new Wotes.',
        children: []
      },
      {
        id: 'lib-2',
        type: 'text',
        content: 'Exporting: Export your work anytime as a native .wote file or as standard clean Markdown (.md).',
        children: []
      },
      {
        id: 'lib-3',
        type: 'callout',
        calloutType: 'success',
        content: 'All your documents are automatically saved in your browser storage locally with crash recovery.',
        children: []
      }
    ]
  }
];

export default function WotePage() {
  const [docId, setDocId] = useState<string>('default');
  const [title, setTitle] = useState<string>('Untitled Wote');
  const [nodes, setNodes] = useState<NoteNode[]>([]);
  const [zoomRootId, setZoomRootId] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeType>('willow');
  
  // Library State
  const [notesList, setNotesList] = useState<NoteSummary[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Undo / Redo History Stack
  const historyRef = useRef<{ title: string; nodes: NoteNode[] }[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [historyState, setHistoryState] = useState<{ canUndo: boolean; canRedo: boolean }>({
    canUndo: false,
    canRedo: false,
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // PWA Install & Offline Support
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // Register Service Worker for offline capability
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/wote-sw.js').catch((err) => {
        console.info('Service Worker registration note:', err);
      });
    }

    // Capture install prompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = useCallback(async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        setIsAppInstalled(true);
        setDeferredInstallPrompt(null);
      }
    }
  }, [deferredInstallPrompt]);

  const themeConfig = THEMES[theme] || THEMES.willow;

  // Push to history stack
  const recordHistory = useCallback((newTitle: string, newNodes: NoteNode[]) => {
    const nextHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    nextHistory.push({ title: newTitle, nodes: cloneTree(newNodes) });
    if (nextHistory.length > 50) nextHistory.shift();
    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;

    setHistoryState({
      canUndo: historyIndexRef.current > 0,
      canRedo: false,
    });
  }, []);

  // Focus utility
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
    }, 20);
  }, []);

  // Load Library Index & Current Note on mount
  useEffect(() => {
    const savedTheme = (localStorage.getItem('wote-theme') as ThemeType) || 'willow';
    if (THEMES[savedTheme]) setTheme(savedTheme);

    // Read library index
    let library: NoteSummary[] = [];
    try {
      const rawLib = localStorage.getItem('wote-library-index');
      if (rawLib) library = JSON.parse(rawLib);
    } catch {}

    // Check URL param ?id=...
    const params = new URLSearchParams(window.location.search);
    let id = params.get('id');

    if (!id) {
      if (library.length > 0) {
        id = library[0].id;
      } else {
        id = generateId();
      }
      window.history.replaceState({}, '', `?id=${id}`);
    }

    setDocId(id);

    // Load Document
    if (id === 'help') {
      setTitle('Wote 3.0 Guide & Manual');
      setNodes(WOTE_3_HELP_MANUAL);
      recordHistory('Wote 3.0 Guide & Manual', WOTE_3_HELP_MANUAL);
      setIsLoaded(true);
    } else {
      const docKey = `wote-doc-${id}`;
      const legacyKey = `wote-session-backup-${id}`;
      let loadedTitle = 'My First Wote';
      let loadedNodes: NoteNode[] = [
        { id: generateId(), type: 'text', content: 'Welcome to Wote 3.0! Type something or press / for options.', children: [] }
      ];

      try {
        const rawDoc = localStorage.getItem(docKey) || localStorage.getItem(legacyKey);
        if (rawDoc) {
          const parsed = JSON.parse(rawDoc);
          if (parsed.title) loadedTitle = parsed.title;
          if (parsed.nodes && Array.isArray(parsed.nodes)) {
            loadedNodes = parsed.nodes.map(deserializeNode);
          }
        }
      } catch (err) {
        console.error('Error loading wote doc:', err);
      }

      setTitle(loadedTitle);
      setNodes(loadedNodes);
      recordHistory(loadedTitle, loadedNodes);

      // Ensure library has this note registered
      const exists = library.find(n => n.id === id);
      if (!exists) {
        library.unshift({
          id,
          title: loadedTitle,
          updatedAt: Date.now(),
          nodeCount: loadedNodes.length,
        });
        localStorage.setItem('wote-library-index', JSON.stringify(library));
      }

      setNotesList(library);
      setIsLoaded(true);
    }
  }, [recordHistory]);

  // Persist Theme
  const handleSetTheme = (newTheme: ThemeType) => {
    setTheme(newTheme);
    localStorage.setItem('wote-theme', newTheme);
  };

  // Auto-save debounced to localStorage
  useEffect(() => {
    if (!isLoaded || docId === 'help') return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const docKey = `wote-doc-${docId}`;
        const data = serializeWote(title, nodes);
        localStorage.setItem(docKey, data);

        // Update library index
        setNotesList(prev => {
          const updated = [...prev];
          const idx = updated.findIndex(n => n.id === docId);
          const count = nodes.reduce((acc, curr) => acc + 1 + (curr.children?.length || 0), 0);
          const summary: NoteSummary = {
            id: docId,
            title: title || 'Untitled Wote',
            updatedAt: Date.now(),
            nodeCount: count,
          };
          if (idx !== -1) {
            updated[idx] = summary;
          } else {
            updated.unshift(summary);
          }
          localStorage.setItem('wote-library-index', JSON.stringify(updated));
          return updated;
        });
      } catch (err) {
        console.error('Auto-save error:', err);
      }
    }, 600);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [nodes, title, docId, isLoaded]);

  // Undo / Redo Actions
  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const prev = historyRef.current[historyIndexRef.current];
      setTitle(prev.title);
      setNodes(cloneTree(prev.nodes));
      setHistoryState({
        canUndo: historyIndexRef.current > 0,
        canRedo: true,
      });
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const next = historyRef.current[historyIndexRef.current];
      setTitle(next.title);
      setNodes(cloneTree(next.nodes));
      setHistoryState({
        canUndo: true,
        canRedo: historyIndexRef.current < historyRef.current.length - 1,
      });
    }
  }, []);

  // Global Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.key === 'Escape' && zoomRootId) {
        setZoomRootId(null);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleUndo, handleRedo, zoomRootId]);

  // Node Mutation Actions
  const updateNode = useCallback((id: string, updates: Partial<NoteNode>) => {
    setNodes(prev => {
      const tree = cloneTree(prev);
      const target = findNodeById(tree, id);
      if (target) {
        Object.assign(target, updates);
        return tree;
      }
      return prev;
    });
  }, []);

  const handleAddSibling = useCallback((id: string) => {
    setNodes(prev => {
      const target = findNodeById(prev, id);
      const newNode: NoteNode = {
        id: generateId(),
        type: target?.type === 'todo' ? 'todo' : 'text',
        content: '',
        children: [],
      };
      const updated = addSibling(prev, id, newNode);
      recordHistory(title, updated);
      focusNode(newNode.id);
      return updated;
    });
  }, [focusNode, recordHistory, title]);

  const handleAddChild = useCallback((id: string) => {
    setNodes(prev => {
      const newNode: NoteNode = {
        id: generateId(),
        type: 'text',
        content: '',
        children: [],
      };
      const updated = addChild(prev, id, newNode);
      recordHistory(title, updated);
      focusNode(newNode.id);
      return updated;
    });
  }, [focusNode, recordHistory, title]);

  const handleDeleteNode = useCallback((id: string) => {
    setNodes(prev => {
      const updated = deleteNode(prev, id);
      recordHistory(title, updated);
      return updated;
    });
  }, [recordHistory, title]);

  const handleIndentNode = useCallback((id: string) => {
    setNodes(prev => {
      const updated = indentNode(prev, id);
      recordHistory(title, updated);
      focusNode(id);
      return updated;
    });
  }, [focusNode, recordHistory, title]);

  const handleOutdentNode = useCallback((id: string) => {
    setNodes(prev => {
      const updated = outdentNode(prev, id);
      recordHistory(title, updated);
      focusNode(id);
      return updated;
    });
  }, [focusNode, recordHistory, title]);

  const handleCycleType = useCallback((id: string) => {
    const cycleList: NodeType[] = [
      'text', 'heading1', 'heading2', 'heading3', 
      'todo', 'code', 'quote', 'callout'
    ];
    setNodes(prev => {
      const tree = cloneTree(prev);
      const target = findNodeById(tree, id);
      if (target) {
        const nextIdx = (cycleList.indexOf(target.type) + 1) % cycleList.length;
        target.type = cycleList[nextIdx];
        recordHistory(title, tree);
        return tree;
      }
      return prev;
    });
  }, [recordHistory, title]);

  const handleMoveNode = useCallback((sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => {
    setNodes(prev => {
      const updated = moveNode(prev, sourceId, targetId, position);
      recordHistory(title, updated);
      return updated;
    });
  }, [recordHistory, title]);

  const handleFocusRelative = useCallback((id: string, dir: 'up' | 'down') => {
    const flat = getFlatVisibleNodeIds(nodes, zoomRootId);
    const idx = flat.indexOf(id);
    if (idx !== -1) {
      if (dir === 'up' && idx > 0) focusNode(flat[idx - 1]);
      else if (dir === 'down' && idx < flat.length - 1) focusNode(flat[idx + 1]);
    }
  }, [nodes, zoomRootId, focusNode]);

  // Zoom / Focus on sub-tree
  const handleZoomInto = useCallback((id: string) => {
    if (zoomRootId === id) {
      setZoomRootId(null);
    } else {
      setZoomRootId(id);
    }
  }, [zoomRootId]);

  const zoomPath = useMemo(() => {
    if (!zoomRootId) return [];
    return findPathToNode(nodes, zoomRootId);
  }, [nodes, zoomRootId]);

  const zoomedNode = useMemo(() => {
    if (!zoomRootId) return null;
    return findNodeById(nodes, zoomRootId);
  }, [nodes, zoomRootId]);

  // Library switching & creation
  const handleSelectNote = (id: string) => {
    setDocId(id);
    setZoomRootId(null);
    window.history.replaceState({}, '', `?id=${id}`);

    if (id === 'help') {
      setTitle('Wote 3.0 Guide & Manual');
      setNodes(WOTE_3_HELP_MANUAL);
      recordHistory('Wote 3.0 Guide & Manual', WOTE_3_HELP_MANUAL);
      return;
    }

    const docKey = `wote-doc-${id}`;
    const legacyKey = `wote-session-backup-${id}`;
    let loadedTitle = 'Untitled Wote';
    let loadedNodes: NoteNode[] = [{ id: generateId(), type: 'text', content: '', children: [] }];

    try {
      const rawDoc = localStorage.getItem(docKey) || localStorage.getItem(legacyKey);
      if (rawDoc) {
        const parsed = JSON.parse(rawDoc);
        if (parsed.title) loadedTitle = parsed.title;
        if (parsed.nodes && Array.isArray(parsed.nodes)) {
          loadedNodes = parsed.nodes.map(deserializeNode);
        }
      }
    } catch {}

    setTitle(loadedTitle);
    setNodes(loadedNodes);
    recordHistory(loadedTitle, loadedNodes);
  };

  const handleCreateNote = () => {
    const newId = generateId();
    const newTitle = 'Untitled Wote';
    const newNodes: NoteNode[] = [
      { id: generateId(), type: 'text', content: '', children: [] }
    ];

    const newSummary: NoteSummary = {
      id: newId,
      title: newTitle,
      updatedAt: Date.now(),
      nodeCount: 1,
    };

    const nextList = [newSummary, ...notesList];
    setNotesList(nextList);
    localStorage.setItem('wote-library-index', JSON.stringify(nextList));

    setDocId(newId);
    setTitle(newTitle);
    setNodes(newNodes);
    setZoomRootId(null);
    window.history.replaceState({}, '', `?id=${newId}`);
    recordHistory(newTitle, newNodes);
    setIsDrawerOpen(false);
  };

  const handleDeleteNoteFromLib = (idToDelete: string) => {
    const filtered = notesList.filter(n => n.id !== idToDelete);
    setNotesList(filtered);
    localStorage.setItem('wote-library-index', JSON.stringify(filtered));
    localStorage.removeItem(`wote-doc-${idToDelete}`);

    if (docId === idToDelete) {
      if (filtered.length > 0) {
        handleSelectNote(filtered[0].id);
      } else {
        handleCreateNote();
      }
    }
  };

  const handleDuplicateNote = (idToDup: string) => {
    const rawDoc = localStorage.getItem(`wote-doc-${idToDup}`);
    if (!rawDoc) return;
    try {
      const parsed = JSON.parse(rawDoc);
      const newId = generateId();
      const dupTitle = `${parsed.title || 'Note'} (Copy)`;
      const dupNodes: NoteNode[] = (parsed.nodes || []).map(deserializeNode);

      const newSummary: NoteSummary = {
        id: newId,
        title: dupTitle,
        updatedAt: Date.now(),
        nodeCount: dupNodes.length,
      };

      const nextList = [newSummary, ...notesList];
      setNotesList(nextList);
      localStorage.setItem('wote-library-index', JSON.stringify(nextList));
      localStorage.setItem(`wote-doc-${newId}`, serializeWote(dupTitle, dupNodes));
      handleSelectNote(newId);
    } catch (err) {
      console.error(err);
    }
  };

  // Export & Import
  const handleExportWote = () => {
    const serialized = serializeWote(title, nodes);
    const blob = new Blob([serialized], { type: 'application/wote' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'note'}.wote`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    const md = exportToMarkdown(title, nodes);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'note'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    const backup: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('wote-doc-') || key === 'wote-library-index')) {
        try {
          backup[key] = JSON.parse(localStorage.getItem(key) || '{}');
        } catch {
          backup[key] = localStorage.getItem(key);
        }
      }
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wote_backup_all_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (parsed.v === 1 && parsed.nodes) {
          // Native .wote format
          const importedNodes = parsed.nodes.map(deserializeNode);
          const importedTitle = parsed.title || file.name.replace(/\.[^/.]+$/, '');
          setTitle(importedTitle);
          setNodes(importedNodes);
          recordHistory(importedTitle, importedNodes);
        } else if (Array.isArray(parsed)) {
          // Array of nodes
          const importedNodes = parsed.map(deserializeNode);
          setNodes(importedNodes);
          recordHistory(title, importedNodes);
        } else {
          alert('Unrecognized Wote file format');
        }
      } catch {
        alert('Invalid file format. Please upload a valid .wote or .json file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const actions: NodeActions = {
    updateNode,
    addSibling: handleAddSibling,
    addChild: handleAddChild,
    deleteNode: handleDeleteNode,
    indentNode: handleIndentNode,
    outdentNode: handleOutdentNode,
    cycleType: handleCycleType,
    focusRelativeNode: handleFocusRelative,
    zoomInto: handleZoomInto,
    moveNode: handleMoveNode,
    themeConfig,
    theme,
  };

  if (!isLoaded) return null;

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans selection:bg-cyan-500/30 ${themeConfig.bg} ${themeConfig.text}`}>
      {/* Subtle Dot Grid Background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle, ${themeConfig.dotColor} 1.2px, transparent 1.2px)`,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Global Header */}
      <WoteHeader
        themeConfig={themeConfig}
        notesCount={notesList.length}
        zoomPath={zoomPath}
        canUndo={historyState.canUndo}
        canRedo={historyState.canRedo}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onResetZoom={() => setZoomRootId(null)}
        onZoomToNode={handleZoomInto}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportWote={handleExportWote}
        onExportMarkdown={handleExportMarkdown}
        onImportFile={handleImportFile}
        canInstall={!!deferredInstallPrompt && !isAppInstalled}
        onInstallApp={handleInstallApp}
      />

      {/* Main Workspace */}
      <main className="max-w-4xl mx-auto pt-28 sm:pt-32 px-4 sm:px-8 pb-48">
        <div className="flex flex-col gap-3">
          {/* Zoom Breadcrumb Banner for Mobile or Focus context */}
          {zoomRootId && zoomedNode && (
            <div className={`flex items-center justify-between p-3 px-4 rounded-2xl border ${themeConfig.border} ${themeConfig.cardBg} mb-4`}>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-cyan-400">Focus Mode:</span>
                <span className="opacity-70 truncate max-w-xs">{zoomedNode.content || 'Branch'}</span>
              </div>
              <button
                type="button"
                onClick={() => setZoomRootId(null)}
                className="text-xs font-bold text-cyan-400 hover:underline"
              >
                Reset to Full Document (Esc)
              </button>
            </div>
          )}

          {/* Document Title Header */}
          <div className="mb-8 space-y-2">
            {docId === 'help' ? (
              <h1 className="text-3xl sm:text-5xl font-black italic tracking-tighter bg-gradient-to-br from-cyan-400 via-teal-300 to-cyan-500 bg-clip-text text-transparent opacity-90 cursor-default">
                {title}
              </h1>
            ) : (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-3xl sm:text-5xl font-black italic tracking-tighter outline-none transition-all placeholder:opacity-30"
                placeholder="Your Wote"
              />
            )}
            <div className="flex items-center gap-2 pt-1">
              <div className="h-1 w-10 bg-cyan-400 rounded-full" />
              <span className={`text-[10px] font-bold ${themeConfig.muted} uppercase tracking-[0.25em]`}>
                Wote 3.0 • Tree Node Workspace
              </span>
            </div>
          </div>

          {/* Tree Nodes Rendering */}
          <div className="space-y-1">
            {zoomRootId && zoomedNode ? (
              <NodeItem
                key={zoomedNode.id}
                node={zoomedNode}
                depth={0}
                actions={actions}
                isZoomedRoot={true}
              />
            ) : (
              nodes.map(node => (
                <NodeItem
                  key={node.id}
                  node={node}
                  depth={0}
                  actions={actions}
                />
              ))
            )}
          </div>

          {/* Add Root Bullet Button */}
          {!zoomRootId && (
            <button 
              type="button"
              onClick={() => {
                const newNode: NoteNode = { id: generateId(), type: 'text', content: '', children: [] };
                const nextNodes = [...nodes, newNode];
                setNodes(nextNodes);
                recordHistory(title, nextNodes);
                focusNode(newNode.id);
              }}
              className={`mt-8 flex items-center gap-2 px-4 py-2.5 ${themeConfig.mutedBg} ${themeConfig.hoverBg} border ${themeConfig.mutedBorder} rounded-2xl transition-all ${themeConfig.muted} hover:text-cyan-400 w-fit active:scale-95`}
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">New Root Bullet</span>
            </button>
          )}
        </div>
      </main>

      {/* Library Drawer */}
      <NoteDrawer
        isOpen={isDrawerOpen}
        activeId={docId}
        notes={notesList}
        themeConfig={themeConfig}
        onClose={() => setIsDrawerOpen(false)}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNoteFromLib}
        onDuplicateNote={handleDuplicateNote}
        onOpenHelp={() => handleSelectNote('help')}
      />

      {/* Search Modal (Ctrl+K) */}
      <SearchModal
        isOpen={isSearchOpen}
        nodes={nodes}
        themeConfig={themeConfig}
        onClose={() => setIsSearchOpen(false)}
        onSelectNode={(id) => {
          setZoomRootId(null);
          focusNode(id);
        }}
      />

      {/* Shortcuts & Guide Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        themeConfig={themeConfig}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        theme={theme}
        themeConfig={themeConfig}
        onClose={() => setIsSettingsOpen(false)}
        onSetTheme={handleSetTheme}
        onOpenHelp={() => handleSelectNote('help')}
        onExportAll={handleExportAll}
        canInstall={!!deferredInstallPrompt && !isAppInstalled}
        onInstallApp={handleInstallApp}
      />
    </div>
  );
}
