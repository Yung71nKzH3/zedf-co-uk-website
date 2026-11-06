import React from "react";
import { SCENARIOS } from "../../data/scenarios";
import { Clock, Compass } from "lucide-react";

interface PillarTimelineProps {
  currentStepIndex: number;
  answers: Record<string, string>;
  onSelectStep: (idx: number) => void;
}

export const PillarTimeline: React.FC<PillarTimelineProps> = ({
  currentStepIndex,
  answers,
  onSelectStep
}) => {
  const currentScenario = SCENARIOS[currentStepIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div
      className="w-full rounded-2xl border p-3.5 mb-5"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)"
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono-code font-medium border"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-subtle)",
              color: "var(--accent-gold)"
            }}
          >
            <Clock className="w-3.5 h-3.5" />
            {currentScenario.timeOfDay}
          </span>

          <span className="text-xs font-mono-code uppercase tracking-wider opacity-75">
            Act: <strong>{currentScenario.act}</strong> · Pillar:{" "}
            <strong>{currentScenario.pillar}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-code opacity-80">
          <Compass className="w-3.5 h-3.5" style={{ color: "var(--accent-gold)" }} />
          <span>
            Hour {currentStepIndex + 1} of {SCENARIOS.length} ({answeredCount} Resolved)
          </span>
        </div>
      </div>

      {/* 16-Step Chronological Bar */}
      <div className="grid grid-cols-16 gap-1">
        {SCENARIOS.map((s, idx) => {
          const isAnswered = Boolean(answers[s.id]);
          const isCurrent = idx === currentStepIndex;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectStep(idx)}
              title={`${s.timeOfDay} — ${s.title} (${s.pillar})`}
              aria-label={`Jump to step ${idx + 1}: ${s.title}`}
              className="h-2.5 rounded-sm transition-all cursor-pointer relative"
              style={{
                backgroundColor: isCurrent
                  ? "var(--accent-gold)"
                  : isAnswered
                  ? "var(--ring2-color)"
                  : "var(--border-subtle)",
                opacity: isCurrent ? 1 : isAnswered ? 0.85 : 0.45,
                transform: isCurrent ? "scaleY(1.35)" : "none"
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
