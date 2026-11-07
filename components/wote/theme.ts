import { ThemeType } from './types';

export interface ThemeConfig {
  bg: string;
  text: string;
  primary: string;
  border: string;
  cardBg: string;
  hoverBg: string;
  activeBg: string;
  nodeHoverBg: string;
  muted: string;
  mutedBg: string;
  mutedBorder: string;
  accent: string;
  accentText: string;
  codeBg: string;
  inputBg: string;
  drawerBg: string;
  dotColor: string;
}

export const THEMES: Record<ThemeType, ThemeConfig> = {
  willow: {
    bg: 'bg-[#181d14]',
    text: 'text-[#e5ede3]',
    primary: 'text-[#9cb094]',
    border: 'border-[#2d3827]',
    cardBg: 'bg-[#20271b]',
    hoverBg: 'hover:bg-[#252e1f]',
    activeBg: 'bg-[#2a3523]',
    nodeHoverBg: 'group-hover/node:bg-[#222a1d]/60',
    muted: 'text-[#8e9e87]',
    mutedBg: 'bg-white/5',
    mutedBorder: 'border-white/10',
    accent: 'bg-emerald-500',
    accentText: 'text-emerald-400',
    codeBg: 'bg-[#11160e]',
    inputBg: 'bg-[#141811]',
    drawerBg: 'bg-[#151a12]',
    dotColor: '#4d5c47',
  },
  dark: {
    bg: 'bg-[#0a0a0a]',
    text: 'text-[#ededed]',
    primary: 'text-[#a1a1aa]',
    border: 'border-white/10',
    cardBg: 'bg-[#141414]',
    hoverBg: 'hover:bg-[#1f1f1f]',
    activeBg: 'bg-[#262626]',
    nodeHoverBg: 'group-hover/node:bg-[#171717]',
    muted: 'text-[#71717a]',
    mutedBg: 'bg-white/5',
    mutedBorder: 'border-white/10',
    accent: 'bg-cyan-500',
    accentText: 'text-cyan-400',
    codeBg: 'bg-[#050505]',
    inputBg: 'bg-[#101010]',
    drawerBg: 'bg-[#0f0f0f]',
    dotColor: '#27272a',
  },
  light: {
    bg: 'bg-[#f8fafc]',
    text: 'text-[#0f172a]',
    primary: 'text-[#475569]',
    border: 'border-black/10',
    cardBg: 'bg-white',
    hoverBg: 'hover:bg-slate-100',
    activeBg: 'bg-slate-200',
    nodeHoverBg: 'group-hover/node:bg-slate-100/70',
    muted: 'text-[#64748b]',
    mutedBg: 'bg-black/5',
    mutedBorder: 'border-black/10',
    accent: 'bg-teal-600',
    accentText: 'text-teal-600',
    codeBg: 'bg-[#f1f5f9]',
    inputBg: 'bg-[#f1f5f9]',
    drawerBg: 'bg-[#f1f5f9]',
    dotColor: '#cbd5e1',
  },
};
