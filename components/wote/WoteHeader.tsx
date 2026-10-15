'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, FolderOpen, ChevronRight, Home, Undo2, Redo2, 
  Search, Download, Upload, Keyboard, Settings, FileDown, Check
} from 'lucide-react';
import { ThemeConfig } from './theme';
import { NoteNode } from './types';

interface WoteHeaderProps {
  themeConfig: ThemeConfig;
  notesCount: number;
  zoomPath: NoteNode[];
  canUndo: boolean;
  canRedo: boolean;
  onOpenDrawer: () => void;
  onResetZoom: () => void;
  onZoomToNode: (id: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onOpenSearch: () => void;
  onOpenShortcuts: () => void;
  onOpenSettings: () => void;
  onExportWote: () => void;
  onExportMarkdown: () => void;
  onImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  canInstall?: boolean;
  onInstallApp?: () => void;
}

export function WoteHeader({
  themeConfig,
  notesCount,
  zoomPath,
  canUndo,
  canRedo,
  onOpenDrawer,
  onResetZoom,
  onZoomToNode,
  onUndo,
  onRedo,
  onOpenSearch,
  onOpenShortcuts,
  onOpenSettings,
  onExportWote,
  onExportMarkdown,
  onImportFile,
  canInstall,
  onInstallApp,
}: WoteHeaderProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-40 p-3 sm:p-5 flex items-center justify-between gap-2 pointer-events-none">
      {/* Left: Back + Library + Breadcrumbs */}
      <div className="flex items-center gap-2 pointer-events-auto min-w-0">
        <Link
          href="/"
          className={`p-2.5 rounded-xl border ${themeConfig.border} ${themeConfig.cardBg} ${themeConfig.hoverBg} backdrop-blur-md transition-all active:scale-95 group shrink-0`}
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
        </Link>

        {/* Library Drawer Toggle */}
        <button
          type="button"
          onClick={onOpenDrawer}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${themeConfig.border} ${themeConfig.cardBg} ${themeConfig.hoverBg} backdrop-blur-md transition-all active:scale-95 shrink-0`}
          title="Open Notes Library"
        >
          <FolderOpen className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold hidden sm:inline">Notes</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${themeConfig.mutedBg} ${themeConfig.muted}`}>
            {notesCount}
          </span>
        </button>

        {/* PWA Install Button */}
        {canInstall && onInstallApp && (
          <button
            type="button"
            onClick={onInstallApp}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
            title="Install Wote Desktop App"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        {/* Breadcrumb Navigation when zoomed in */}
        {zoomPath.length > 0 && (
          <nav className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl border ${themeConfig.border} ${themeConfig.cardBg} backdrop-blur-md text-xs truncate max-w-md`}>
            <button
              type="button"
              onClick={onResetZoom}
              className="flex items-center gap-1 opacity-60 hover:opacity-100 hover:text-cyan-400 transition-colors shrink-0"
              title="Return to full document"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Root</span>
            </button>

            {zoomPath.map((item, idx) => {
              const isLast = idx === zoomPath.length - 1;
              return (
                <div key={item.id} className="flex items-center gap-1.5 truncate">
                  <ChevronRight className="w-3 h-3 opacity-30 shrink-0" />
                  <button
                    type="button"
                    onClick={() => onZoomToNode(item.id)}
                    className={`truncate transition-colors ${
                      isLast 
                        ? 'font-bold text-cyan-300' 
                        : 'opacity-60 hover:opacity-100 hover:text-cyan-400'
                    }`}
                  >
                    {item.content ? item.content.slice(0, 24) : 'Node'}
                  </button>
                </div>
              );
            })}
          </nav>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
        {/* Undo & Redo */}
        <div className={`hidden sm:flex items-center border ${themeConfig.border} ${themeConfig.cardBg} rounded-xl backdrop-blur-md p-0.5`}>
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-colors ${
              canUndo ? `${themeConfig.hoverBg} text-current` : 'opacity-20 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-colors ${
              canRedo ? `${themeConfig.hoverBg} text-current` : 'opacity-20 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Search */}
        <button
          type="button"
          onClick={onOpenSearch}
          className={`p-2.5 sm:px-3 rounded-xl border ${themeConfig.border} ${themeConfig.cardBg} ${themeConfig.hoverBg} backdrop-blur-md transition-all flex items-center gap-2`}
          title="Search Document (Ctrl+K)"
        >
          <Search className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold hidden lg:inline opacity-70">Search</span>
          <kbd className="hidden lg:inline text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 opacity-60">Ctrl+K</kbd>
        </button>

        {/* Export Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="bg-cyan-500 hover:bg-cyan-400 text-black p-2.5 sm:px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95"
            title="Export Document"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {showExportMenu && (
            <div className={`absolute right-0 top-full mt-2 z-50 w-48 rounded-2xl border ${themeConfig.border} ${themeConfig.cardBg} shadow-2xl p-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95`}>
              <button
                type="button"
                onClick={() => {
                  setShowExportMenu(false);
                  onExportWote();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs ${themeConfig.hoverBg} transition-colors`}
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="font-bold">Export .wote</div>
                  <div className="text-[10px] opacity-50">Native file format</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowExportMenu(false);
                  onExportMarkdown();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs ${themeConfig.hoverBg} transition-colors`}
              >
                <FileDown className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-bold">Export Markdown</div>
                  <div className="text-[10px] opacity-50">Standard .md file</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Load / Import */}
        <label
          className={`p-2.5 rounded-xl border ${themeConfig.border} ${themeConfig.cardBg} ${themeConfig.hoverBg} backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95`}
          title="Import .wote file"
        >
          <Upload className="w-4 h-4 opacity-70" />
          <input type="file" className="hidden" onChange={onImportFile} accept=".wote,.json,.md" />
        </label>

        {/* Shortcuts Modal Trigger */}
        <button
          type="button"
          onClick={onOpenShortcuts}
          className={`hidden sm:flex p-2.5 rounded-xl border ${themeConfig.border} ${themeConfig.cardBg} ${themeConfig.hoverBg} backdrop-blur-md transition-all`}
          title="Keyboard & Mouse Shortcuts"
        >
          <Keyboard className="w-4 h-4 opacity-70" />
        </button>

        {/* Settings Modal Trigger */}
        <button
          type="button"
          onClick={onOpenSettings}
          className={`p-2.5 rounded-xl border ${themeConfig.border} ${themeConfig.cardBg} ${themeConfig.hoverBg} backdrop-blur-md transition-all`}
          title="Settings & Themes"
        >
          <Settings className="w-4 h-4 opacity-70" />
        </button>
      </div>
    </header>
  );
}
