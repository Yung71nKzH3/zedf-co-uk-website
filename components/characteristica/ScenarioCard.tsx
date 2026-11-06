import React, { useEffect, useRef, useState } from "react";
import { ScenarioOption, ScenarioQuestion } from "../../types/schema";
import { COORDINATE_MAP } from "../../data/coordinates";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Sparkles
} from "lucide-react";

interface ScenarioCardProps {
  scenario: ScenarioQuestion;
  selectedOptionId?: string;
  onSelectOption: (option: ScenarioOption) => void;
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  isLastStep: boolean;
  allAnswered: boolean;
  onFinishQuiz: () => void;
}

function runScopedTransition(scopeEl: HTMLElement | null, updateDOM: () => void) {
  const supportsScopedTransition =
    typeof Element !== "undefined" && "startViewTransition" in Element.prototype;
  if (!scopeEl || !supportsScopedTransition) {
    updateDOM();
    return;
  }
  try {
    const transition = (
      scopeEl as unknown as {
        startViewTransition: (cb: () => void) => { ready: Promise<void> };
      }
    ).startViewTransition(() => {
      updateDOM();
    });
    transition.ready.catch(() => {});
  } catch {
    updateDOM();
  }
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  selectedOptionId,
  onSelectOption,
  onPrev,
  onNext,
  canGoPrev,
  isLastStep,
  allAnswered,
  onFinishQuiz
}) => {
  const cardScopeRef = useRef<HTMLElement | null>(null);
  const [revealAllUndercurrents, setRevealAllUndercurrents] = useState<boolean>(false);
  const [expandedOptionIds, setExpandedOptionIds] = useState<Record<string, boolean>>({});

  // Support keyboard navigation 1, 2, 3, 4 or A, B, C, D, and U for Undercurrent toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.closest("dialog"))
      ) {
        return;
      }
      const key = e.key.toUpperCase();
      const indexMap: Record<string, number> = {
        "1": 0,
        A: 0,
        "2": 1,
        B: 1,
        "3": 2,
        C: 2,
        "4": 3,
        D: 3
      };
      if (key in indexMap) {
        const opt = scenario.options[indexMap[key]];
        if (opt) {
          e.preventDefault();
          onSelectOption(opt);
        }
      } else if (key === "U") {
        e.preventDefault();
        runScopedTransition(cardScopeRef.current, () => {
          setRevealAllUndercurrents((prev) => !prev);
        });
      } else if (e.key === "ArrowLeft" && canGoPrev) {
        onPrev();
      } else if (e.key === "ArrowRight" && selectedOptionId && !isLastStep) {
        onNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scenario, canGoPrev, selectedOptionId, isLastStep, onSelectOption, onPrev, onNext]);

  // Unique coordinates tested in this scenario
  const testedCoordinates = Array.from(
    new Set(scenario.options.flatMap((o) => o.weights.map((w) => w.coordinateId)))
  );

  const toggleOptionUndercurrent = (e: React.MouseEvent, optId: string) => {
    e.stopPropagation();
    runScopedTransition(cardScopeRef.current, () => {
      setExpandedOptionIds((prev) => ({
        ...prev,
        [optId]: !prev[optId]
      }));
    });
  };

  return (
    <article
      ref={cardScopeRef}
      key={scenario.id}
      className="rounded-2xl border p-5 sm:p-7 transition-all shadow-sm scenario-card-transition"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)"
      }}
    >
      {/* Header Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-[11px] font-mono-code uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-subtle)",
              color: "var(--accent-gold)"
            }}
          >
            {scenario.ringFocus}
          </span>
          <span className="text-xs opacity-65 font-mono-code">
            Domain: {scenario.philosophicalDomain}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              runScopedTransition(cardScopeRef.current, () => {
                setRevealAllUndercurrents((prev) => !prev);
              })
            }
            className="text-[10px] font-mono-code px-2 py-0.5 rounded-full border cursor-pointer transition-all flex items-center gap-1"
            style={{
              backgroundColor: revealAllUndercurrents ? "var(--accent-gold)" : "var(--bg-elevated)",
              color: revealAllUndercurrents ? "#090b10" : "var(--accent-gold)",
              borderColor: "var(--accent-gold)"
            }}
            title="Toggle academic philosophical undercurrents and coordinate anchors (Shortcut: U)"
          >
            <Compass className="w-3 h-3" />
            <span>{revealAllUndercurrents ? "Undercurrents Open" : "Philosophical Undercurrent [U]"}</span>
          </button>

          {testedCoordinates.map((cid) => (
            <span
              key={cid}
              className="text-[10px] font-mono-code px-1.5 py-0.5 rounded border opacity-75"
              style={{
                backgroundColor: "var(--bg-elevated)",
                borderColor: "var(--border-subtle)"
              }}
              title={`Evaluates Coordinate ${cid}: ${COORDINATE_MAP[cid]?.coreDimension ?? ""}`}
            >
              {cid}
            </span>
          ))}
        </div>
      </div>

      {/* Scenario Title & Narrative Scene */}
      <h2 className="font-serif-philo text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
        {scenario.stepNumber}. {scenario.title}
      </h2>

      <p
        className="text-sm sm:text-base leading-relaxed mb-4 p-4 rounded-xl border italic"
        style={{
          backgroundColor: "var(--bg-elevated)",
          borderColor: "var(--border-subtle)",
          color: "var(--text-secondary)"
        }}
      >
        “{scenario.sceneContext}”
      </p>

      <p className="text-base sm:text-lg font-medium mb-5 leading-snug">
        {scenario.prompt}
      </p>

      {/* Response Options with Dual-Layer Philosophical Depth */}
      <div className="space-y-3 mb-6" role="radiogroup" aria-label={scenario.title}>
        {scenario.options.map((opt, idx) => {
          const isSelected = selectedOptionId === opt.id;
          const isUndercurrentVisible =
            revealAllUndercurrents || Boolean(expandedOptionIds[opt.id]) || isSelected;

          return (
            <div
              key={opt.id}
              className="rounded-xl border transition-all overflow-hidden"
              style={{
                backgroundColor: isSelected ? "var(--bg-elevated)" : "transparent",
                borderColor: isSelected ? "var(--accent-gold)" : "var(--border-subtle)",
                boxShadow: isSelected
                  ? "0 0 0 1px var(--accent-gold), 0 6px 20px -6px rgba(229, 184, 105, 0.25)"
                  : "none"
              }}
            >
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectOption(opt)}
                className="w-full text-left p-4 transition-all cursor-pointer group relative flex items-start gap-3.5 hover:opacity-95"
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-mono-code text-xs font-semibold shrink-0 mt-0.5 border transition-colors"
                  style={{
                    backgroundColor: isSelected ? "var(--accent-gold)" : "var(--bg-elevated)",
                    color: isSelected ? "#090b10" : "var(--text-primary)",
                    borderColor: isSelected ? "var(--accent-gold)" : "var(--border-subtle)"
                  }}
                >
                  {opt.key}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className="text-xs sm:text-[13px] font-mono-code font-semibold tracking-wide"
                      style={{ color: "var(--accent-gold)" }}
                    >
                      {opt.stanceTag}
                    </span>
                    <span className="text-[10px] font-mono-code opacity-45 hidden sm:inline">
                      Key [{idx + 1}]
                    </span>
                  </div>

                  <p className="text-sm sm:text-[15px] leading-relaxed">
                    {opt.narrativeText}
                  </p>
                </div>

                {isSelected && (
                  <CheckCircle2
                    className="w-5 h-5 shrink-0 mt-0.5"
                    style={{ color: "var(--accent-gold)" }}
                  />
                )}
              </button>

              {/* Dual-Layer Philosophical Undercurrent Bar */}
              <div
                className="px-4 py-2 border-t border-dashed flex flex-col gap-1.5"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "color-mix(in srgb, var(--bg-elevated) 55%, transparent)"
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => toggleOptionUndercurrent(e, opt.id)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono-code cursor-pointer hover:opacity-100 opacity-75 transition-opacity"
                    style={{ color: "var(--accent-gold)" }}
                  >
                    {isUndercurrentVisible ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                    <span>Philosophical Undercurrent: {opt.philosophicalSubtext}</span>
                  </button>

                  <span className="text-[10px] font-mono-code opacity-65">
                    {opt.weights.map((w) => `${w.coordinateId}:${w.pole}`).join(" · ")}
                  </span>
                </div>

                {isUndercurrentVisible && (
                  <div className="pt-1.5 pb-1 grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px]">
                    {opt.weights.map((w) => {
                      const coord = COORDINATE_MAP[w.coordinateId];
                      if (!coord) return null;
                      const stance =
                        w.pole === "A"
                          ? coord.stanceA
                          : w.pole === "B"
                          ? coord.stanceB
                          : coord.stanceC;
                      return (
                        <div
                          key={`${opt.id}-${w.coordinateId}`}
                          className="p-2 rounded-lg border font-mono-code text-[10px]"
                          style={{
                            backgroundColor: "var(--bg-surface)",
                            borderColor: "var(--border-subtle)"
                          }}
                        >
                          <div className="font-semibold" style={{ color: "var(--accent-gold)" }}>
                            [{w.coordinateId}:{w.pole}] {stance.descriptor}
                          </div>
                          <div className="opacity-75 truncate" title={coord.coreDimension}>
                            {coord.coreDimension} ({coord.triadLayer})
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <button
          type="button"
          onClick={onPrev}
          disabled={!canGoPrev}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-opacity cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-subtle)"
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Previous Hour
        </button>

        <div className="flex items-center gap-2.5">
          {!isLastStep && (
            <button
              type="button"
              onClick={onNext}
              disabled={!selectedOptionId}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: selectedOptionId ? "var(--accent-gold)" : "var(--bg-elevated)",
                color: selectedOptionId ? "#090b10" : "var(--text-primary)",
                borderColor: selectedOptionId ? "var(--accent-gold)" : "var(--border-subtle)"
              }}
            >
              Next Hour
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {(isLastStep || allAnswered) && (
            <button
              type="button"
              onClick={onFinishQuiz}
              disabled={!allAnswered}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              style={{
                backgroundColor: "var(--accent-gold)",
                color: "#090b10"
              }}
            >
              <Sparkles className="w-4 h-4" />
              Compile Philosophical Sentence
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
