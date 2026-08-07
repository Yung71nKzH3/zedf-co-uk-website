export type ThemeMode = 'neon-noir' | 'gamer-rgb';

export interface ThemeConfig {
  mode: ThemeMode;
  name: string;
  bgGradStart: string;
  bgGradEnd: string;
  wireframeEmissive: string;
  emissiveIntensity: number;
  accentColor: string;
  secondaryAccent: string;
  panelBg: string;
}

export interface SpecItem {
  label: string;
  value: string;
}

export interface HardwareSpec {
  id: string;
  name: string;
  category: 'pc' | 'monitors' | 'audio' | 'peripherals' | 'creator';
  subtitle: string;
  temperature?: string;
  specs: SpecItem[];
  description: string;
  position: [number, number, number]; // 3D space position in model
  cameraTarget: [number, number, number]; // Target lookAt
  cameraPosition: [number, number, number]; // Camera pos for closeup
}
