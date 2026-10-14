'use client';

import React from 'react';
import { X, Sun, Moon, Monitor, Download, Upload, Info, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeType } from './types';
import { ThemeConfig } from './theme';

interface SettingsModalProps {
  isOpen: boolean;
  theme: ThemeType;
  themeConfig: ThemeConfig;
  onClose: () => void;
  onSetTheme: (theme: ThemeType) => void;
  onOpenHelp: () => void;
  onExportAll: () => void;
}

export function SettingsModal({
  isOpen,
  theme,
  themeConfig,
  onClose,
  onSetTheme,
  onOpenHelp,
  onExportAll,
}: SettingsModalProps) {
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
            className={`relative w-full max-w-sm rounded-3xl border ${themeConfig.border} ${themeConfig.cardBg} shadow-2xl p-6 sm:p-8 flex flex-col gap-6`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold tracking-tight">Wote Settings</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl opacity-60 hover:opacity-100 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Appearance */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">Theme</span>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ['willow', Sun, 'Willow'],
                  ['dark', Moon, 'Dark'],
                  ['light', Monitor, 'Light'],
                ] as const).map(([t, Icon, label]) => {
                  const isActive = theme === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => onSetTheme(t)}
                      className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border transition-all ${
                        isActive
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold shadow-md shadow-cyan-500/10'
                          : `${themeConfig.border} ${themeConfig.inputBg} opacity-70 hover:opacity-100 hover:border-white/30`
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[11px]">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Backup & Data */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">Data Management</span>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={onExportAll}
                  className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl border ${themeConfig.border} ${themeConfig.inputBg} hover:border-cyan-400 text-xs font-semibold transition-all`}
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Backup All Notes (.json)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenHelp();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all"
                >
                  <Info className="w-4 h-4" />
                  <span>Open Help Manual</span>
                </button>
              </div>
            </div>

            {/* Version */}
            <div className="text-center text-[10px] opacity-40 font-mono">
              Wote 3.0 • Web Edition
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
