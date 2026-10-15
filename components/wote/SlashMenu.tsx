'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  Type, Heading1, Heading2, Heading3, CheckSquare, 
  Code2, FileText, Quote, AlertCircle, ImageIcon, Minus
} from 'lucide-react';
import { NodeType, CalloutType } from './types';
import { ThemeConfig } from './theme';

export interface SlashItem {
  type: NodeType;
  label: string;
  desc: string;
  icon: typeof Type;
  shortcut?: string;
  calloutType?: CalloutType;
}

const ITEMS: SlashItem[] = [
  { type: 'text', label: 'Bullet Text', desc: 'Standard outliner thought', icon: Type, shortcut: '-' },
  { type: 'heading1', label: 'Heading 1', desc: 'Large section heading', icon: Heading1, shortcut: '#' },
  { type: 'heading2', label: 'Heading 2', desc: 'Medium section heading', icon: Heading2, shortcut: '##' },
  { type: 'heading3', label: 'Heading 3', desc: 'Small section heading', icon: Heading3, shortcut: '###' },
  { type: 'todo', label: 'To-Do Task', desc: 'Interactive checkbox item', icon: CheckSquare, shortcut: '[]' },
  { type: 'code', label: 'Code Block', desc: 'Syntax highlighted code block', icon: Code2, shortcut: '```' },
  { type: 'quote', label: 'Quote', desc: 'Capture a quote or excerpt', icon: Quote, shortcut: '>' },
  { type: 'callout', label: 'Callout (Tip/Note)', desc: 'Highlighted callout banner', icon: AlertCircle, calloutType: 'info' },
  { type: 'image', label: 'Image', desc: 'Paste image or embed URL', icon: ImageIcon },
  { type: 'divider', label: 'Divider', desc: 'Horizontal separation line', icon: Minus, shortcut: '---' },
];

interface SlashMenuProps {
  query: string;
  themeConfig: ThemeConfig;
  onSelect: (type: NodeType, calloutType?: CalloutType) => void;
  onClose: () => void;
}

export function SlashMenu({ query, themeConfig, onSelect, onClose }: SlashMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const cleanQuery = query.replace(/^\//, '').toLowerCase().trim();
  const filtered = ITEMS.filter(item => 
    item.label.toLowerCase().includes(cleanQuery) || 
    item.desc.toLowerCase().includes(cleanQuery) ||
    item.type.toLowerCase().includes(cleanQuery)
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [cleanQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onSelect(filtered[selectedIndex].type, filtered[selectedIndex].calloutType);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [filtered, selectedIndex, onSelect, onClose]);

  if (filtered.length === 0) return null;

  return (
    <div 
      ref={containerRef}
      className={`absolute left-0 top-full mt-2 z-50 w-72 max-h-72 overflow-y-auto rounded-2xl border ${themeConfig.border} ${themeConfig.cardBg} shadow-2xl p-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150`}
    >
      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider opacity-50">
        Turn into / Insert Block
      </div>
      <div className="space-y-0.5">
        {filtered.map((item, idx) => {
          const Icon = item.icon;
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={item.type + (item.calloutType || '')}
              type="button"
              onClick={() => onSelect(item.type, item.calloutType)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                isSelected ? `${themeConfig.activeBg} font-semibold` : themeConfig.hoverBg
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-1.5 rounded-lg ${themeConfig.mutedBg} shrink-0`}>
                  <Icon className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="truncate">
                  <div className="truncate">{item.label}</div>
                  <div className="text-[10px] opacity-50 truncate">{item.desc}</div>
                </div>
              </div>
              {item.shortcut && (
                <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${themeConfig.mutedBg} border ${themeConfig.mutedBorder} opacity-60 shrink-0`}>
                  {item.shortcut}
                </kbd>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
