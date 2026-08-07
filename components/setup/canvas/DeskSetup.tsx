'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useThemeContext } from '@/context/setup/ThemeContext';

export const DeskSetup: React.FC = () => {
  const { theme, activeSpecId, setActiveSpecId, hoveredSpecId, setHoveredSpecId } = useThemeContext();

  const wireframeMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  const addWireframeRef = (mat: THREE.MeshStandardMaterial | null) => {
    if (mat && !wireframeMaterialsRef.current.includes(mat)) {
      wireframeMaterialsRef.current.push(mat);
    }
  };

  const getEmissiveMaterial = (specId: string, baseColor = '#10141d', wireframe = false) => {
    const isSelected = activeSpecId === specId;
    const isHovered = hoveredSpecId === specId;

    let intensity = theme.emissiveIntensity;
    if (isSelected) intensity *= 1.8;
    if (isHovered) intensity *= 1.4;

    return (
      <meshStandardMaterial
        ref={wireframe ? addWireframeRef : undefined}
        color={baseColor}
        emissive={theme.wireframeEmissive}
        emissiveIntensity={(isSelected || isHovered) ? intensity : (wireframe ? intensity * 0.4 : 0.15)}
        metalness={0.8}
        roughness={0.2}
        wireframe={wireframe}
      />
    );
  };

  const handlePointerOver = (e: any, id: string) => {
    e.stopPropagation();
    setHoveredSpecId(id);
  };

  const handlePointerOut = () => {
    setHoveredSpecId(null);
  };

  const handleClick = (e: any, id: string) => {
    e.stopPropagation();
    setActiveSpecId(id);
  };

  const screenRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const elapsedTime = state.clock ? state.clock.getElapsedTime() : performance.now() * 0.001;

    if (screenRef.current) {
      const mat = screenRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = 1.2 + Math.sin(elapsedTime * 2) * 0.2;
      }
    }

    // Dynamic moving rainbow RGB effect for wireframe outlines in Gamer RGB mode
    if (theme.mode === 'gamer-rgb') {
      wireframeMaterialsRef.current.forEach((mat, idx) => {
        if (mat) {
          const hue = (elapsedTime * 0.3 + idx * 0.08) % 1;
          mat.emissive.setHSL(hue, 1.0, 0.55);
        }
      });
    } else {
      wireframeMaterialsRef.current.forEach((mat) => {
        if (mat) {
          mat.emissive.set(theme.wireframeEmissive);
        }
      });
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      {/* 1. DESK SURFACE */}
      <group position={[0, -0.1, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4.8, 0.1, 1.8]} />
          <meshStandardMaterial color="#080b12" roughness={0.3} metalness={0.9} />
        </mesh>
        {/* Legs attached flush to underside of desk */}
        <mesh position={[-2.2, -0.75, -0.7]}>
          <boxGeometry args={[0.1, 1.4, 0.1]} />
          <meshStandardMaterial color="#0d111a" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[2.2, -0.75, -0.7]}>
          <boxGeometry args={[0.1, 1.4, 0.1]} />
          <meshStandardMaterial color="#0d111a" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[-2.2, -0.75, 0.7]}>
          <boxGeometry args={[0.1, 1.4, 0.1]} />
          <meshStandardMaterial color="#0d111a" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[2.2, -0.75, 0.7]}>
          <boxGeometry args={[0.1, 1.4, 0.1]} />
          <meshStandardMaterial color="#0d111a" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* 2. MONITOR */}
      <group
        position={[-0.2, 0.7, -0.45]}
        onPointerOver={(e) => handlePointerOver(e, 'monitor')}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, 'monitor')}
      >
        {/* Screen */}
        <mesh ref={screenRef} position={[0, 0, 0]}>
          <boxGeometry args={[3.0, 1.1, 0.05]} />
          <meshStandardMaterial
            color="#050811"
            emissive={theme.accentColor}
            emissiveIntensity={1.2}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
        {/* Bezel Wireframe */}
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[3.04, 1.14, 0.05]} />
          {getEmissiveMaterial('monitor', '#000000', true)}
        </mesh>
        {/* Stand Neck */}
        <mesh position={[0, -0.525, -0.1]}>
          <boxGeometry args={[0.15, 0.45, 0.15]} />
          <meshStandardMaterial color="#121824" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Stand Base resting perfectly on desk top */}
        <mesh position={[0, -0.74, 0.1]}>
          <boxGeometry args={[0.6, 0.02, 0.4]} />
          <meshStandardMaterial color="#121824" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* 3. PC CASE */}
      <group position={[1.8, 0.75, 0]}>
        {/* Main Transparent Case */}
        <mesh
          position={[0, 0, 0]}
          onPointerOver={(e) => handlePointerOver(e, 'mobo')}
          onPointerOut={handlePointerOut}
          onClick={(e) => handleClick(e, 'mobo')}
        >
          <boxGeometry args={[0.8, 1.6, 1.4]} />
          <meshStandardMaterial
            color="#090d16"
            opacity={0.35}
            transparent={true}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.82, 1.62, 1.42]} />
          {getEmissiveMaterial('mobo', '#000000', true)}
        </mesh>

        {/* Interior Motherboard */}
        <mesh
          position={[0.2, 0, -0.1]}
          onPointerOver={(e) => handlePointerOver(e, 'mobo')}
          onPointerOut={handlePointerOut}
          onClick={(e) => handleClick(e, 'mobo')}
        >
          <boxGeometry args={[0.05, 1.2, 1.0]} />
          {getEmissiveMaterial('mobo', '#0d131f')}
        </mesh>

        {/* Interior CPU Cooler */}
        <mesh
          position={[0.1, 0.3, -0.1]}
          onPointerOver={(e) => handlePointerOver(e, 'cpu')}
          onPointerOut={handlePointerOut}
          onClick={(e) => handleClick(e, 'cpu')}
        >
          <boxGeometry args={[0.18, 0.18, 0.18]} />
          {getEmissiveMaterial('cpu', '#101524')}
        </mesh>

        {/* Interior GPU */}
        <mesh
          position={[0.0, -0.2, 0.0]}
          onPointerOver={(e) => handlePointerOver(e, 'gpu')}
          onPointerOut={handlePointerOut}
          onClick={(e) => handleClick(e, 'gpu')}
        >
          <boxGeometry args={[0.35, 0.15, 0.8]} />
          {getEmissiveMaterial('gpu', '#0d131f')}
        </mesh>

        {/* Interior RAM */}
        <mesh
          position={[0.1, 0.3, 0.2]}
          onPointerOver={(e) => handlePointerOver(e, 'ram')}
          onPointerOut={handlePointerOut}
          onClick={(e) => handleClick(e, 'ram')}
        >
          <boxGeometry args={[0.04, 0.3, 0.12]} />
          {getEmissiveMaterial('ram', '#101524')}
        </mesh>

        {/* Interior Storage */}
        <mesh
          position={[0.1, -0.5, 0.3]}
          onPointerOver={(e) => handlePointerOver(e, 'storage')}
          onPointerOut={handlePointerOut}
          onClick={(e) => handleClick(e, 'storage')}
        >
          <boxGeometry args={[0.1, 0.18, 0.3]} />
          {getEmissiveMaterial('storage', '#141a29')}
        </mesh>
      </group>

      {/* 4. KEYBOARD */}
      <group
        position={[-0.2, -0.03, 0.45]}
        onPointerOver={(e) => handlePointerOver(e, 'keyboard')}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, 'keyboard')}
      >
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 0.04, 0.3]} />
          {getEmissiveMaterial('keyboard', '#0d131f')}
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.82, 0.05, 0.32]} />
          {getEmissiveMaterial('keyboard', '#000000', true)}
        </mesh>
      </group>

      {/* 5. MOUSE */}
      <group
        position={[0.4, -0.03, 0.45]}
        onPointerOver={(e) => handlePointerOver(e, 'mouse')}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, 'mouse')}
      >
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.15, 0.04, 0.25]} />
          {getEmissiveMaterial('mouse', '#0b101a')}
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.17, 0.05, 0.27]} />
          {getEmissiveMaterial('mouse', '#000000', true)}
        </mesh>
      </group>

      {/* 6. NUMPAD */}
      <group
        position={[0.7, -0.03, 0.45]}
        onPointerOver={(e) => handlePointerOver(e, 'numpad')}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, 'numpad')}
      >
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.2, 0.04, 0.3]} />
          {getEmissiveMaterial('numpad', '#0d131f')}
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.22, 0.05, 0.32]} />
          {getEmissiveMaterial('numpad', '#000000', true)}
        </mesh>
      </group>

      {/* 7. AKAI LPD8 STREAM DECK */}
      <group
        position={[-0.9, -0.03, 0.45]}
        onPointerOver={(e) => handlePointerOver(e, 'akai-lpd8')}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, 'akai-lpd8')}
      >
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.45, 0.04, 0.25]} />
          {getEmissiveMaterial('akai-lpd8', '#0f1422')}
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.47, 0.05, 0.27]} />
          {getEmissiveMaterial('akai-lpd8', '#000000', true)}
        </mesh>
      </group>

      {/* 8. AUDIO STATION */}
      <group
        position={[-1.5, 0, 0.25]}
        onPointerOver={(e) => handlePointerOver(e, 'audio-station')}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, 'audio-station')}
      >
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.4, 0.08, 0.3]} />
          {getEmissiveMaterial('audio-station', '#0d1320')}
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.42, 0.09, 0.32]} />
          {getEmissiveMaterial('audio-station', '#000000', true)}
        </mesh>

        <mesh position={[0, 0.34, -0.1]}>
          <boxGeometry args={[0.04, 0.6, 0.04]} />
          {getEmissiveMaterial('audio-station', '#090d17', true)}
        </mesh>
        <mesh position={[0, 0.64, 0.05]}>
          <boxGeometry args={[0.1, 0.2, 0.1]} />
          {getEmissiveMaterial('audio-station', '#090d17')}
        </mesh>
      </group>

      {/* 9. TRIPLE HEADPHONE STAND STATION */}
      <group
        position={[-2.0, 0, -0.2]}
        onPointerOver={(e) => handlePointerOver(e, 'headphones')}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, 'headphones')}
      >
        <mesh position={[0, -0.04, 0]}>
          <boxGeometry args={[0.2, 0.02, 0.2]} />
          <meshStandardMaterial color="#0d121c" metalness={0.95} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.27, 0]}>
          <boxGeometry args={[0.04, 0.6, 0.04]} />
          {getEmissiveMaterial('headphones', '#0b0f1a', true)}
        </mesh>
        <mesh position={[0, 0.58, 0]}>
          <boxGeometry args={[0.4, 0.03, 0.08]} />
          <meshStandardMaterial color="#0d121c" metalness={0.9} />
        </mesh>

        {[-0.12, 0, 0.12].map((xOffset, idx) => (
          <mesh key={idx} position={[xOffset, 0.45, 0]}>
            <boxGeometry args={[0.08, 0.2, 0.18]} />
            {getEmissiveMaterial('headphones', '#0d121c')}
          </mesh>
        ))}
      </group>
    </group>
  );
};
