'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SCENARIOS } from '@/lib/characteristica/scenarios';
import {
  computeCoordinateScores,
  computeLiveRingMetrics
} from '@/lib/characteristica/quizMachine';
import { compilePhilosophicalSentence } from '@/lib/characteristica/sentenceCompiler';
import {
  clearLocalState,
  decodeParamToAnswers,
  encodeAnswersToParam,
  loadStateFromLocal,
  saveStateToLocal
} from '@/lib/characteristica/urlSerializer';
import {
  isSoundMuted,
  playAstrolabeTick,
  playCoordinateLock,
  playManifestoComplete,
  setSoundMuted
} from '@/lib/characteristica/soundEngine';
import { ScenarioOption } from '@/lib/characteristica/schema';
import { ConcentricRings } from '@/components/characteristica/ConcentricRings';
import { PillarTimeline } from '@/components/characteristica/PillarTimeline';
import { ScenarioCard } from '@/components/characteristica/ScenarioCard';
import { ResultsView } from '@/components/characteristica/ResultsView';
import { TelemetryModal } from '@/components/characteristica/TelemetryModal';
import {
  Compass,
  Layers,
  Sparkles,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowLeft
} from 'lucide-react';

export default function CharacteristicaPage() {
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState<boolean>(false);
  const [soundMuted, setSoundMutedState] = useState<boolean>(() => isSoundMuted());

  // Hydrate from URL parameter (?p=...) or localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('p');
    const decodedFromUrl = decodeParamToAnswers(encoded);
    if (decodedFromUrl) {
      setAnswers(decodedFromUrl);
      const allDone = Object.keys(decodedFromUrl).length === SCENARIOS.length;
      setHasStarted(true);
      setIsCompleted(allDone);
      return;
    }

    const saved = loadStateFromLocal();
    if (saved && Object.keys(saved.answers).length > 0) {
      setAnswers(saved.answers);
      setCurrentStepIndex(saved.currentStepIndex);
      setIsCompleted(saved.isCompleted);
      setHasStarted(true);
    }
  }, []);

  // Sync state to localStorage and URL query parameter
  useEffect(() => {
    if (typeof window === 'undefined') return;
    saveStateToLocal(answers, currentStepIndex, isCompleted);
    const count = Object.keys(answers).length;
    const url = new URL(window.location.href);
    if (count > 0) {
      url.searchParams.set('p', encodeAnswersToParam(answers));
    } else {
      url.searchParams.delete('p');
    }
    window.history.replaceState({}, '', url.toString());
  }, [answers, currentStepIndex, isCompleted]);

  const ringMetrics = useMemo(() => computeLiveRingMetrics(answers), [answers]);
  const scoreMap = useMemo(() => computeCoordinateScores(answers), [answers]);
  const compiledResult = useMemo(
    () => compilePhilosophicalSentence(answers),
    [answers]
  );

  const allAnswered = Object.keys(answers).length === SCENARIOS.length;
  const currentScenario = SCENARIOS[currentStepIndex];

  const handleToggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    setSoundMutedState(next);
    if (!next) {
      playAstrolabeTick();
    }
  };

  const handleSelectOption = (option: ScenarioOption) => {
    playCoordinateLock(option.key);
    const updated = {
      ...answers,
      [currentScenario.id]: option.id
    };
    setAnswers(updated);

    // Automatically advance after a short, crisp beat if not on the final step
    if (currentStepIndex < SCENARIOS.length - 1) {
      setTimeout(() => {
        setCurrentStepIndex((prev) => Math.min(SCENARIOS.length - 1, prev + 1));
      }, 240);
    }
  };

  const handleResetQuiz = () => {
    playAstrolabeTick();
    clearLocalState();
    setAnswers({});
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setHasStarted(true);
  };

  const handleApplyArchetypePreset = (polePattern: ('A' | 'B' | 'C' | 'D')[]) => {
    const presetAnswers: Record<string, string> = {};
    SCENARIOS.forEach((s, idx) => {
      const targetKey = polePattern[idx % polePattern.length];
      const found = s.options.find((o) => o.key === targetKey) ?? s.options[0];
      presetAnswers[s.id] = found.id;
    });
    setAnswers(presetAnswers);
    setHasStarted(true);
    setIsCompleted(true);
    playManifestoComplete();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-[#f4f0e8] selection:bg-[#e5b869]/30">
      <style jsx global>{`
        :root {
          --bg-canvas: #07090e;
          --bg-surface: #0f131d;
          --bg-elevated: #161b29;
          --text-primary: #f4f0e8;
          --text-secondary: #9ca5ba;
          --text-muted: #667089;
          --border-subtle: rgba(229, 184, 105, 0.16);
          --accent-gold: #e5b869;
          --accent-copper: #d97736;
          --ring1-color: #fbbf24;
          --ring2-color: #34d399;
          --ring3-color: #60a5fa;
          --ring4-color: #a78bfa;
        }

        .font-serif-philo {
          font-family: 'Cormorant Garamond', 'Palatino Linotype', Palatino, Georgia, serif;
        }

        .font-mono-code {
          font-family: 'JetBrains Mono', Consolas, monospace;
        }

        @keyframes astrolabe-orbit-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes astrolabe-orbit-ccw {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes astrolabe-card-enter {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .astrolabe-orbit-cw {
          transform-origin: 210px 210px;
          animation: astrolabe-orbit-cw 64s linear infinite;
        }

        .astrolabe-orbit-ccw {
          transform-origin: 210px 210px;
          animation: astrolabe-orbit-ccw 84s linear infinite;
        }

        .astrolabe-orbit-paused {
          animation-play-state: paused !important;
        }

        .scenario-card-transition {
          animation: astrolabe-card-enter 0.28s cubic-bezier(0.22, 1, 0.36, 1);
        }

        @media (prefers-reduced-motion: reduce) {
          .astrolabe-orbit-cw,
          .astrolabe-orbit-ccw,
          .scenario-card-transition {
            animation: none !important;
          }
        }
      `}</style>

      {/* Top Navigation Bar with Direct Return to Personal Space */}
      <header className="sticky top-0 z-30 border-b border-[#e5b869]/20 backdrop-blur-md bg-[#0f131d]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/project-space"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-xs font-mono transition-all"
              title="Return to Personal Space (The Nebula)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Personal Space</span>
            </Link>

            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => {
                if (isCompleted) setIsCompleted(false);
              }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#e5b869]/40 bg-[#161b29]">
                <Compass className="w-4 h-4 text-[#e5b869]" />
              </div>
              <div>
                <span className="font-serif-philo text-lg sm:text-xl font-bold tracking-tight block leading-none text-[#f4f0e8]">
                  Characteristica Universalis
                </span>
                <span className="font-mono-code text-[10px] uppercase tracking-widest opacity-60 hidden sm:block text-[#e5b869]">
                  45-Coordinate Philosophical Engine
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playAstrolabeTick();
                setIsTelemetryOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono-code border border-[#e5b869]/20 bg-[#161b29] hover:border-[#e5b869]/50 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-[#e5b869]" />
              <span>45-Coord Matrix</span>
            </button>

            <button
              type="button"
              onClick={handleToggleSound}
              title={soundMuted ? 'Unmute Astrolabe harmonic chimes' : 'Mute Astrolabe harmonic chimes'}
              aria-label={soundMuted ? 'Unmute Astrolabe harmonic chimes' : 'Mute Astrolabe harmonic chimes'}
              className="p-2 rounded-full border border-[#e5b869]/20 bg-[#161b29] cursor-pointer hover:border-[#e5b869]/50 transition-colors"
              style={{ color: soundMuted ? '#667089' : '#e5b869' }}
            >
              {soundMuted ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>

            {Object.keys(answers).length > 0 && (
              <button
                type="button"
                onClick={handleResetQuiz}
                title="Reset all coordinates and restart"
                className="p-2 rounded-full border border-white/10 bg-[#161b29] cursor-pointer hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-white/70" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {!hasStarted ? (
          /* INTRO / LANDING VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-4">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono-code border border-[#e5b869]/30 bg-[#161b29] text-[#e5b869]">
                <Sparkles className="w-3.5 h-3.5" />
                First-Principles Human Ontology · 45 Coordinates
              </div>

              <h1 className="font-serif-philo text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight">
                Discover Your Exact{' '}
                <span className="italic text-[#e5b869]">
                  Philosophical Sentence.
                </span>
              </h1>

              <p className="text-base sm:text-lg leading-relaxed text-[#9ca5ba] max-w-2xl">
                Unlike personality tests or dry questionnaires, this engine models human
                existence from first principles across{' '}
                <strong className="text-white">3 Acts (Born, Live, Die)</strong>,{' '}
                <strong className="text-white">5 Interrogatives (What, How, Why, When, Where)</strong>, and{' '}
                <strong className="text-white">3 Triad Layers (Container, Bridge, Vessel)</strong>—walking you through a
                single 24-hour day to compile your exact philosophical definition.
              </p>

              {/* Example Sentence Preview Box */}
              <div className="p-4 sm:p-5 rounded-2xl border border-[#e5b869]/25 bg-[#0f131d]">
                <div className="text-[10px] font-mono-code uppercase tracking-widest text-[#e5b869]/70 mb-1.5">
                  Example Compiled Output Formula
                </div>
                <p className="font-serif-philo text-xl sm:text-2xl italic text-[#e5b869]">
                  “A Deistic, Optimistic Stoic forging conscious order from thermodynamic chaos.”
                </p>
                <div className="mt-2 text-[11px] font-mono-code text-white/50">
                  [Epistemology/Reality] + [Disposition] + [Ethics/Conduct] + [Teleology] + [Horizon Anchor]
                </div>
              </div>

              {/* Primary CTA */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    playAstrolabeTick();
                    setHasStarted(true);
                  }}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm sm:text-base font-semibold cursor-pointer shadow-md bg-[#e5b869] text-[#07090e] hover:bg-[#e5b869]/90 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Begin the 24-Hour Odyssey (16 Scenarios)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playAstrolabeTick();
                    setIsTelemetryOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-medium border border-white/10 bg-[#161b29] hover:bg-white/10 transition-colors"
                >
                  <Layers className="w-4 h-4" />
                  Explore the 45-Coordinate Schema
                </button>
              </div>

              {/* Quick Archetype Demo Buttons */}
              <div className="pt-4 border-t border-[#e5b869]/15">
                <span className="text-[11px] font-mono-code uppercase tracking-wider text-white/50 block mb-2">
                  Or simulate a complete 45-coordinate philosophical profile immediately:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyArchetypePreset([
                        'A', 'C', 'C', 'B', 'A', 'A', 'A', 'A', 'A', 'B', 'A', 'B', 'A', 'A', 'A', 'A'
                      ])
                    }
                    className="text-xs font-mono-code px-3 py-1.5 rounded-lg border border-white/10 bg-[#161b29] hover:border-[#e5b869]/40 transition-colors cursor-pointer"
                  >
                    Simulate: Deistic Optimistic Stoic
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyArchetypePreset([
                        'A', 'A', 'B', 'C', 'A', 'C', 'B', 'B', 'C', 'C', 'B', 'A', 'B', 'A', 'A', 'B'
                      ])
                    }
                    className="text-xs font-mono-code px-3 py-1.5 rounded-lg border border-white/10 bg-[#161b29] hover:border-[#e5b869]/40 transition-colors cursor-pointer"
                  >
                    Simulate: Absurdist Vitalist Rebel
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyArchetypePreset([
                        'C', 'C', 'B', 'A', 'C', 'C', 'B', 'B', 'A', 'B', 'A', 'C', 'C', 'B', 'C', 'C'
                      ])
                    }
                    className="text-xs font-mono-code px-3 py-1.5 rounded-lg border border-white/10 bg-[#161b29] hover:border-[#e5b869]/40 transition-colors cursor-pointer"
                  >
                    Simulate: Transhumanist Promethean
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyArchetypePreset([
                        'C', 'B', 'B', 'C', 'C', 'B', 'C', 'C', 'B', 'A', 'C', 'B', 'A', 'A', 'B', 'D'
                      ])
                    }
                    className="text-xs font-mono-code px-3 py-1.5 rounded-lg border border-white/10 bg-[#161b29] hover:border-[#e5b869]/40 transition-colors cursor-pointer"
                  >
                    Simulate: Oceanic Daoist Mystic
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <ConcentricRings ringMetrics={ringMetrics} />
            </div>
          </div>
        ) : isCompleted ? (
          /* FINAL RESULTS VIEW */
          <ResultsView
            result={compiledResult}
            ringMetrics={ringMetrics}
            onResetQuiz={handleResetQuiz}
            onOpenTelemetry={() => setIsTelemetryOpen(true)}
          />
        ) : (
          /* ACTIVE 24-HOUR QUIZ RUNNER VIEW */
          <div>
            <PillarTimeline
              currentStepIndex={currentStepIndex}
              answers={answers}
              onSelectStep={(idx) => {
                playAstrolabeTick();
                setCurrentStepIndex(idx);
              }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7">
                <ScenarioCard
                  scenario={currentScenario}
                  selectedOptionId={answers[currentScenario.id]}
                  onSelectOption={handleSelectOption}
                  onPrev={() => {
                    playAstrolabeTick();
                    setCurrentStepIndex((i) => Math.max(0, i - 1));
                  }}
                  onNext={() => {
                    playAstrolabeTick();
                    setCurrentStepIndex((i) => Math.min(SCENARIOS.length - 1, i + 1));
                  }}
                  canGoPrev={currentStepIndex > 0}
                  isLastStep={currentStepIndex === SCENARIOS.length - 1}
                  allAnswered={allAnswered}
                  onFinishQuiz={() => {
                    playManifestoComplete();
                    setIsCompleted(true);
                  }}
                />
              </div>

              <div className="lg:col-span-5 space-y-4">
                <ConcentricRings
                  ringMetrics={ringMetrics}
                  activeRingFocus={currentScenario.ringFocus}
                />

                {/* Live Evolving Sentence Draft Box */}
                <div className="rounded-2xl border border-[#e5b869]/20 bg-[#0f131d] p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono-code uppercase tracking-widest text-white/50">
                      Live Sentence Compiler Telemetry
                    </span>
                    <span className="text-[10px] font-mono-code text-[#e5b869]">
                      {Object.keys(answers).length === 0
                        ? 'Awaiting Signal'
                        : `${Math.round((Object.keys(answers).length / SCENARIOS.length) * 100)}% Calibrated`}
                    </span>
                  </div>
                  <p className="font-serif-philo text-lg italic leading-snug">
                    {Object.keys(answers).length === 0
                      ? 'Answer your first daily scenario to ignite the sentence compiler…'
                      : `“${compiledResult.fullSentence}”`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 45-Coordinate Telemetry Modal */}
      <TelemetryModal
        isOpen={isTelemetryOpen}
        onClose={() => setIsTelemetryOpen(false)}
        scoreMap={scoreMap}
      />
    </div>
  );
}
