'use client';

import React from 'react';
import { X, Keyboard, MousePointer, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeConfig } from './theme';

interface ShortcutsModalProps {
  isOpen: boolean;
  themeConfig: ThemeConfig;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, themeConfig, onClose }: ShortcutsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className={`relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl border ${themeConfig.border} ${themeConfig.cardBg} shadow-2xl p-6 sm:p-8 flex flex-col gap-6`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Keyboard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Wote 3.0 Shortcuts & Controls</h2>
                  <p className="text-xs opacity-50">Web-tailored mouse + keyboard synergies</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl opacity-60 hover:opacity-100 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mouse Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                <MousePointer className="w-4 h-4" />
                <span>Mouse Affordances</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  ['Click Bullet Dot', 'Zoom into branch (focus mode)'],
                  ['Drag Grip Handle', 'Reorder, indent, or move node'],
                  ['Click Chevron', 'Expand or collapse children'],
                  ['Hover Action Bar', '+ Child, Sibling, Type Switch, Trash'],
                  ['Click Checkbox', 'Toggle task complete state'],
                  ['Click Breadcrumbs', 'Navigate back up zoom hierarchy'],
                ].map(([action, desc]) => (
                  <div key={action} className={`p-2.5 rounded-xl border ${themeConfig.mutedBorder} ${themeConfig.inputBg} flex flex-col gap-1`}>
                    <span className="font-bold text-cyan-300">{action}</span>
                    <span className="opacity-60 text-[11px]">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Keyboard Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Keyboard className="w-4 h-4" />
                <span>Keyboard Shortcuts</span>
              </div>
              <div className="space-y-1.5">
                {[
                  ['Enter', 'Create sibling node below'],
                  ['Tab', 'Indent node (nest under previous)'],
                  ['Shift + Tab', 'Outdent node (move up a level)'],
                  ['Alt + Up / Down', 'Move cursor focus between nodes'],
                  ['Ctrl + /', 'Toggle collapse current node'],
                  ['Ctrl + K', 'Quick search across all notes'],
                  ['Ctrl + Z / Ctrl + Shift + Z', 'Undo / Redo history'],
                  ['Ctrl + V', 'Paste image from clipboard directly'],
                ].map(([keys, desc]) => (
                  <div key={keys} className={`flex items-center justify-between p-2.5 rounded-xl border ${themeConfig.mutedBorder} ${themeConfig.inputBg}`}>
                    <span className="text-xs opacity-70">{desc}</span>
                    <kbd className="px-2 py-1 rounded bg-black/30 border border-white/10 text-[11px] font-mono font-bold text-cyan-400">
                      {keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Markdown Auto-Formatting */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                <Sparkles className="w-4 h-4" />
                <span>Auto-formatting & Commands</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  ['# ', 'Heading 1'],
                  ['## ', 'Heading 2'],
                  ['### ', 'Heading 3'],
                  ['[] ', 'Checkbox'],
                  ['> ', 'Quote'],
                  ['```', 'Code Block'],
                  ['---', 'Divider'],
                  ['/ ', 'Slash Menu'],
                ].map(([trigger, name]) => (
                  <div key={trigger} className={`p-2 rounded-xl border ${themeConfig.mutedBorder} ${themeConfig.inputBg} text-center`}>
                    <code className="text-xs font-mono font-bold text-purple-300">{trigger}</code>
                    <div className="text-[10px] opacity-60 mt-0.5">{name}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
