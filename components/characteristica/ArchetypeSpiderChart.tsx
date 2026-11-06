import React, { useState } from "react";
import { ArchetypeAffinityPoint, PhilosophicalArchetype } from "../../types/schema";
import { ARCHETYPES } from "../../data/archetypes";
import { playAstrolabeTick } from "../../engine/soundEngine";
import { Compass, Sparkles } from "lucide-react";

interface ArchetypeSpiderChartProps {
  constellation: ArchetypeAffinityPoint[];
  primaryArchetype: PhilosophicalArchetype;
  secondaryArchetype: PhilosophicalArchetype;
}

export const ArchetypeSpiderChart: React.FC<ArchetypeSpiderChartProps> = ({
  constellation,
  primaryArchetype,
  secondaryArchetype
}) => {
  const [selectedId, setSelectedId] = useState<string>(primaryArchetype.id);

  const size = 340;
  const center = size / 2;
  const maxRadius = 114;
  const totalAxes = constellation.length || 8;

  const getPoint = (index: number, pct: number) => {
    const angleRad = ((index / totalAxes) * 360 - 90) * (Math.PI / 180);
    const r = (pct / 100) * maxRadius;
    return {
      x: center + r * Math.cos(angleRad),
      y: center + r * Math.sin(angleRad),
      angleRad
    };
  };

  // Build polygon points string for the user's affinity profile
  const polygonPoints = constellation
    .map((item, idx) => {
      const pt = getPoint(idx, item.affinityPct);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    })
    .join(" ");

  const activePoint =
    constellation.find((c) => c.id === selectedId) ?? constellation[0];
  const activeArchDetail = ARCHETYPES[activePoint.id] ?? primaryArchetype;

  return (
    <div
      className="rounded-2xl border p-5 sm:p-6 transition-all print-break-inside-avoid"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)"
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <span
            className="text-[10px] font-mono-code uppercase tracking-widest flex items-center gap-1.5"
            style={{ color: "var(--accent-gold)" }}
          >
            <Compass className="w-3.5 h-3.5" />
            8-Fold Philosophical Radar
          </span>
          <h3 className="font-serif-philo text-2xl font-bold tracking-tight">
            Archetype Spider Constellation
          </h3>
        </div>

        <span
          className="text-[11px] font-mono-code px-2.5 py-1 rounded-full border"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-subtle)",
            color: "var(--accent-gold)"
          }}
        >
          Primary: {primaryArchetype.name.replace("The ", "")} · Secondary:{" "}
          {secondaryArchetype.name.replace("The ", "")}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left: Interactive 8-Axis SVG Spider Chart */}
        <div className="md:col-span-6 flex justify-center">
          <div className="w-full max-w-[320px] aspect-square">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full overflow-visible"
              role="img"
              aria-label="8-Archetype Spider Radar Chart showing philosophical affinities"
            >
              <defs>
                <radialGradient id="spiderPolygonFill" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="var(--accent-copper)" stopOpacity="0.16" />
                </radialGradient>
              </defs>

              {/* Octagonal Grid Webs (25%, 50%, 75%, 100%) */}
              {[25, 50, 75, 100].map((level) => {
                const webPts = constellation
                  .map((_, idx) => {
                    const p = getPoint(idx, level);
                    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
                  })
                  .join(" ");
                return (
                  <polygon
                    key={level}
                    points={webPts}
                    fill="none"
                    stroke="var(--accent-gold)"
                    strokeOpacity={level === 100 ? 0.35 : 0.16}
                    strokeWidth={level === 100 ? 1.2 : 0.75}
                    strokeDasharray={level === 50 ? "2 3" : undefined}
                  />
                );
              })}

              {/* 8 Radial Axis Spokes & Outer Labels */}
              {constellation.map((item, idx) => {
                const outer = getPoint(idx, 100);
                const labelPos = getPoint(idx, 124);
                const isSelected = item.id === selectedId;
                return (
                  <g key={`axis-${item.id}`}>
                    <line
                      x1={center}
                      y1={center}
                      x2={outer.x}
                      y2={outer.y}
                      stroke="var(--accent-gold)"
                      strokeOpacity={isSelected ? 0.65 : 0.22}
                      strokeWidth={isSelected ? 1.4 : 0.8}
                    />
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      onClick={() => {
                        setSelectedId(item.id);
                        playAstrolabeTick();
                      }}
                      className="cursor-pointer select-none"
                      fill={
                        item.isPrimary
                          ? "var(--accent-gold)"
                          : isSelected
                          ? "var(--text-primary)"
                          : "var(--text-secondary)"
                      }
                      fontSize="9.5"
                      fontWeight={item.isPrimary || isSelected ? "700" : "500"}
                      fontFamily="'JetBrains Mono', monospace"
                    >
                      {item.shortLabel} ({item.affinityPct}%)
                    </text>
                  </g>
                );
              })}

              {/* User's Constellation Data Polygon */}
              <polygon
                points={polygonPoints}
                fill="url(#spiderPolygonFill)"
                stroke="var(--accent-gold)"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />

              {/* Interactive Vertex Nodes */}
              {constellation.map((item, idx) => {
                const pt = getPoint(idx, item.affinityPct);
                const isSelected = item.id === selectedId;
                return (
                  <g
                    key={`vertex-${item.id}`}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedId(item.id);
                      playAstrolabeTick();
                    }}
                    onMouseEnter={() => setSelectedId(item.id)}
                  >
                    {(item.isPrimary || isSelected) && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isSelected ? 9 : 7}
                        fill="var(--accent-gold)"
                        fillOpacity="0.28"
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? 5 : item.isPrimary ? 4.5 : 3.4}
                      fill={
                        item.isPrimary || isSelected
                          ? "var(--accent-gold)"
                          : "var(--bg-elevated)"
                      }
                      stroke="var(--accent-gold)"
                      strokeWidth="1.75"
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right: All 8 Archetype Affinity Bars + Selected Archetype Inspector */}
        <div className="md:col-span-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[...constellation]
              .sort((a, b) => b.affinityPct - a.affinityPct)
              .map((item) => {
                const isSelected = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(item.id);
                      playAstrolabeTick();
                    }}
                    className="text-left p-2.5 rounded-xl border transition-all cursor-pointer"
                    style={{
                      backgroundColor: isSelected ? "var(--bg-elevated)" : "transparent",
                      borderColor: isSelected
                        ? "var(--accent-gold)"
                        : item.isPrimary
                        ? "color-mix(in srgb, var(--accent-gold) 50%, transparent)"
                        : "var(--border-subtle)"
                    }}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold truncate flex items-center gap-1">
                        {item.isPrimary && (
                          <Sparkles
                            className="w-3 h-3 shrink-0"
                            style={{ color: "var(--accent-gold)" }}
                          />
                        )}
                        {item.name.replace("The ", "")}
                      </span>
                      <span
                        className="font-mono-code text-[11px] font-bold"
                        style={{ color: "var(--accent-gold)" }}
                      >
                        {item.affinityPct}%
                      </span>
                    </div>
                    <div
                      className="w-full h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: "var(--border-subtle)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.affinityPct}%`,
                          backgroundColor: item.isPrimary
                            ? "var(--accent-gold)"
                            : item.isSecondary
                            ? "var(--ring2-color)"
                            : "var(--text-secondary)"
                        }}
                      />
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Active Inspected Vertex Readout */}
          <div
            className="p-3.5 rounded-xl border text-xs"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--accent-gold)"
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-serif-philo text-base font-bold">
                {activeArchDetail.name}
              </span>
              <span
                className="font-mono-code text-[10px] px-2 py-0.5 rounded-full border"
                style={{
                  borderColor: "var(--accent-gold)",
                  color: "var(--accent-gold)"
                }}
              >
                {activePoint.isPrimary
                  ? "Primary Dominant"
                  : activePoint.isSecondary
                  ? "Secondary Complement"
                  : `Resonance: ${activePoint.affinityPct}%`}
              </span>
            </div>
            <div
              className="font-mono-code text-[10px] italic mb-1.5"
              style={{ color: "var(--accent-gold)" }}
            >
              {activeArchDetail.latinTitle}
            </div>
            <p className="opacity-85 leading-relaxed">{activeArchDetail.tagline}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
