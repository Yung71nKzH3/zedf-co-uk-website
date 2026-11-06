import React, { useEffect, useId, useRef, useState } from "react";
import { COORDINATES } from "@/lib/characteristica/coordinates";
import { ActType, CoordinateScoreMap, RingId } from "@/lib/characteristica/schema";
import { X, Filter, Layers } from "lucide-react";

interface TelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  scoreMap: CoordinateScoreMap;
}

export const TelemetryModal: React.FC<TelemetryModalProps> = ({
  isOpen,
  onClose,
  scoreMap
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();
  const [actFilter, setActFilter] = useState<ActType | "ALL">("ALL");
  const [ringFilter, setRingFilter] = useState<RingId | "ALL">("ALL");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Fallback for browsers without native <dialog closedby="any"> support per modern-web-guidance
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      dialog.returnValue = "";
      onClose();
    };
    dialog.addEventListener("close", handleClose);

    if (!("closedBy" in HTMLDialogElement.prototype)) {
      const outside = (e: PointerEvent, d: HTMLDialogElement) => {
        const r = d.getBoundingClientRect();
        return (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        );
      };
      let pressedOutside = false;
      const onPointerDown = (e: PointerEvent) => {
        pressedOutside = outside(e, dialog);
      };
      const onPointerUp = (e: PointerEvent) => {
        if (pressedOutside && outside(e, dialog)) {
          dialog.close();
        }
      };
      dialog.addEventListener("pointerdown", onPointerDown);
      dialog.addEventListener("pointerup", onPointerUp);
      return () => {
        dialog.removeEventListener("close", handleClose);
        dialog.removeEventListener("pointerdown", onPointerDown);
        dialog.removeEventListener("pointerup", onPointerUp);
      };
    }

    return () => {
      dialog.removeEventListener("close", handleClose);
    };
  }, [onClose]);

  const filteredCoords = COORDINATES.filter((c) => {
    if (actFilter !== "ALL" && c.act !== actFilter) return false;
    if (ringFilter !== "ALL" && c.ringUi !== ringFilter) return false;
    return true;
  });

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      {...({ closedby: "any" } as any)}
      className="w-full max-w-5xl rounded-2xl p-0 m-auto shadow-2xl"
    >
      <div className="p-5 sm:p-6 max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
          <div>
            <span className="text-xs font-mono-code uppercase tracking-widest opacity-65 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" style={{ color: "var(--accent-gold)" }} />
              Tier I · Characteristica Universalis Schema
            </span>
            <h2 id={titleId} className="font-serif-philo text-2xl font-semibold mt-0.5">
              The 45 Ontological Coordinates (B01–D15)
            </h2>
          </div>

          <form method="dialog">
            <button
              type="submit"
              autoFocus
              aria-label="Close coordinate matrix inspector"
              className="p-2 rounded-lg border cursor-pointer hover:opacity-80"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)"
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b text-xs" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="flex flex-wrap items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 opacity-60 mr-1" />
            {(["ALL", "BORN", "LIVE", "DIE"] as const).map((act) => (
              <button
                key={act}
                type="button"
                onClick={() => setActFilter(act)}
                className="px-2.5 py-1 rounded-md font-mono-code cursor-pointer border transition-colors"
                style={{
                  backgroundColor: actFilter === act ? "var(--accent-gold)" : "var(--bg-surface)",
                  color: actFilter === act ? "#090b10" : "var(--text-primary)",
                  borderColor: actFilter === act ? "var(--accent-gold)" : "var(--border-subtle)"
                }}
              >
                {act === "ALL" ? "All Acts (45)" : `Act: ${act}`}
              </button>
            ))}
          </div>

          <select
            value={ringFilter}
            onChange={(e) => setRingFilter(e.target.value as RingId | "ALL")}
            aria-label="Filter by Ring"
            className="px-2.5 py-1 rounded-md border font-mono-code text-xs"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-primary)"
            }}
          >
            <option value="ALL">All 4 Concentric Rings</option>
            <option value="Ring 1: Internal Engine">Ring 1: Internal Engine</option>
            <option value="Ring 2: Relational Orbit">Ring 2: Relational Orbit</option>
            <option value="Ring 3: Material & Agency">Ring 3: Material & Agency</option>
            <option value="Ring 4: Cosmic Horizon">Ring 4: Cosmic Horizon</option>
          </select>
        </div>

        {/* Scrollable Coordinate Grid */}
        <div className="overflow-y-auto flex-1 py-4 space-y-2.5 pr-1">
          {filteredCoords.map((c) => {
            const tally = scoreMap[c.id];
            const isResolved = tally.totalSignal > 0;
            return (
              <div
                key={c.id}
                className="p-3.5 rounded-xl border text-xs transition-all"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: isResolved ? "var(--accent-gold)" : "var(--border-subtle)"
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono-code font-bold px-2 py-0.5 rounded text-[11px]"
                      style={{
                        backgroundColor: isResolved ? "var(--accent-gold)" : "var(--bg-elevated)",
                        color: isResolved ? "#090b10" : "var(--text-primary)"
                      }}
                    >
                      {c.id}
                    </span>
                    <span className="font-semibold text-sm">{c.coreDimension}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 font-mono-code text-[10px] opacity-75">
                    <span>{c.act}</span>
                    <span>·</span>
                    <span>{c.interrogative}</span>
                    <span>·</span>
                    <span>{c.triadLayer}</span>
                    <span>·</span>
                    <span>{c.ringUi}</span>
                    <span>·</span>
                    <span>Pillar: {c.dailyPillar}</span>
                  </div>
                </div>

                {/* 3 Stances (Thesis, Antithesis, Synthesis) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  {([c.stanceA, c.stanceB, c.stanceC] as const).map((s) => {
                    const isDominant = isResolved && tally.dominant === s.pole;
                    const pts = tally[s.pole];
                    return (
                      <div
                        key={s.pole}
                        className="p-2.5 rounded-lg border"
                        style={{
                          backgroundColor: "var(--bg-elevated)",
                          borderColor: isDominant ? "var(--accent-gold)" : "var(--border-subtle)"
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono-code font-semibold text-[11px]" style={{ color: isDominant ? "var(--accent-gold)" : "var(--text-primary)" }}>
                            [{s.pole}] {s.descriptor}
                          </span>
                          {pts > 0 && (
                            <span className="font-mono-code text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">
                              +{pts} signal
                            </span>
                          )}
                        </div>
                        <p className="opacity-75 text-[11px] leading-snug">
                          <strong>{s.title}:</strong> {s.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Historical Lineage */}
                <div className="text-[11px] font-mono-code opacity-60">
                  Lineage: {c.philosophicalTraditions.join("  |  ")}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </dialog>
  );
};

