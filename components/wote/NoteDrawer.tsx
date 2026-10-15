'use client';

import React, { useState } from 'react';
import { 
  X, Plus, FileText, Trash2, Copy, Search, HelpCircle, 
  Clock, ArrowRight, Download, Upload 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeConfig } from './theme';

export interface NoteSummary {
  id: string;
  title: string;
  updatedAt: number;
  nodeCount: number;
}

interface NoteDrawerProps {
  isOpen: boolean;
  activeId: string;
  notes: NoteSummary[];
  themeConfig: ThemeConfig;
  onClose: () => void;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  onDuplicateNote: (id: string) => void;
  onOpenHelp: () => void;
}

export function NoteDrawer({
  isOpen,
  activeId,
  notes,
  themeConfig,
  onClose,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onDuplicateNote,
  onOpenHelp,
}: NoteDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (ts: number) => {
    if (!ts) return 'Just now';
    const diff = (Date.now() - ts) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer content */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className={`relative z-10 w-full max-w-sm h-full flex flex-col border-r ${themeConfig.border} ${themeConfig.drawerBg} shadow-2xl p-6`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-black text-sm">
                  W
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight">Wote Library</h2>
                  <p className="text-[10px] opacity-50 uppercase tracking-widest">{notes.length} saved notes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={`p-2 rounded-xl ${themeConfig.hoverBg} transition-colors opacity-60 hover:opacity-100`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions & Search */}
            <div className="py-4 space-y-3">
              <button
                type="button"
                onClick={onCreateNote}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Wote</span>
              </button>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                <input
                  type="text"
                  placeholder="Filter your notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border ${themeConfig.mutedBorder} ${themeConfig.inputBg} focus:outline-none focus:ring-1 focus:ring-cyan-500`}
                />
              </div>
            </div>

            {/* Note List */}
            <div className="flex-grow overflow-y-auto space-y-1.5 pr-1 py-1">
              {filteredNotes.map((note) => {
                const isActive = note.id === activeId;
                return (
                  <div
                    key={note.id}
                    onClick={() => {
                      onSelectNote(note.id);
                      onClose();
                    }}
                    className={`group/card flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isActive 
                        ? 'border-cyan-500/50 bg-cyan-500/10 shadow-sm' 
                        : `${themeConfig.border} ${themeConfig.cardBg} ${themeConfig.hoverBg}`
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-cyan-400' : 'opacity-40'}`} />
                      <div className="min-w-0">
                        <div className={`text-xs font-bold truncate ${isActive ? 'text-cyan-300' : ''}`}>
                          {note.title || 'Untitled Wote'}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] opacity-40 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {formatTime(note.updatedAt)}
                          </span>
                          <span>•</span>
                          <span>{note.nodeCount} bullets</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateNote(note.id);
                        }}
                        className="p-1 rounded hover:bg-white/10 opacity-70 hover:opacity-100"
                        title="Duplicate"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${note.title || 'Untitled'}"?`)) {
                            onDeleteNote(note.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-red-500/20 text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredNotes.length === 0 && (
                <div className="text-center py-8 opacity-40 text-xs">
                  No notes found
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  onOpenHelp();
                  onClose();
                }}
                className="flex items-center gap-1.5 opacity-60 hover:opacity-100 hover:text-cyan-400 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Help Manual</span>
              </button>
              <span className="text-[10px] font-mono opacity-40">v3.0 Web</span>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
