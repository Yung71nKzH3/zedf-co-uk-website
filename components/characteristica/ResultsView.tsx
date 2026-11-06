import React, { useState } from "react";
import {
  ActType,
  PhilosophicalSentenceResult,
  RingId,
  TriadLayer
} from "../../types/schema";
import { LiveRingMetrics, RING_ORDER } from "../../engine/quizMachine";
import { ConcentricRings } from "../rings/ConcentricRings";
import { InteractiveSentence } from "./InteractiveSentence";
import { ArchetypeSpiderChart } from "./ArchetypeSpiderChart";
import {
  Copy,
  Check,
  Share2,
  Download,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  BookOpen,
  Swords,
  Compass,
  Layers,
  Printer,
  FileText,
  Flame
} from "lucide-react";

interface ResultsViewProps {
  result: PhilosophicalSentenceResult;
  ringMetrics: Record<RingId, LiveRingMetrics>;
  onResetQuiz: () => void;
  onOpenTelemetry: () => void;
}

const RING_COLORS_HEX: Record<RingId, string> = {
  "Ring 1: Internal Engine": "#fbbf24",
  "Ring 2: Relational Orbit": "#34d399",
  "Ring 3: Material & Agency": "#60a5fa",
  "Ring 4: Cosmic Horizon": "#a78bfa"
};

export const ResultsView: React.FC<ResultsViewProps> = ({
  result,
  ringMetrics,
  onResetQuiz,
  onOpenTelemetry
}) => {
  const [copiedSentence, setCopiedSentence] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopySentence = async () => {
    try {
      await navigator.clipboard.writeText(result.fullSentence);
      setCopiedSentence(true);
      setTimeout(() => setCopiedSentence(false), 2200);
    } catch {
      // Ignore
    }
  };

  const handleCopyMarkdownDossier = async () => {
    const md = [
      `# Characteristica Universalis · Philosophical Dossier`,
      ``,
      `> **“${result.fullSentence}”**`,
      ``,
      `**Dominant Archetype:** ${result.archetype.name} (*${result.archetype.latinTitle}*)`,
      `**Secondary Complement:** ${result.secondaryArchetype.name}`,
      ``,
      `### The Triad Movement`,
      `- **${result.triadMovement.origin.label}:** ${result.triadMovement.origin.sentence}`,
      `- **${result.triadMovement.conduct.label}:** ${result.triadMovement.conduct.sentence}`,
      `- **${result.triadMovement.horizon.label}:** ${result.triadMovement.horizon.sentence}`,
      ``,
      `### The 3 Living Axioms`,
      ...result.livingAxioms.map(
        (ax) =>
          `${ax.numeral}. **${ax.title} (${ax.domain}):** “${ax.maxim}” — *Practice:* ${ax.dailyPractice}`
      ),
      ``,
      `Shareable Coordinate Link: ${window.location.href}`
    ].join("\n");

    try {
      await navigator.clipboard.writeText(md);
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2200);
    } catch {
      // Ignore
    }
  };

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      // Ignore
    }
  };

  const handlePrintDossier = () => {
    window.print();
  };

  const handleDownloadCard = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Deep velvet-obsidian & brass background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1600, 1080);
    bgGrad.addColorStop(0, "#07090e");
    bgGrad.addColorStop(0.5, "#101522");
    bgGrad.addColorStop(1, "#090c14");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1600, 1080);

    // Double Brass Filigree Frame
    ctx.strokeStyle = "rgba(229, 184, 105, 0.45)";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(36, 36, 1528, 1008);
    ctx.strokeStyle = "rgba(229, 184, 105, 0.18)";
    ctx.lineWidth = 1;
    ctx.strokeRect(46, 46, 1508, 988);

    // Leibnizian Astrolabe on right side with degree ticks & 45 plotted coordinate nodes
    const cx = 1290;
    const cy = 310;
    const radii = [56, 95, 134, 173];
    const colors = ["#fbbf24", "#34d399", "#60a5fa", "#a78bfa"];

    // Outer brass graduation bezel
    ctx.beginPath();
    ctx.arc(cx, cy, 192, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(229, 184, 105, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    for (let deg = 0; deg < 360; deg += 10) {
      const rad = (deg * Math.PI) / 180;
      const len = deg % 30 === 0 ? 8 : 4;
      ctx.beginPath();
      ctx.moveTo(cx + (192 - len) * Math.cos(rad), cy + (192 - len) * Math.sin(rad));
      ctx.lineTo(cx + 192 * Math.cos(rad), cy + 192 * Math.sin(rad));
      ctx.strokeStyle = "rgba(229, 184, 105, 0.4)";
      ctx.lineWidth = deg % 30 === 0 ? 1.5 : 0.8;
      ctx.stroke();
    }

    RING_ORDER.forEach((rId, i) => {
      const r = radii[i];
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = colors[i];
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Plot nodes
      const nodes = ringMetrics[rId]?.activeNodes ?? [];
      nodes.forEach((_, nIdx) => {
        const angle = (nIdx / (nodes.length || 1)) * Math.PI * 2 - Math.PI / 2;
        const nx = cx + r * Math.cos(angle);
        const ny = cy + r * Math.sin(angle);
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(nx, ny, 3.8, 0, Math.PI * 2);
        ctx.fillStyle = colors[i];
        ctx.fill();
      });
    });
    ctx.globalAlpha = 1;

    // Header tag
    ctx.fillStyle = "#e5b869";
    ctx.font = "600 18px 'JetBrains Mono', Consolas, monospace";
    ctx.fillText(
      "CHARACTERISTICA UNIVERSALIS · 45-COORDINATE PHILOSOPHICAL MANIFESTO",
      80,
      96
    );

    // Archetype Title & Secondary Complement
    ctx.fillStyle = "#f4f0e8";
    ctx.font = "bold 50px Georgia, serif";
    ctx.fillText(result.archetype.name, 80, 158);

    ctx.fillStyle = "#e5b869";
    ctx.font = "italic 22px Georgia, serif";
    ctx.fillText(
      `${result.archetype.latinTitle}   ·   Complement: ${result.secondaryArchetype.name}`,
      80,
      194
    );

    // Tier I: The Philosophical Sentence (wrapped)
    ctx.fillStyle = "#f4f0e8";
    ctx.font = "italic 600 34px Georgia, serif";
    const words = `“${result.fullSentence}”`.split(" ");
    let line = "";
    let y = 262;
    const maxWidth = 940;
    for (const word of words) {
      const testLine = line + word + " ";
      if (ctx.measureText(testLine).width > maxWidth && line !== "") {
        ctx.fillText(line.trim(), 80, y);
        line = word + " ";
        y += 46;
      } else {
        line = testLine;
      }
    }
    if (line) {
      ctx.fillText(line.trim(), 80, y);
      y += 48;
    }

    // Tier II: The Triad Movement (Origin, Conduct, Horizon)
    const movements = [
      result.triadMovement.origin,
      result.triadMovement.conduct,
      result.triadMovement.horizon
    ];
    let ty = Math.max(y + 10, 415);
    movements.forEach((m) => {
      ctx.fillStyle = "#e5b869";
      ctx.font = "bold 14px 'JetBrains Mono', Consolas, monospace";
      ctx.fillText(m.label.toUpperCase(), 80, ty);
      ty += 22;
      ctx.fillStyle = "#c8cfdf";
      ctx.font = "italic 18px Georgia, serif";
      ctx.fillText(m.sentence.slice(0, 118), 80, ty);
      ty += 34;
    });

    // 4 Rings Breakdown Grid at Bottom
    let rx = 74;
    const ry = 660;
    const boxWidth = 352;
    const boxGap = 18;
    RING_ORDER.forEach((rId, idx) => {
      const rSum = result.ringSummaries[rId];
      ctx.fillStyle = "#141927";
      ctx.fillRect(rx, ry, boxWidth, 265);
      ctx.strokeStyle = colors[idx];
      ctx.lineWidth = 2;
      ctx.strokeRect(rx, ry, boxWidth, 265);

      ctx.fillStyle = colors[idx];
      ctx.font = "bold 16px 'JetBrains Mono', Consolas, monospace";
      const ringTitle = `${rSum.shortName.replace("Ring ", "R")} (${rSum.activationScore}%)`;
      ctx.fillText(ringTitle, rx + 16, ry + 34);

      ctx.fillStyle = "#f4f0e8";
      ctx.font = "14px sans-serif";
      rSum.dominantDescriptors.slice(0, 5).forEach((desc, dIdx) => {
        ctx.fillText(`• ${desc}`, rx + 18, ry + 72 + dIdx * 34);
      });

      rx += boxWidth + boxGap;
    });

    // Footer Kinship & Axioms Summary
    ctx.fillStyle = "#9ca5ba";
    ctx.font = "16px 'JetBrains Mono', Consolas, monospace";
    const kinNames = result.archetype.kin.map((k) => k.name).join(" & ");
    ctx.fillText(
      `Philosophical Kin: ${kinNames}   |   Ideological Foil: ${result.archetype.rival.name}`,
      80,
      995
    );

    const link = document.createElement("a");
    link.download = `characteristica-manifesto-${result.archetype.id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* HERO: TRIPLE-TIER PHILOSOPHICAL MANIFESTO */}
      <section
        className="rounded-3xl border p-6 sm:p-10 relative overflow-hidden shadow-lg print-break-inside-avoid"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--accent-gold)"
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono-code font-semibold border"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-subtle)",
              color: "var(--accent-gold)"
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Triple-Tier Manifesto · Compiled Philosophical Definition
          </span>

          <span className="text-xs font-mono-code opacity-70">
            45 Coordinates Resolved · 3 Acts · 4 Concentric Rings
          </span>
        </div>

        {/* TIER I: Grand Leibnizian Formula (Interactive Hover / Tap Glossary) */}
        <InteractiveSentence parts={result.parts} />

        {/* 5-Part Formula Token Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 my-6">
          {[
            {
              slot: "1. Epistemology / Reality",
              value: result.parts.epistemology,
              coords: "B01 · B06 · L01 · L05"
            },
            {
              slot: "2. Disposition / Temperament",
              value: result.parts.disposition,
              coords: "D05 · L07 · L12"
            },
            {
              slot: "3. Ethics / Conduct",
              value: result.parts.ethicsNoun,
              coords: "L02 · L03 · L11 · L14"
            },
            {
              slot: "4. Meaning / Teleology",
              value: result.parts.teleologyVerbPhrase,
              coords: "B08 · B09 · L09 · D02"
            },
            {
              slot: "5. Horizon Anchor",
              value: result.parts.horizonAnchor,
              coords: "D01 · D06 · D15"
            }
          ].map((item) => (
            <div
              key={item.slot}
              className="p-3 rounded-xl border text-xs"
              style={{
                backgroundColor: "var(--bg-elevated)",
                borderColor: "var(--border-subtle)"
              }}
            >
              <div className="font-mono-code text-[10px] uppercase opacity-60 mb-1">
                {item.slot}
              </div>
              <div className="font-semibold text-sm mb-1" style={{ color: "var(--accent-gold)" }}>
                {item.value}
              </div>
              <div className="font-mono-code text-[10px] opacity-50">{item.coords}</div>
            </div>
          ))}
        </div>

        {/* TIER II: THE TRIAD MOVEMENT (3 Rhythmic Sentences for Origin, Conduct, Horizon) */}
        <div
          className="my-6 pt-6 border-t"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <span
              className="text-xs font-mono-code uppercase tracking-widest font-semibold"
              style={{ color: "var(--accent-gold)" }}
            >
              Manifesto Tier II · The Triad Movement (Origin, Conduct, Horizon)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {[
              result.triadMovement.origin,
              result.triadMovement.conduct,
              result.triadMovement.horizon
            ].map((mov) => (
              <div
                key={mov.act}
                className="p-4 rounded-2xl border flex flex-col justify-between"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-subtle)"
                }}
              >
                <div>
                  <div
                    className="text-[11px] font-mono-code font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: "var(--accent-gold)" }}
                  >
                    {mov.label}
                  </div>
                  <p className="font-serif-philo text-lg italic leading-snug mb-3">
                    “{mov.sentence}”
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 pt-2 border-t border-dashed" style={{ borderColor: "var(--border-subtle)" }}>
                  {mov.anchorCoords.map((cid) => (
                    <span
                      key={cid}
                      className="text-[10px] font-mono-code px-1.5 py-0.5 rounded border opacity-70"
                      style={{ borderColor: "var(--border-subtle)" }}
                    >
                      {cid}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TIER III: THE 3 LIVING AXIOMS (Actionable Daily Maxims) */}
        <div
          className="my-6 pt-6 border-t"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
            <span
              className="text-xs font-mono-code uppercase tracking-widest font-semibold"
              style={{ color: "var(--accent-gold)" }}
            >
              Manifesto Tier III · The 3 Living Axioms (Daily Imperatives)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {result.livingAxioms.map((axiom) => (
              <div
                key={axiom.id}
                className="p-4 rounded-2xl border flex flex-col justify-between"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-subtle)"
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className="text-[10px] font-mono-code uppercase tracking-wider px-2 py-0.5 rounded border font-bold"
                      style={{
                        borderColor: "var(--accent-gold)",
                        color: "var(--accent-gold)"
                      }}
                    >
                      Axiom {axiom.numeral} · {axiom.domain}
                    </span>
                  </div>
                  <h4 className="font-serif-philo text-xl font-bold mt-1 mb-1.5">
                    {axiom.title}
                  </h4>
                  <p
                    className="text-xs sm:text-sm italic font-medium mb-2.5"
                    style={{ color: "var(--accent-gold)" }}
                  >
                    “{axiom.maxim}”
                  </p>
                  <p className="text-xs leading-relaxed opacity-85 mb-3">
                    <strong>Daily Practice:</strong> {axiom.dailyPractice}
                  </p>
                </div>

                <div className="flex items-center gap-1 pt-2 border-t border-dashed text-[10px] font-mono-code opacity-65" style={{ borderColor: "var(--border-subtle)" }}>
                  <span>Anchors:</span>
                  {axiom.anchorCoordinates.map((c) => (
                    <span key={c} className="px-1.5 py-0.2 rounded border" style={{ borderColor: "var(--border-subtle)" }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comprehensive Export & Shareability Suite Toolbar */}
        <div
          className="flex flex-wrap items-center gap-2.5 pt-4 border-t no-print"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <button
            type="button"
            onClick={handleCopySentence}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            style={{
              backgroundColor: "var(--accent-gold)",
              color: "#090b10"
            }}
          >
            {copiedSentence ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedSentence ? "Formula Copied!" : "Copy Core Formula"}
          </button>

          <button
            type="button"
            onClick={handleCopyMarkdownDossier}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer hover:opacity-90 transition-all"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-subtle)"
            }}
          >
            {copiedMarkdown ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <FileText className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
            )}
            {copiedMarkdown ? "Full Manifesto Copied!" : "Copy Full Manifesto (Markdown)"}
          </button>

          <button
            type="button"
            onClick={handleDownloadCard}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer hover:opacity-90 transition-all"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-subtle)"
            }}
          >
            <Download className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
            Download Astrolabe Card (PNG)
          </button>

          <button
            type="button"
            onClick={handlePrintDossier}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer hover:opacity-90 transition-all"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-subtle)"
            }}
          >
            <Printer className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
            Print / Archival PDF Dossier
          </button>

          <button
            type="button"
            onClick={handleShareLink}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer hover:opacity-90 transition-all"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-subtle)"
            }}
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            {copiedLink ? "Share URL Copied!" : "Copy Shareable URL"}
          </button>

          <button
            type="button"
            onClick={onOpenTelemetry}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer hover:opacity-90 transition-all"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-subtle)"
            }}
          >
            <Layers className="w-4 h-4" />
            Inspect All 45 Coordinates
          </button>

          <button
            type="button"
            onClick={onResetQuiz}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border cursor-pointer opacity-80 hover:opacity-100 ml-auto"
            style={{
              backgroundColor: "transparent",
              borderColor: "var(--border-subtle)"
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retake Odyssey
          </button>
        </div>
      </section>

      {/* SECTION 2: FULL 8-ARCHETYPE SPIDER CONSTELLATION */}
      <ArchetypeSpiderChart
        constellation={result.archetypeConstellation}
        primaryArchetype={result.archetype}
        secondaryArchetype={result.secondaryArchetype}
      />

      {/* SECTION 3: DOMINANT ARCHETYPE DOSSIER + ASTROLABE RINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-6">
          {/* Archetype Card */}
          <div
            className="rounded-2xl border p-6 print-break-inside-avoid"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)"
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <span className="text-xs font-mono-code uppercase tracking-widest opacity-65">
                Dominant Philosophical Archetype
              </span>
              <span
                className="text-[11px] font-mono-code px-2.5 py-0.5 rounded-full border"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--accent-gold)"
                }}
              >
                Secondary Complement: {result.secondaryArchetype.name}
              </span>
            </div>
            <h3 className="font-serif-philo text-3xl font-bold">
              {result.archetype.name}
            </h3>
            <p
              className="text-sm font-mono-code italic opacity-75 mb-4"
              style={{ color: "var(--accent-gold)" }}
            >
              {result.archetype.latinTitle}
            </p>
            <p className="text-sm sm:text-base leading-relaxed opacity-90 mb-6">
              {result.archetype.description}
            </p>

            {/* Historical Kin & Rival */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div>
                <h4 className="text-xs font-mono-code uppercase tracking-wider flex items-center gap-1.5 mb-2.5 text-emerald-400">
                  <BookOpen className="w-3.5 h-3.5" />
                  Historical Philosophical Kin
                </h4>
                <div className="space-y-2.5">
                  {result.archetype.kin.map((k) => (
                    <div
                      key={k.name}
                      className="p-3 rounded-xl border text-xs"
                      style={{
                        backgroundColor: "var(--bg-elevated)",
                        borderColor: "var(--border-subtle)"
                      }}
                    >
                      <div className="font-semibold text-sm">
                        {k.name}{" "}
                        <span className="font-mono-code text-[10px] opacity-60">
                          ({k.era} · {k.tradition})
                        </span>
                      </div>
                      <p className="italic opacity-80 my-1.5">“{k.quote}”</p>
                      <p className="opacity-70 text-[11px]">{k.resonanceReason}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-xs font-mono-code uppercase tracking-wider flex items-center gap-1.5 mb-2.5 text-rose-400">
                    <Swords className="w-3.5 h-3.5" />
                    Ideological Foil / Nemesis
                  </h4>
                  <div
                    className="p-3 rounded-xl border text-xs"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      borderColor: "var(--border-subtle)"
                    }}
                  >
                    <div className="font-semibold text-sm">
                      {result.archetype.rival.name}{" "}
                      <span className="font-mono-code text-[10px] opacity-60">
                        ({result.archetype.rival.era} · {result.archetype.rival.tradition})
                      </span>
                    </div>
                    <p className="italic opacity-80 my-1.5">“{result.archetype.rival.quote}”</p>
                    <p className="opacity-70 text-[11px]">{result.archetype.rival.resonanceReason}</p>
                  </div>
                </div>

                {/* The Existential Shadow */}
                <div
                  className="p-3.5 rounded-xl border text-xs"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    borderColor: "var(--accent-gold)"
                  }}
                >
                  <div
                    className="font-mono-code font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-1"
                    style={{ color: "var(--accent-gold)" }}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Existential Shadow: {result.archetype.shadow.title}
                  </div>
                  <p className="opacity-85 mb-1.5">
                    <strong>Blind Spot:</strong> {result.archetype.shadow.blindSpot}
                  </p>
                  <p className="opacity-80">
                    <strong>Antidote:</strong> {result.archetype.shadow.philosophicalAntidote}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Illuminated 4 Concentric Rings Astrolabe */}
        <div className="lg:col-span-5">
          <ConcentricRings ringMetrics={ringMetrics} />
        </div>
      </div>

      {/* SECTION 4: THE 4 CONCENTRIC RINGS BREAKDOWN CARDS */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Compass className="w-5 h-5" style={{ color: "var(--accent-gold)" }} />
          <h3 className="font-serif-philo text-2xl font-semibold">
            Tier IV · The 4 Concentric Rings Breakdown
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {RING_ORDER.map((ringId) => {
            const summary = result.ringSummaries[ringId];
            const colorHex = RING_COLORS_HEX[ringId];
            return (
              <div
                key={ringId}
                className="rounded-2xl border p-5 flex flex-col justify-between print-break-inside-avoid"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)"
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-base flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full inline-block"
                        style={{ backgroundColor: colorHex }}
                      />
                      {summary.shortName}
                    </h4>
                    <span
                      className="font-mono-code text-xs font-bold px-2.5 py-0.5 rounded-full border"
                      style={{
                        borderColor: colorHex,
                        color: colorHex
                      }}
                    >
                      Coherence: {summary.activationScore}%
                    </span>
                  </div>
                  <p className="text-xs font-mono-code opacity-60 mb-3">
                    {summary.subtitle}
                  </p>

                  <p className="text-sm leading-relaxed opacity-90 mb-4">
                    {summary.synthesisParagraph}
                  </p>
                </div>

                {/* Coordinate Chips */}
                <div className="pt-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                  <div className="text-[10px] font-mono-code uppercase opacity-60 mb-2">
                    Resolved Ring Coordinates ({summary.coordinates.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {summary.coordinates.map((c) => (
                      <span
                        key={c.id}
                        className="text-[11px] font-mono-code px-2 py-0.5 rounded border"
                        style={{
                          backgroundColor: "var(--bg-elevated)",
                          borderColor: "var(--border-subtle)"
                        }}
                        title={`${c.dimension} (Pole ${c.pole})`}
                      >
                        <strong style={{ color: colorHex }}>{c.id}:</strong> {c.descriptor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 5: THE 3 ACTS ODYSSEY & 3 TRIAD LAYERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3 Acts */}
        <div
          className="rounded-2xl border p-6 space-y-4 print-break-inside-avoid"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)"
          }}
        >
          <h3 className="font-serif-philo text-2xl font-semibold">
            Tier II · The 3 Acts of Existence
          </h3>
          {(["BORN", "LIVE", "DIE"] as ActType[]).map((act) => {
            const actSum = result.actSummaries[act];
            return (
              <div
                key={act}
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-subtle)"
                }}
              >
                <div className="font-semibold text-sm" style={{ color: "var(--accent-gold)" }}>
                  {actSum.title}
                </div>
                <div className="text-[11px] font-mono-code opacity-60 mb-2">
                  {actSum.subtitle}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed opacity-90 mb-2.5">
                  {actSum.synthesis}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {actSum.topDescriptors.map((d, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono-code px-2 py-0.5 rounded border opacity-80"
                      style={{ borderColor: "var(--border-subtle)" }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3 Triad Layers */}
        <div
          className="rounded-2xl border p-6 space-y-4 print-break-inside-avoid"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)"
          }}
        >
          <h3 className="font-serif-philo text-2xl font-semibold">
            Tier I · The 3 Ontological Triad Layers
          </h3>
          {(["Container", "Bridge", "Vessel"] as TriadLayer[]).map((layer) => {
            const trSum = result.triadSummaries[layer];
            return (
              <div
                key={layer}
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-subtle)"
                }}
              >
                <div className="font-semibold text-sm" style={{ color: "var(--accent-gold)" }}>
                  {trSum.layer} Layer
                </div>
                <div className="text-[11px] font-mono-code opacity-60 mb-2">
                  {trSum.subtitle}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed opacity-90 mb-2.5">
                  {trSum.synthesis}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {trSum.dominantDescriptors.map((d, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono-code px-2 py-0.5 rounded border opacity-80"
                      style={{ borderColor: "var(--border-subtle)" }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
