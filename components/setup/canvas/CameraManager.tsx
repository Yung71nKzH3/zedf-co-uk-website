'use client';

import React, { useRef, useEffect } from 'react';
import { CameraControls } from '@react-three/drei';
import { useThemeContext } from '@/context/setup/ThemeContext';

export const CameraManager: React.FC<{
  onFocusDistanceChange?: (dist: number) => void;
}> = ({ onFocusDistanceChange }) => {
  const controlsRef = useRef<CameraControls>(null!);
  const { activeSpec } = useThemeContext();

  useEffect(() => {
    if (controlsRef.current && activeSpec) {
      const [tx, ty, tz] = activeSpec.cameraTarget;
      const [px, py, pz] = activeSpec.cameraPosition;

      // Smooth camera transition to target hardware
      controlsRef.current.setLookAt(px, py, pz, tx, ty, tz, true);

      // Compute camera to target focal distance
      const dx = px - tx;
      const dy = py - ty;
      const dz = pz - tz;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (onFocusDistanceChange) {
        onFocusDistanceChange(distance);
      }
    }
  }, [activeSpec, onFocusDistanceChange]);

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      smoothTime={0.6}
      dollySpeed={0.8}
      truckSpeed={0.8}
      minDistance={0.5}
      maxDistance={9.0}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.05}
    />
  );
};
