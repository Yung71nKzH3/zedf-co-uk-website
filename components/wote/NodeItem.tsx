'use client';

import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { 
  ChevronRight, ChevronDown, GripVertical, Plus, Trash2, 
  Copy, Check, ExternalLink, Info, AlertTriangle, Lightbulb, CheckCircle2,
  Code2, FileText, CheckSquare, Type, Heading1, Heading2, Heading3, Quote, AlertCircle, ImageIcon, Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

import { NoteNode, NodeType, CalloutType } from './types';
import { ThemeConfig } from './theme';
import { SlashMenu } from './SlashMenu';

export interface NodeActions {
  updateNode: (id: string, updates: Partial<NoteNode>) => void;
  addSibling: (id: string) => void;
  addChild: (id: string) => void;
  deleteNode: (id: string) => void;
  indentNode: (id: string) => void;
  outdentNode: (id: string) => void;
  cycleType: (id: string) => void;
  focusRelativeNode: (id: string, dir: 'up' | 'down') => void;
  zoomInto: (id: string) => void;
  moveNode: (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
  themeConfig: ThemeConfig;
  theme: string;
}

const SUPPORTED_LANGS = [
  'javascript', 'typescript', 'python', 'html', 'css', 
  'json', 'bash', 'sql', 'markdown', 'plaintext'
];

interface NodeItemProps {
  node: NoteNode;
  depth: number;
  actions: NodeActions;
  isZoomedRoot?: boolean;
}

export const NodeItem = memo(({ node, depth, actions, isZoomedRoot }: NodeItemProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const lastContent = useRef(node.content);
  const [showSlash, setShowSlash] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [dragOverPosition, setDragOverPosition] = useState<'before' | 'after' | 'inside' | null>(null);

  const { themeConfig, theme } = actions;

  // Sync content with DOM
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerText !== node.content) {
      contentRef.current.innerText = node.content;
      lastContent.current = node.content;
    }
  }, [node.content]);

  // Handle direct image paste anywhere on this node
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            e.preventDefault();
            const reader = new FileReader();
            reader.onload = (loadEvt) => {
              const base64 = loadEvt.target?.result as string;
              actions.updateNode(node.id, { 
                type: 'image', 
                imageUrl: base64,
                content: node.content || 'Pasted image'
              });
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
    }
  }, [actions, node.id, node.content]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText;
    lastContent.current = text;

    // Trigger Markdown auto-transforms at start of line
    if (text === '# ') {
      actions.updateNode(node.id, { type: 'heading1', content: '' });
      if (contentRef.current) contentRef.current.innerText = '';
      return;
    }
    if (text === '## ') {
      actions.updateNode(node.id, { type: 'heading2', content: '' });
      if (contentRef.current) contentRef.current.innerText = '';
      return;
    }
    if (text === '### ') {
      actions.updateNode(node.id, { type: 'heading3', content: '' });
      if (contentRef.current) contentRef.current.innerText = '';
      return;
    }
    if (text === '[] ' || text === '- [ ] ') {
      actions.updateNode(node.id, { type: 'todo', content: '', checked: false });
      if (contentRef.current) contentRef.current.innerText = '';
      return;
    }
    if (text === '> ') {
      actions.updateNode(node.id, { type: 'quote', content: '' });
      if (contentRef.current) contentRef.current.innerText = '';
      return;
    }
    if (text === '```') {
      actions.updateNode(node.id, { type: 'code', content: '', language: 'javascript' });
      if (contentRef.current) contentRef.current.innerText = '';
      return;
    }
    if (text === '---') {
      actions.updateNode(node.id, { type: 'divider', content: '' });
      if (contentRef.current) contentRef.current.innerText = '';
      return;
    }

    // Slash command trigger
    if (text.startsWith('/')) {
      setShowSlash(true);
      setSlashQuery(text);
    } else {
      if (showSlash) setShowSlash(false);
    }

    actions.updateNode(node.id, { content: text });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSlash) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter' || e.key === 'Escape') {
        // Let SlashMenu handle it via global listeners
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setShowSlash(false);
      actions.addSibling(node.id);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        actions.outdentNode(node.id);
      } else {
        actions.indentNode(node.id);
      }
    } else if (e.key === 'ArrowUp' && (e.altKey || !e.shiftKey)) {
      if (e.altKey) {
        e.preventDefault();
        actions.focusRelativeNode(node.id, 'up');
      }
    } else if (e.key === 'ArrowDown' && (e.altKey || !e.shiftKey)) {
      if (e.altKey) {
        e.preventDefault();
        actions.focusRelativeNode(node.id, 'down');
      }
    } else if (e.key === 'Backspace' && node.content === '') {
      if (node.type !== 'text') {
        e.preventDefault();
        actions.updateNode(node.id, { type: 'text' });
      } else {
        e.preventDefault();
        actions.deleteNode(node.id);
      }
    } else if (e.key === '/' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      actions.updateNode(node.id, { collapsed: !node.collapsed });
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/wote-node-id', node.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    if (y < height * 0.25) {
      setDragOverPosition('before');
    } else if (y > height * 0.75) {
      setDragOverPosition('after');
    } else {
      setDragOverPosition('inside');
    }
  };

  const handleDragLeave = () => {
    setDragOverPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceId = e.dataTransfer.getData('text/wote-node-id');
    if (sourceId && dragOverPosition) {
      actions.moveNode(sourceId, node.id, dragOverPosition);
    }
    setDragOverPosition(null);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(node.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getCalloutIcon = (cType?: CalloutType) => {
    switch (cType) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
      case 'tip': return <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
      case 'success': return <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />;
      default: return <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />;
    }
  };

  const renderTypeIcon = () => {
    switch (node.type) {
      case 'heading1': return <Heading1 className="w-3.5 h-3.5 text-cyan-400" />;
      case 'heading2': return <Heading2 className="w-3.5 h-3.5 text-cyan-400" />;
      case 'heading3': return <Heading3 className="w-3.5 h-3.5 text-cyan-400" />;
      case 'todo': return <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />;
      case 'code': return <Code2 className="w-3.5 h-3.5 text-amber-400" />;
      case 'markdown': return <FileText className="w-3.5 h-3.5 text-sky-400" />;
      case 'quote': return <Quote className="w-3.5 h-3.5 text-purple-400" />;
      case 'callout': return <AlertCircle className="w-3.5 h-3.5 text-pink-400" />;
      case 'image': return <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />;
      case 'divider': return <Minus className="w-3.5 h-3.5 text-zinc-400" />;
      default: return <Type className={`w-3.5 h-3.5 ${themeConfig.muted}`} />;
    }
  };

  // Content Renderer
  const renderEditorContent = () => {
    if (node.type === 'divider') {
      return (
        <div className="w-full py-2 group/div flex items-center">
          <hr className={`w-full border-t ${themeConfig.mutedBorder}`} />
        </div>
      );
    }

    if (node.type === 'image') {
      return (
        <div className="space-y-3 w-full py-1">
          {node.imageUrl ? (
            <div className="relative group/img rounded-2xl overflow-hidden border border-white/10 max-w-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={node.imageUrl} 
                alt={node.content || 'Wote visual note'} 
                className="w-full max-h-96 object-contain bg-black/30"
              />
              <button
                type="button"
                onClick={() => actions.updateNode(node.id, { imageUrl: '' })}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black text-white text-xs opacity-0 group-hover/img:opacity-100 transition-opacity"
              >
                Change Image
              </button>
            </div>
          ) : (
            <div className={`p-4 rounded-xl border border-dashed ${themeConfig.mutedBorder} ${themeConfig.inputBg} space-y-2`}>
              <div className="text-xs font-semibold opacity-70">Paste Image or Enter Image URL:</div>
              <input
                type="text"
                placeholder="https://example.com/image.png"
                value={node.imageUrl || ''}
                onChange={(e) => actions.updateNode(node.id, { imageUrl: e.target.value })}
                className={`w-full px-3 py-1.5 rounded-lg text-xs border ${themeConfig.mutedBorder} ${themeConfig.cardBg} focus:outline-none focus:ring-1 focus:ring-cyan-500`}
              />
              <div className="text-[10px] opacity-40">Tip: You can also copy any image and press Ctrl+V right here!</div>
            </div>
          )}
          <input
            type="text"
            placeholder="Add image caption..."
            value={node.content}
            onChange={(e) => actions.updateNode(node.id, { content: e.target.value })}
            className={`w-full bg-transparent text-xs ${themeConfig.muted} outline-none italic`}
          />
        </div>
      );
    }

    if (node.type === 'code' && !node.isEditing) {
      let highlighted = node.content;
      try {
        if (node.language && hljs.getLanguage(node.language)) {
          highlighted = hljs.highlight(node.content || ' ', { language: node.language }).value;
        } else {
          highlighted = hljs.highlightAuto(node.content || ' ').value;
        }
      } catch {
        highlighted = node.content;
      }

      return (
        <div className="space-y-1.5 w-full my-1">
          <div className="flex items-center justify-between text-[11px] px-2 opacity-60">
            <select
              value={node.language || 'javascript'}
              onChange={(e) => actions.updateNode(node.id, { language: e.target.value })}
              className={`bg-transparent font-mono cursor-pointer outline-none ${themeConfig.text}`}
            >
              {SUPPORTED_LANGS.map(lang => (
                <option key={lang} value={lang} className="bg-zinc-900 text-white">{lang}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                title="Copy code"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
          <pre 
            onClick={() => actions.updateNode(node.id, { isEditing: true })}
            className={`p-4 rounded-xl font-mono text-xs overflow-x-auto cursor-text border ${themeConfig.border} ${themeConfig.codeBg} hover:border-cyan-500/40 transition-colors leading-relaxed`}
          >
            <code dangerouslySetInnerHTML={{ __html: highlighted || ' ' }} />
          </pre>
        </div>
      );
    }

    if (node.type === 'markdown' && !node.isEditing) {
      return (
        <div 
          onClick={() => actions.updateNode(node.id, { isEditing: true })}
          className="prose prose-invert prose-sm max-w-none cursor-text p-1 py-1.5 hover:opacity-90"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(node.content || '*Empty markdown block (click to edit)*') as string) }}
        />
      );
    }

    // Editable block
    let fontStyle = 'font-sans text-sm';
    if (node.type === 'heading1') {
      fontStyle = 'text-2xl sm:text-3xl font-black tracking-tight text-cyan-400';
    } else if (node.type === 'heading2') {
      fontStyle = 'text-xl sm:text-2xl font-bold tracking-tight text-cyan-300';
    } else if (node.type === 'heading3') {
      fontStyle = 'text-base sm:text-lg font-semibold tracking-tight';
    } else if (node.type === 'code') {
      fontStyle = 'font-mono text-xs text-amber-300';
    } else if (theme === 'willow') {
      fontStyle = 'font-serif text-sm';
    }

    return (
      <div className="relative w-full">
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={() => {
            if (node.type === 'code' || node.type === 'markdown') {
              actions.updateNode(node.id, { isEditing: false });
            }
          }}
          className={`outline-none min-h-[1.5em] w-full p-1 selection:bg-cyan-500/30 ${fontStyle} ${
            node.checked ? 'line-through opacity-40' : ''
          }`}
          data-placeholder={node.type === 'text' ? 'Type something or / for commands...' : ''}
        />

        {showSlash && (
          <SlashMenu
            query={slashQuery}
            themeConfig={themeConfig}
            onSelect={(type, calloutType) => {
              setShowSlash(false);
              actions.updateNode(node.id, { type, calloutType, content: '' });
              if (contentRef.current) {
                contentRef.current.innerText = '';
                contentRef.current.focus();
              }
            }}
            onClose={() => setShowSlash(false)}
          />
        )}
      </div>
    );
  };

  return (
    <div 
      className="group/node relative"
      data-id={node.id}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop position indicator */}
      {dragOverPosition === 'before' && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-400 z-30 rounded-full" />
      )}
      {dragOverPosition === 'after' && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 z-30 rounded-full" />
      )}

      <div className={`flex items-start gap-1 py-0.5 rounded-2xl transition-all duration-200 ${
        dragOverPosition === 'inside' ? 'bg-cyan-500/10 ring-1 ring-cyan-500/40' : ''
      }`}>
        {/* Left gutter: Drag Handle + Expand Chevron + Bullet dot */}
        <div className="flex items-center gap-0.5 mt-1 shrink-0">
          {/* Drag Handle */}
          <div
            draggable
            onDragStart={handleDragStart}
            className={`p-0.5 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover/node:opacity-60 hover:!opacity-100 transition-opacity ${themeConfig.hoverBg}`}
            title="Drag to reorder or nest"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          {/* Expand/Collapse Chevron */}
          <button 
            type="button"
            onClick={() => actions.updateNode(node.id, { collapsed: !node.collapsed })}
            className={`p-0.5 rounded transition-colors ${themeConfig.hoverBg} ${
              !node.children || node.children.length === 0 ? 'invisible' : ''
            }`}
            title={node.collapsed ? 'Expand node' : 'Collapse node'}
          >
            {node.collapsed ? (
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            )}
          </button>

          {/* Bullet Dot / Zoom Button */}
          <button
            type="button"
            onClick={() => actions.zoomInto(node.id)}
            className={`w-4 h-4 rounded-full flex items-center justify-center group/bullet hover:bg-cyan-500/20 transition-all ${
              isZoomedRoot ? 'ring-2 ring-cyan-400' : ''
            }`}
            title="Click to zoom / focus on this branch"
          >
            <div className={`w-2 h-2 rounded-full transition-all group-hover/bullet:scale-125 ${
              node.children && node.children.length > 0
                ? 'bg-cyan-400 ring-2 ring-cyan-500/20'
                : 'bg-current opacity-40 group-hover/bullet:opacity-100'
            }`} />
          </button>
        </div>

        {/* Node Body Container */}
        <div className={`flex-grow flex items-start gap-2.5 rounded-xl p-1.5 transition-all duration-200 border border-transparent ${
          node.isEditing ? `${themeConfig.mutedBg} ring-1 ring-cyan-500/30` : themeConfig.nodeHoverBg
        }`}>
          {/* Type-specific prefix */}
          {node.type === 'todo' && (
            <button 
              type="button"
              onClick={() => actions.updateNode(node.id, { checked: !node.checked })}
              className={`mt-1 w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                node.checked 
                  ? 'bg-emerald-500 border-emerald-500 shadow-sm' 
                  : `${themeConfig.border} hover:border-cyan-400`
              }`}
            >
              {node.checked && <Check className="w-3 h-3 text-black stroke-[3]" />}
            </button>
          )}

          {node.type === 'callout' && getCalloutIcon(node.calloutType)}
          {node.type === 'quote' && (
            <div className="w-1 self-stretch bg-purple-500/60 rounded-full shrink-0 mr-1" />
          )}

          {/* The Content */}
          <div className="flex-grow min-w-0">
            {renderEditorContent()}
          </div>

          {/* Collapsed Children Badge Counter */}
          {node.collapsed && node.children && node.children.length > 0 && (
            <button
              type="button"
              onClick={() => actions.updateNode(node.id, { collapsed: false })}
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${themeConfig.mutedBg} border ${themeConfig.mutedBorder} opacity-60 hover:opacity-100 transition-opacity shrink-0`}
            >
              +{node.children.length}
            </button>
          )}

          {/* Hover Actions Menu */}
          <div className="flex items-center gap-1 opacity-0 group-hover/node:opacity-100 transition-opacity pl-1 shrink-0">
            {/* Add Child */}
            <button
              type="button"
              onClick={() => actions.addChild(node.id)}
              className={`p-1 rounded-lg ${themeConfig.muted} hover:text-cyan-400 ${themeConfig.hoverBg} transition-colors`}
              title="Add child node (Tab)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {/* Change Type */}
            <button
              type="button"
              onClick={() => actions.cycleType(node.id)}
              className={`p-1 rounded-lg flex items-center gap-1 ${themeConfig.mutedBg} ${themeConfig.hoverBg} transition-colors`}
              title={`Type: ${node.type} (Click to switch)`}
            >
              {renderTypeIcon()}
            </button>

            {/* Delete */}
            <button 
              type="button"
              onClick={() => actions.deleteNode(node.id)}
              className={`p-1 rounded-lg ${themeConfig.muted} hover:text-red-400 hover:bg-red-500/10 transition-colors`}
              title="Delete node"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Children Subtree */}
      <AnimatePresence initial={false}>
        {!node.collapsed && node.children && node.children.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`ml-5 sm:ml-7 border-l ${themeConfig.border} pl-2 sm:pl-3 overflow-hidden`}
          >
            {node.children.map(child => (
              <NodeItem 
                key={child.id} 
                node={child} 
                depth={depth + 1} 
                actions={actions} 
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

NodeItem.displayName = 'NodeItem';
