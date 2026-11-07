'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NoteNode } from './types';
import { ThemeConfig } from './theme';

interface SearchModalProps {
  isOpen: boolean;
  nodes: NoteNode[];
  themeConfig: ThemeConfig;
  onClose: () => void;
  onSelectNode: (id: string) => void;
}

interface SearchResult {
  id: string;
  type: string;
  content: string;
  snippet: string;
}

export function SearchModal({
  isOpen,
  nodes,
  themeConfig,
  onClose,
  onSelectNode,
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Flatten all nodes
  const allNodes: NoteNode[] = [];
  const traverse = (list: NoteNode[]) => {
    for (const n of list) {
      allNodes.push(n);
      if (n.children && n.children.length > 0) {
        traverse(n.children);
      }
    }
  };
  traverse(nodes);

  const cleanQuery = query.toLowerCase().trim();
  const results: SearchResult[] = cleanQuery
    ? allNodes
        .filter(n => (n.content || '').toLowerCase().includes(cleanQuery))
        .map(n => ({
          id: n.id,
          type: n.type,
          content: n.content,
          snippet: n.content.length > 80 ? n.content.slice(0, 80) + '...' : n.content,
        }))
        .slice(0, 10)
    : [];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (results.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (results.length || 1)) % (results.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        onSelectNode(results[selectedIndex].id);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            className={`relative w-full max-w-xl rounded-2xl border ${themeConfig.border} ${themeConfig.cardBg} shadow-2xl overflow-hidden`}
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 border-b border-white/10">
              <Search className="w-4 h-4 opacity-50 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search notes, thoughts, tasks, code..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-4 bg-transparent outline-none text-sm placeholder:opacity-40"
              />
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 opacity-50 shrink-0">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto p-2">
              {results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((res, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => {
                          onSelectNode(res.id);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${
                          isSelected ? `${themeConfig.activeBg} font-semibold` : themeConfig.hoverBg
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-3.5 h-3.5 opacity-50 shrink-0" />
                          <div className="truncate text-xs">
                            <span className="opacity-90">{res.snippet || 'Empty node'}</span>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-mono opacity-40 shrink-0 ml-2">
                          {res.type}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : query ? (
                <div className="text-center py-10 opacity-40 text-xs">
                  No matching nodes found for &quot;{query}&quot;
                </div>
              ) : (
                <div className="text-center py-8 opacity-40 text-xs">
                  Type words to search within the current document
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
