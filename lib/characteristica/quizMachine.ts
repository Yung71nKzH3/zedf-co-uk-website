import { COORDINATES, COORDINATE_MAP } from "./coordinates";
import { SCENARIOS } from "./scenarios";
import {
  CoordinateId,
  CoordinateScoreMap,
  CoordinateTally,
  RingId,
  StancePole
} from "./schema";

export interface QuizState {
  currentStepIndex: number; // 0 to SCENARIOS.length - 1
  answers: Record<string, string>; // scenarioId -> optionId
  isCompleted: boolean;
}

export const INITIAL_QUIZ_STATE: QuizState = {
  currentStepIndex: 0,
  answers: {},
  isCompleted: false
};

export function computeCoordinateScores(
  answers: Record<string, string>
): CoordinateScoreMap {
  // Initialize tallies for all 45 coordinates
  const rawTallies: Record<CoordinateId, { A: number; B: number; C: number }> = {} as any;
  for (const coord of COORDINATES) {
    rawTallies[coord.id] = { A: 0, B: 0, C: 0 };
  }

  // Track global pole tendencies across Acts and Rings to break any 0-signal or tied coordinates intelligently
  const ringTendency: Record<RingId, { A: number; B: number; C: number }> = {
    "Ring 1: Internal Engine": { A: 0, B: 0, C: 0 },
    "Ring 2: Relational Orbit": { A: 0, B: 0, C: 0 },
    "Ring 3: Material & Agency": { A: 0, B: 0, C: 0 },
    "Ring 4: Cosmic Horizon": { A: 0, B: 0, C: 0 }
  };

  for (const scenario of SCENARIOS) {
    const selectedOptionId = answers[scenario.id];
    if (!selectedOptionId) continue;

    const option = scenario.options.find((o) => o.id === selectedOptionId);
    if (!option) continue;

    for (const delta of option.weights) {
      const target = rawTallies[delta.coordinateId];
      if (target) {
        target[delta.pole] += delta.weight;
        const coordDef = COORDINATE_MAP[delta.coordinateId];
        if (coordDef) {
          ringTendency[coordDef.ringUi][delta.pole] += delta.weight;
        }
      }
    }
  }

  const scoreMap: CoordinateScoreMap = {} as CoordinateScoreMap;

  for (const coord of COORDINATES) {
    const t = rawTallies[coord.id];
    const totalSignal = t.A + t.B + t.C;

    // Determine dominant pole; if tied, use the ring tendency as tie-breaker
    const ringBias = ringTendency[coord.ringUi];
    const scoreA = t.A * 100 + ringBias.A;
    const scoreB = t.B * 100 + ringBias.B;
    const scoreC = t.C * 100 + ringBias.C;

    let dominant: StancePole = "A";
    if (scoreB > scoreA && scoreB >= scoreC) {
      dominant = "B";
    } else if (scoreC > scoreA && scoreC > scoreB) {
      dominant = "C";
    }

    const activeDescriptor =
      dominant === "A"
        ? coord.stanceA.descriptor
        : dominant === "B"
        ? coord.stanceB.descriptor
        : coord.stanceC.descriptor;

    scoreMap[coord.id] = {
      A: t.A,
      B: t.B,
      C: t.C,
      dominant,
      activeDescriptor,
      totalSignal
    };
  }

  return scoreMap;
}

export interface LiveRingMetrics {
  ringId: RingId;
  shortLabel: string;
  answeredCoordinates: number;
  totalCoordinates: number;
  progressRatio: number; // 0..1
  poleDistribution: { A: number; B: number; C: number };
  activeNodes: {
    id: CoordinateId;
    dimension: string;
    descriptor: string;
    pole: StancePole;
    isIlluminated: boolean;
    signal: number;
  }[];
}

export const RING_ORDER: RingId[] = [
  "Ring 1: Internal Engine",
  "Ring 2: Relational Orbit",
  "Ring 3: Material & Agency",
  "Ring 4: Cosmic Horizon"
];

export const RING_SHORT_LABELS: Record<RingId, string> = {
  "Ring 1: Internal Engine": "Internal Engine",
  "Ring 2: Relational Orbit": "Relational Orbit",
  "Ring 3: Material & Agency": "Material & Agency",
  "Ring 4: Cosmic Horizon": "Cosmic Horizon"
};

export function computeLiveRingMetrics(
  answers: Record<string, string>
): Record<RingId, LiveRingMetrics> {
  const scoreMap = computeCoordinateScores(answers);
  const result: Record<RingId, LiveRingMetrics> = {} as any;

  for (const ringId of RING_ORDER) {
    const ringCoords = COORDINATES.filter((c) => c.ringUi === ringId);
    let answeredCount = 0;
    const poleDist = { A: 0, B: 0, C: 0 };

    const activeNodes = ringCoords.map((c) => {
      const tally: CoordinateTally = scoreMap[c.id];
      const isIlluminated = tally.totalSignal > 0;
      if (isIlluminated) {
        answeredCount += 1;
        poleDist[tally.dominant] += 1;
      }
      return {
        id: c.id,
        dimension: c.coreDimension,
        descriptor: tally.activeDescriptor,
        pole: tally.dominant,
        isIlluminated,
        signal: tally.totalSignal
      };
    });

    result[ringId] = {
      ringId,
      shortLabel: RING_SHORT_LABELS[ringId],
      answeredCoordinates: answeredCount,
      totalCoordinates: ringCoords.length,
      progressRatio: ringCoords.length > 0 ? answeredCount / ringCoords.length : 0,
      poleDistribution: poleDist,
      activeNodes
    };
  }

  return result;
}

