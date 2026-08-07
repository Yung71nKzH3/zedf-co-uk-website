'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { DeskSetup } from './DeskSetup';
import { CameraManager } from './CameraManager';
import { useThemeContext } from '@/context/setup/ThemeContext';

export default function SceneCanvas() {
  const { theme } = useThemeContext();

  return (
    <div className="w-full h-full relative overflow-hidden select-none bg-black">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 2.5, 5.5], fov: 45 }}
        style={{
          background: `radial-gradient(circle at 50% 30%, ${theme.bgGradEnd} 0%, ${theme.bgGradStart} 100%)`,
        }}
      >
        {/* Ambient & Cybernetic Spotlights */}
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 4, 2]} intensity={1.8} color="#ffffff" />
        <spotLight
          position={[-3, 3, 3]}
          angle={0.5}
          penumbra={1}
          intensity={theme.mode === 'gamer-rgb' ? 3.5 : 2.5}
          color={theme.accentColor}
        />
        <spotLight
          position={[3, 3, 3]}
          angle={0.5}
          penumbra={1}
          intensity={2.5}
          color={theme.secondaryAccent}
        />

        {/* 3D Scene Mesh */}
        <DeskSetup />

        {/* Dynamic Camera Controls */}
        <CameraManager />
      </Canvas>
    </div>
  );
}
