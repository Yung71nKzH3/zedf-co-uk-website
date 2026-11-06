import React, { useMemo, useState } from "react";
import { LiveRingMetrics, RING_ORDER } from "@/lib/characteristica/quizMachine";
import { CoordinateId, RingId } from "@/lib/characteristica/schema";
import { COORDINATE_MAP } from "@/lib/characteristica/coordinates";
import { playAstrolabeTick } from "@/lib/characteristica/soundEngine";
import { Pause, Play } from "lucide-react";

interface ConcentricRingsProps {
  ringMetrics: Record<RingId, LiveRingMetrics>;
  activeRingFocus?: RingId;
  compact?: boolean;
}

const RING_RADII: Record<RingId, number> = {
  "Ring 1: Internal Engine": 56,
  "Ring 2: Relational Orbit": 96,
  "Ring 3: Material & Agency": 136,
  "Ring 4: Cosmic Horizon": 176
};

const RING_COLOR_VARS: Record<RingId, string> = {
  "Ring 1: Internal Engine": "var(--ring1-color)",
  "Ring 2: Relational Orbit": "var(--ring2-color)",
  "Ring 3: Material & Agency": "var(--ring3-color)",
  "Ring 4: Cosmic Horizon": "var(--ring4-color)"
};

export const ConcentricRings: React.FC<ConcentricRingsProps> = ({
  ringMetrics,
  activeRingFocus,
  compact = false
}) => {
  const [selectedCoordId, setSelectedCoordId] = useState<CoordinateId | null>(null);
  const [isOrbitPaused, setIsOrbitPaused] = useState<boolean>(false);
  const [isPointerInside, setIsPointerInside] = useState<boolean>(false);

  const center = 210;
  const viewBoxSize = 420;
  const outerBezelRadius = 194;

  // Find selected node info if any
  let selectedNode: {
    id: CoordinateId;
    dimension: string;
    descriptor: string;
    ringId: RingId;
    isIlluminated: boolean;
  } | null = null;

  if (selectedCoordId) {
    for (const rId of RING_ORDER) {
      const found = ringMetrics[rId]?.activeNodes.find((n) => n.id === selectedCoordId);
      if (found) {
        selectedNode = {
          id: found.id,
          dimension: found.dimension,
          descriptor: found.descriptor,
          ringId: rId,
          isIlluminated: found.isIlluminated
        };
        break;
      }
    }
  }

  // Precompute 72 graduation ticks (every 5 degrees) for the outer Leibnizian brass bezel
  const degreeTicks = useMemo(() => {
    const ticks: {
      deg: number;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      isMajor: boolean;
      isCardinal: boolean;
      labelX: number;
      labelY: number;
    }[] = [];

    for (let deg = 0; deg < 360; deg += 5) {
      const rad = ((deg - 90) * Math.PI) / 180;
      const isCardinal = deg % 90 === 0;
      const isMajor = deg % 30 === 0;
      const innerLen = isCardinal ? 8 : isMajor ? 5.5 : 2.8;
      const rOuter = outerBezelRadius;
      const rInner = outerBezelRadius - innerLen;
      const rLabel = outerBezelRadius + 9;

      ticks.push({
        deg,
        x1: center + rInner * Math.cos(rad),
        y1: center + rInner * Math.sin(rad),
        x2: center + rOuter * Math.cos(rad),
        y2: center + rOuter * Math.sin(rad),
        isMajor,
        isCardinal,
        labelX: center + rLabel * Math.cos(rad),
        labelY: center + rLabel * Math.sin(rad)
      });
    }
    return ticks;
  }, []);

  // Compute all node coordinates so we can also draw subtle sacred geometry resonance chords
  const plottedNodesByRing = useMemo(() => {
    const map: Record<
      RingId,
      {
        id: CoordinateId;
        nx: number;
        ny: number;
        isIlluminated: boolean;
        colorVar: string;
      }[]
    > = {
      "Ring 1: Internal Engine": [],
      "Ring 2: Relational Orbit": [],
      "Ring 3: Material & Agency": [],
      "Ring 4: Cosmic Horizon": []
    };

    for (const ringId of RING_ORDER) {
      const radius = RING_RADII[ringId];
      const colorVar = RING_COLOR_VARS[ringId];
      const nodes = ringMetrics[ringId]?.activeNodes ?? [];
      const total = nodes.length || 1;

      map[ringId] = nodes.map((node, idx) => {
        const angleDeg = (idx / total) * 360 - 90;
        const angleRad = (angleDeg * Math.PI) / 180;
        return {
          id: node.id,
          nx: center + radius * Math.cos(angleRad),
          ny: center + radius * Math.sin(angleRad),
          isIlluminated: node.isIlluminated,
          colorVar
        };
      });
    }
    return map;
  }, [ringMetrics]);

  // Connect illuminated nodes across adjacent rings to form a sacred geometric constellation
  const resonanceChords = useMemo(() => {
    const chords: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
    const allIlluminated = RING_ORDER.flatMap((rId) =>
      plottedNodesByRing[rId].filter((n) => n.isIlluminated)
    );
    for (let i = 0; i < allIlluminated.length; i += 2) {
      const a = allIlluminated[i];
      const b = allIlluminated[(i + 3) % allIlluminated.length];
      if (a && b && a.id !== b.id) {
        chords.push({
          x1: a.nx,
          y1: a.ny,
          x2: b.nx,
          y2: b.ny,
          key: `${a.id}-${b.id}`
        });
      }
    }
    return chords;
  }, [plottedNodesByRing]);

  const effectivePaused = isOrbitPaused || isPointerInside;

  return (
    <div
      className="flex flex-col items-center rounded-2xl border p-4 transition-all relative overflow-hidden"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)"
      }}
      onMouseEnter={() => setIsPointerInside(true)}
      onMouseLeave={() => setIsPointerInside(false)}
    >
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between mb-2 px-1">
        <div>
          <span
            className="text-[10px] font-mono-code uppercase tracking-widest block"
            style={{ color: "var(--accent-gold)" }}
          >
            Tier IV · Leibnizian Astrolabe
          </span>
          <h3 className="text-sm font-serif-philo font-bold tracking-tight text-base">
            The 4 Concentric Celestial Rings
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsOrbitPaused((prev) => !prev)}
            title={isOrbitPaused ? "Resume planetary ring rotation" : "Pause planetary ring rotation"}
            aria-label={isOrbitPaused ? "Resume planetary ring rotation" : "Pause planetary ring rotation"}
            className="p-1.5 rounded-lg border cursor-pointer hover:opacity-85 transition-opacity no-print"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-subtle)",
              color: "var(--accent-gold)"
            }}
          >
            {isOrbitPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>

          <span
            className="text-xs font-mono-code px-2 py-0.5 rounded border"
            style={{
              borderColor: "var(--border-subtle)",
              backgroundColor: "var(--bg-elevated)"
            }}
          >
            {Object.values(ringMetrics).reduce((acc, r) => acc + r.answeredCoordinates, 0)} / 45 Coords
          </span>
        </div>
      </div>

      {/* Interactive SVG Astrolabe */}
      <div className="relative w-full max-w-[350px] aspect-square flex items-center justify-center">
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="w-full h-full overflow-visible"
          role="img"
          aria-label="Four Concentric Rings Astrolabe showing 45 philosophical coordinates"
        >
          <defs>
            <radialGradient id="astrolabeCoreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity="0.26" />
              <stop offset="60%" stopColor="var(--accent-copper)" stopOpacity="0.06" />
              <stop offset="100%" stopColor="var(--accent-gold)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Subtle background radial glow */}
          <circle cx={center} cy={center} r={200} fill="url(#astrolabeCoreGlow)" />

          {/* Outer Brass Instrument Bezel & Sacred Geometry Reticle */}
          <circle
            cx={center}
            cy={center}
            r={outerBezelRadius}
            fill="none"
            stroke="var(--accent-gold)"
            strokeOpacity="0.32"
            strokeWidth="1.25"
          />
          <circle
            cx={center}
            cy={center}
            r={outerBezelRadius - 8}
            fill="none"
            stroke="var(--accent-gold)"
            strokeOpacity="0.14"
            strokeWidth="0.75"
            strokeDasharray="2 4"
          />

          {/* 360-Degree Graduation Ticks */}
          {degreeTicks.map((t) => (
            <g key={t.deg}>
              <line
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke="var(--accent-gold)"
                strokeOpacity={t.isCardinal ? 0.75 : t.isMajor ? 0.45 : 0.2}
                strokeWidth={t.isCardinal ? 1.5 : t.isMajor ? 1 : 0.6}
              />
              {t.isCardinal && (
                <text
                  x={t.labelX}
                  y={t.labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--accent-gold)"
                  fillOpacity="0.7"
                  fontSize="7.5"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {t.deg}°
                </text>
              )}
            </g>
          ))}

          {/* Cardinal & Intercardinal Sacred Geometry Crosshairs */}
          <line
            x1={center}
            y1={16}
            x2={center}
            y2={viewBoxSize - 16}
            stroke="var(--border-subtle)"
            strokeDasharray="3 5"
            strokeWidth="1"
          />
          <line
            x1={16}
            y1={center}
            x2={viewBoxSize - 16}
            y2={center}
            stroke="var(--border-subtle)"
            strokeDasharray="3 5"
            strokeWidth="1"
          />
          {/* 45-degree diagonal astrolabe lines */}
          <line
            x1={center - 135}
            y1={center - 135}
            x2={center + 135}
            y2={center + 135}
            stroke="var(--accent-gold)"
            strokeOpacity="0.1"
            strokeWidth="0.75"
          />
          <line
            x1={center + 135}
            y1={center - 135}
            x2={center - 135}
            y2={center + 135}
            stroke="var(--accent-gold)"
            strokeOpacity="0.1"
            strokeWidth="0.75"
          />

          {/* Dynamic Sacred Geometry Resonance Chords connecting illuminated coordinates */}
          {resonanceChords.map((chord) => (
            <line
              key={chord.key}
              x1={chord.x1}
              y1={chord.y1}
              x2={chord.x2}
              y2={chord.y2}
              stroke="var(--accent-gold)"
              strokeOpacity="0.16"
              strokeWidth="0.8"
            />
          ))}

          {/* Counter-Rotating Planetary Tracer Particle Rings */}
          {RING_ORDER.map((ringId, rIdx) => {
            const radius = RING_RADII[ringId];
            const colorVar = RING_COLOR_VARS[ringId];
            const orbitClass =
              rIdx % 2 === 0 ? "astrolabe-orbit-cw" : "astrolabe-orbit-ccw";

            // Place 2 subtle celestial tracer satellites per ring
            const angle1 = (rIdx * 45 * Math.PI) / 180;
            const angle2 = angle1 + Math.PI;
            return (
              <g
                key={`orbit-tracer-${ringId}`}
                className={`${orbitClass} ${effectivePaused ? "astrolabe-orbit-paused" : ""}`}
              >
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={colorVar}
                  strokeOpacity="0.18"
                  strokeWidth="1"
                  strokeDasharray="4 14"
                />
                <circle
                  cx={center + radius * Math.cos(angle1)}
                  cy={center + radius * Math.sin(angle1)}
                  r={1.9}
                  fill={colorVar}
                  fillOpacity="0.75"
                />
                <circle
                  cx={center + radius * Math.cos(angle2)}
                  cy={center + radius * Math.sin(angle2)}
                  r={1.5}
                  fill="var(--accent-gold)"
                  fillOpacity="0.55"
                />
              </g>
            );
          })}

          {/* Render each of the 4 Concentric Rings & 45 Coordinate Nodes */}
          {RING_ORDER.map((ringId) => {
            const radius = RING_RADII[ringId];
            const colorVar = RING_COLOR_VARS[ringId];
            const metrics = ringMetrics[ringId];
            const isFocused = activeRingFocus === ringId;
            const circumference = 2 * Math.PI * radius;
            const dashOffset = circumference * (1 - (metrics?.progressRatio ?? 0));

            return (
              <g key={ringId}>
                {/* Base orbit track */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={colorVar}
                  strokeOpacity={isFocused ? 0.4 : 0.18}
                  strokeWidth={isFocused ? 2.5 : 1.25}
                />

                {/* Illuminated progress arc */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={colorVar}
                  strokeOpacity={0.88}
                  strokeWidth={isFocused ? 3.5 : 2.2}
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${center} ${center})`}
                  style={{ transition: "stroke-dashoffset 0.6s ease" }}
                />

                {/* Coordinate Nodes along the ring */}
                {metrics?.activeNodes.map((node, idx) => {
                  const total = metrics.activeNodes.length;
                  const angleDeg = (idx / total) * 360 - 90;
                  const angleRad = (angleDeg * Math.PI) / 180;
                  const nx = center + radius * Math.cos(angleRad);
                  const ny = center + radius * Math.sin(angleRad);
                  const isSelected = selectedCoordId === node.id;

                  return (
                    <g
                      key={node.id}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedCoordId(node.id);
                        playAstrolabeTick();
                      }}
                      onMouseEnter={() => setSelectedCoordId(node.id)}
                    >
                      {/* Spoke line if illuminated */}
                      {node.isIlluminated && (
                        <line
                          x1={center}
                          y1={center}
                          x2={nx}
                          y2={ny}
                          stroke={colorVar}
                          strokeOpacity={isSelected ? 0.6 : 0.14}
                          strokeWidth={isSelected ? 1.5 : 0.75}
                        />
                      )}

                      {/* Outer halo when selected or illuminated */}
                      {node.isIlluminated && (
                        <circle
                          cx={nx}
                          cy={ny}
                          r={isSelected ? 9 : 5.8}
                          fill={colorVar}
                          fillOpacity={isSelected ? 0.38 : 0.18}
                        />
                      )}

                      {/* Core Coordinate Node dot */}
                      <circle
                        cx={nx}
                        cy={ny}
                        r={isSelected ? 5.2 : node.isIlluminated ? 3.7 : 2.3}
                        fill={node.isIlluminated ? colorVar : "var(--bg-elevated)"}
                        stroke={colorVar}
                        strokeWidth={node.isIlluminated ? 1.5 : 1}
                        strokeOpacity={node.isIlluminated ? 1 : 0.45}
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Center Observer Eye / Monad Singularity */}
          <circle
            cx={center}
            cy={center}
            r={20}
            fill="none"
            stroke="var(--accent-gold)"
            strokeOpacity="0.35"
            strokeWidth="0.8"
            strokeDasharray="2 3"
          />
          <circle
            cx={center}
            cy={center}
            r={14}
            fill="var(--bg-elevated)"
            stroke="var(--accent-gold)"
            strokeWidth="1.5"
          />
          <circle cx={center} cy={center} r={4.5} fill="var(--accent-gold)" />
        </svg>
      </div>

      {/* Interactive Node Telemetry Readout */}
      <div
        className="w-full rounded-xl border p-2.5 text-xs mb-3 min-h-[60px] flex flex-col justify-center"
        style={{
          backgroundColor: "var(--bg-elevated)",
          borderColor: "var(--border-subtle)"
        }}
      >
        {selectedNode ? (
          <div>
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span
                className="font-mono-code font-semibold text-[11px]"
                style={{ color: RING_COLOR_VARS[selectedNode.ringId] }}
              >
                [{selectedNode.id}] {selectedNode.dimension}
              </span>
              <span className="font-mono-code text-[10px] opacity-65">
                {COORDINATE_MAP[selectedNode.id].act} · {COORDINATE_MAP[selectedNode.id].interrogative}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="opacity-80">
                {selectedNode.isIlluminated ? (
                  <>
                    Resolved Stance:{" "}
                    <strong className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {selectedNode.descriptor}
                    </strong>
                  </>
                ) : (
                  <span className="italic opacity-65">Awaiting scenario signal…</span>
                )}
              </span>
              <span className="text-[10px] font-mono-code opacity-60">
                {COORDINATE_MAP[selectedNode.id].triadLayer}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-center opacity-65 text-[11px]">
            Hover or tap any coordinate node on the 4 celestial rings to inspect its ontological stance.
          </p>
        )}
      </div>

      {/* Ring Legend & Progress Bars */}
      {!compact && (
        <div className="w-full grid grid-cols-2 gap-2 text-xs">
          {RING_ORDER.map((ringId, idx) => {
            const m = ringMetrics[ringId];
            const colorVar = RING_COLOR_VARS[ringId];
            const isFocused = activeRingFocus === ringId;
            return (
              <div
                key={ringId}
                className="p-2 rounded-lg border transition-all"
                style={{
                  backgroundColor: isFocused ? "var(--bg-elevated)" : "transparent",
                  borderColor: isFocused ? colorVar : "var(--border-subtle)"
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium truncate flex items-center gap-1.5 text-[11px]">
                    <span
                      className="w-2 h-2 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: colorVar }}
                    />
                    R{idx + 1}: {m.shortLabel}
                  </span>
                  <span className="font-mono-code text-[10px] opacity-75">
                    {m.answeredCoordinates}/{m.totalCoordinates}
                  </span>
                </div>
                <div
                  className="w-full h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: "var(--border-subtle)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round(m.progressRatio * 100)}%`,
                      backgroundColor: colorVar
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

