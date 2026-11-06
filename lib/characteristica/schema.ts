export type CoordinateId =
  | 'B01' | 'B02' | 'B03' | 'B04' | 'B05' | 'B06' | 'B07' | 'B08' | 'B09' | 'B10' | 'B11' | 'B12' | 'B13' | 'B14' | 'B15'
  | 'L01' | 'L02' | 'L03' | 'L04' | 'L05' | 'L06' | 'L07' | 'L08' | 'L09' | 'L10' | 'L11' | 'L12' | 'L13' | 'L14' | 'L15'
  | 'D01' | 'D02' | 'D03' | 'D04' | 'D05' | 'D06' | 'D07' | 'D08' | 'D09' | 'D10' | 'D11' | 'D12' | 'D13' | 'D14' | 'D15';

export type ActType = 'BORN' | 'LIVE' | 'DIE';

export type InterrogativeType = 'WHAT' | 'HOW' | 'WHY' | 'WHEN' | 'WHERE';

export type TriadLayer = 'Container' | 'Bridge' | 'Vessel';

export type RingId =
  | 'Ring 1: Internal Engine'
  | 'Ring 2: Relational Orbit'
  | 'Ring 3: Material & Agency'
  | 'Ring 4: Cosmic Horizon';

export type DailyPillar =
  | 'Needs'
  | 'Luxuries/Wants'
  | 'Responsibilities'
  | 'Emotions'
  | 'Ability';

export type StancePole = 'A' | 'B' | 'C';

export interface StanceDetail {
  pole: StancePole;
  title: string;
  description: string;
  descriptor: string;
}

export interface CoordinateDefinition {
  id: CoordinateId;
  act: ActType;
  interrogative: InterrogativeType;
  triadLayer: TriadLayer;
  ringUi: RingId;
  dailyPillar: DailyPillar;
  coreDimension: string;
  stanceA: StanceDetail;
  stanceB: StanceDetail;
  stanceC: StanceDetail;
  philosophicalTraditions: string[];
}

export interface CoordinateWeightDelta {
  coordinateId: CoordinateId;
  pole: StancePole;
  weight: number;
}

export interface ScenarioOption {
  id: string;
  key: 'A' | 'B' | 'C' | 'D';
  stanceTag: string;
  narrativeText: string;
  philosophicalSubtext: string;
  weights: CoordinateWeightDelta[];
}

export interface ScenarioQuestion {
  id: string;
  stepNumber: number;
  timeOfDay: string;
  act: ActType;
  pillar: DailyPillar;
  ringFocus: RingId;
  title: string;
  sceneContext: string;
  prompt: string;
  philosophicalDomain: string;
  options: ScenarioOption[];
}

export interface CoordinateTally {
  A: number;
  B: number;
  C: number;
  dominant: StancePole;
  activeDescriptor: string;
  totalSignal: number;
}

export type CoordinateScoreMap = Record<CoordinateId, CoordinateTally>;

export interface HistoricalThinker {
  name: string;
  era: string;
  tradition: string;
  quote: string;
  resonanceReason: string;
}

export interface ExistentialShadow {
  title: string;
  blindSpot: string;
  psychologicalRisk: string;
  philosophicalAntidote: string;
}

export interface PhilosophicalArchetype {
  id: string;
  name: string;
  latinTitle: string;
  tagline: string;
  description: string;
  kin: HistoricalThinker[];
  rival: HistoricalThinker;
  shadow: ExistentialShadow;
}

export interface RingSummary {
  ringId: RingId;
  shortName: string;
  subtitle: string;
  activationScore: number; // 0 to 100
  dominantPoleRatio: { A: number; B: number; C: number };
  dominantDescriptors: string[];
  synthesisParagraph: string;
  coordinates: {
    id: CoordinateId;
    dimension: string;
    descriptor: string;
    pole: StancePole;
    signal: number;
  }[];
}

export interface TriadMovement {
  origin: {
    label: string;
    act: 'BORN';
    sentence: string;
    anchorCoords: CoordinateId[];
  };
  conduct: {
    label: string;
    act: 'LIVE';
    sentence: string;
    anchorCoords: CoordinateId[];
  };
  horizon: {
    label: string;
    act: 'DIE';
    sentence: string;
    anchorCoords: CoordinateId[];
  };
}

export interface LivingAxiom {
  id: string;
  numeral: 'I' | 'II' | 'III';
  domain: string;
  title: string;
  maxim: string;
  dailyPractice: string;
  anchorCoordinates: CoordinateId[];
}

export interface ArchetypeAffinityPoint {
  id: string;
  name: string;
  shortLabel: string;
  latinTitle: string;
  affinityPct: number;
  rawScore: number;
  isPrimary: boolean;
  isSecondary: boolean;
}

export interface PhilosophicalSentenceResult {
  fullSentence: string;
  parts: {
    article: string;
    disposition: string;
    epistemology: string;
    ethicsNoun: string;
    teleologyVerbPhrase: string;
    horizonAnchor: string;
  };
  triadMovement: TriadMovement;
  livingAxioms: LivingAxiom[];
  archetype: PhilosophicalArchetype;
  secondaryArchetype: PhilosophicalArchetype;
  archetypeConstellation: ArchetypeAffinityPoint[];
  ringSummaries: Record<RingId, RingSummary>;
  actSummaries: Record<ActType, {
    act: ActType;
    title: string;
    subtitle: string;
    synthesis: string;
    topDescriptors: string[];
  }>;
  triadSummaries: Record<TriadLayer, {
    layer: TriadLayer;
    subtitle: string;
    synthesis: string;
    dominantDescriptors: string[];
  }>;
  scoreMap: CoordinateScoreMap;
}

