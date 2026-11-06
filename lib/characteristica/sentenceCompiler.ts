import { ARCHETYPES } from "../data/archetypes";
import { COORDINATES } from "../data/coordinates";
import { computeCoordinateScores, RING_ORDER } from "./quizMachine";
import {
  ActType,
  ArchetypeAffinityPoint,
  CoordinateScoreMap,
  LivingAxiom,
  PhilosophicalArchetype,
  PhilosophicalSentenceResult,
  RingId,
  RingSummary,
  TriadLayer,
  TriadMovement
} from "../types/schema";

function startsWithVowelSound(word: string): boolean {
  const clean = word.trim().toLowerCase();
  if (clean.startsWith("uni") || clean.startsWith("eu")) return false;
  return /^[aeiou]/.test(clean);
}

export function compilePhilosophicalSentence(
  answers: Record<string, string>
): PhilosophicalSentenceResult {
  const scoreMap: CoordinateScoreMap = computeCoordinateScores(answers);

  // 1. Epistemology / Reality Slot (Derived from B01, B06, L01, L04, L05)
  const b01 = scoreMap.B01.dominant; // A: Physicalist, B: Deistic, C: Simulational
  const b06 = scoreMap.B06.dominant; // A: Material Monist, B: Dualist, C: Panpsychist
  const l05 = scoreMap.L05.dominant; // A: Empiricist, B: Rationalist, C: Pragmatist
  const l01 = scoreMap.L01.dominant; // A: Realist, B: Idealist, C: Instrumentalist

  let epistemology = "Physicalist";
  if (b01 === "B" && b06 === "B") {
    epistemology = "Deistic";
  } else if (b01 === "B" && l05 === "B") {
    epistemology = "Deistic, Rationalist";
  } else if (b01 === "C") {
    epistemology = l05 === "A" ? "Simulational, Empiricist" : "Simulational";
  } else if (b06 === "C") {
    epistemology = l01 === "B" ? "Panpsychist, Idealist" : "Panpsychist";
  } else if (b01 === "A" && l05 === "A") {
    epistemology = "Empirical Physicalist";
  } else if (l05 === "B") {
    epistemology = "Axiomatic Rationalist";
  } else if (l05 === "C") {
    epistemology = "Pragmatic Realist";
  } else if (b01 === "B") {
    epistemology = "Deistic";
  }

  // 2. Disposition / Temperament Slot (Derived from D05, L07, L12, L06)
  const d05 = scoreMap.D05.dominant; // A: Amor Fati, B: Defiant Fighter, C: Epicurean Neutral
  const l07 = scoreMap.L07.dominant; // A: Absurdist, B: Nihilist, C: Teleological
  const l12 = scoreMap.L12.dominant; // A: Mindful Presentist, B: Futuristic Meliorist, C: Traditionalist

  let disposition = "Optimistic";
  if (d05 === "A" && l07 === "C") {
    disposition = "Optimistic";
  } else if (d05 === "A" && l07 === "A") {
    disposition = "Tragic-Optimistic";
  } else if (d05 === "B" && l07 === "A") {
    disposition = "Defiant, Vitalist";
  } else if (d05 === "B" && l12 === "B") {
    disposition = "Promethean, Melioristic";
  } else if (d05 === "C" && l12 === "A") {
    disposition = "Serene, Presentist";
  } else if (l07 === "B") {
    disposition = "Lucid, Unflinching";
  } else if (l12 === "B") {
    disposition = "Forward-Looking";
  } else if (d05 === "A") {
    disposition = "Equanimous";
  }

  // 3. Ethics / Conduct Noun Slot (Derived from L02, L03, L08, L14)
  const l03 = scoreMap.L03.dominant; // A: Stoic, B: Epicurean, C: Eudaimonic
  const l02 = scoreMap.L02.dominant; // A: Virtue Ethicist, B: Deontologist, C: Utilitarian
  const l14 = scoreMap.L14.dominant; // A: Parochial, B: Cosmopolitan, C: Sentientist
  const l11 = scoreMap.L11.dominant; // A: Long-Horizon, B: Agile, C: Rhythmic Harmonizer (Wu-Wei)

  let ethicsNoun = "Stoic";
  if (l03 === "A" && l02 === "A") {
    ethicsNoun = "Stoic";
  } else if (l03 === "A" && l02 === "B") {
    ethicsNoun = "Cosmopolitan Stoic";
  } else if (l02 === "B" && l14 === "B") {
    ethicsNoun = "Kantian Constitutionalist";
  } else if (l02 === "C" && l14 === "C") {
    ethicsNoun = "Sentientist Humanist";
  } else if (l02 === "C") {
    ethicsNoun = "Utilitarian Architect";
  } else if (l03 === "B" && l11 === "C") {
    ethicsNoun = "Daoist Harmonist";
  } else if (l03 === "B") {
    ethicsNoun = "Lucid Epicurean";
  } else if (l03 === "C" && l02 === "A") {
    ethicsNoun = "Eudaimonic Artisan";
  } else if (l03 === "C") {
    ethicsNoun = "Existential Vitalist";
  }

  // 4. Meaning / Teleology Verb Phrase (Derived from B08, B09, L09, D02)
  const b08 = scoreMap.B08.dominant; // A: Entropic, B: Noospheric, C: Autopoietic
  const b09 = scoreMap.B09.dominant; // A: Stochastic, B: Teleological, C: Existential
  const l09 = scoreMap.L09.dominant; // A: Defiantly Rebellious, B: Self-Authored, C: Altruistic
  const d02 = scoreMap.D02.dominant; // A: Monument Builder, B: Relational Memorialist, C: Tranquil Ephemeralist

  let teleologyVerbPhrase = "forging conscious order";
  if (b08 === "C" && b09 === "C") {
    teleologyVerbPhrase = "forging conscious order";
  } else if (l09 === "A" && b09 === "A") {
    teleologyVerbPhrase = "kindling defiant joy and self-authored meaning";
  } else if (l09 === "C" && d02 === "B") {
    teleologyVerbPhrase = "weaving enduring ripples of relational care";
  } else if (b08 === "B" && d02 === "A") {
    teleologyVerbPhrase = "architecting monuments of awakening intelligence";
  } else if (l09 === "B" && d02 === "A") {
    teleologyVerbPhrase = "sculpting authentic essence and lasting craft";
  } else if (d02 === "C") {
    teleologyVerbPhrase = "inhabiting the luminous grace of the passing hour";
  } else if (b09 === "B") {
    teleologyVerbPhrase = "fulfilling an unwritten teleological mandate";
  }

  // 5. Horizon Anchor (Derived from D01, D06, D10, D13, D15)
  const d01 = scoreMap.D01.dominant; // A: Entropic Dissolutionist, B: Biogeochemical Recycler, C: Quantum Informationalist
  const d06 = scoreMap.D06.dominant; // A: Bioconservative, B: Transhumanist, C: Posthumanist
  const d15 = scoreMap.D15.dominant; // A: Oblivionist, B: Oceanic Non-Dualist, C: Transmigrator

  let horizonAnchor = "from thermodynamic chaos";
  if (d01 === "A" && d15 === "A") {
    horizonAnchor = "from thermodynamic chaos before the quiet curtain of oblivion";
  } else if (d06 === "B" || d06 === "C") {
    horizonAnchor = "toward a post-biological cosmic horizon";
  } else if (d15 === "B") {
    horizonAnchor = "within the unbroken ocean of non-dual consciousness";
  } else if (d01 === "B" && d06 === "A") {
    horizonAnchor = "across the living biosphere's eternal cycle of renewal";
  } else if (d01 === "C") {
    horizonAnchor = "within the indestructible fabric of quantum information";
  } else {
    horizonAnchor = "from thermodynamic chaos";
  }

  const firstWord = epistemology.split(/[\s,]+/)[0];
  const article = startsWithVowelSound(firstWord) ? "An" : "A";

  const fullSentence = `${article} ${epistemology}, ${disposition} ${ethicsNoun} ${teleologyVerbPhrase} ${horizonAnchor}.`;

  // Select Dominant, Secondary & Full 8-Archetype Constellation
  const { primary, secondary, constellation } = evaluateArchetypeConstellation(scoreMap);

  // Build Tier 2: The Triad Movement (3 Rhythmic Sentences for Origin, Conduct, Horizon)
  const triadMovement = buildTriadMovement(scoreMap);

  // Build Tier 3: The 3 Living Axioms (Actionable Daily Maxims)
  const livingAxioms = buildLivingAxioms(scoreMap);

  // Build 4 Ring Summaries
  const ringSummaries = buildRingSummaries(scoreMap);

  // Build 3 Act Summaries
  const actSummaries = buildActSummaries(scoreMap);

  // Build 3 Triad Summaries
  const triadSummaries = buildTriadSummaries(scoreMap);

  return {
    fullSentence,
    parts: {
      article,
      disposition,
      epistemology,
      ethicsNoun,
      teleologyVerbPhrase,
      horizonAnchor
    },
    triadMovement,
    livingAxioms,
    archetype: primary,
    secondaryArchetype: secondary,
    archetypeConstellation: constellation,
    ringSummaries,
    actSummaries,
    triadSummaries,
    scoreMap
  };
}

function evaluateArchetypeConstellation(scoreMap: CoordinateScoreMap): {
  primary: PhilosophicalArchetype;
  secondary: PhilosophicalArchetype;
  constellation: ArchetypeAffinityPoint[];
} {
  const scores: Record<string, number> = {
    sovereign_stoic: 2,
    absurdist_rebel: 2,
    promethean_architect: 2,
    oceanic_mystic: 2,
    kantian_legislator: 2,
    existential_artisan: 2,
    epicurean_cartographer: 2,
    relational_steward: 2
  };

  // Primary signature anchors (weight 3 & 2) + secondary coordinate resonances (weight 1)
  if (scoreMap.L03.dominant === "A") scores.sovereign_stoic += 3;
  if (scoreMap.L15.dominant === "A") scores.sovereign_stoic += 3;
  if (scoreMap.D05.dominant === "A") scores.sovereign_stoic += 2;
  if (scoreMap.B04.dominant === "A") scores.sovereign_stoic += 2;
  if (scoreMap.L02.dominant === "A") scores.sovereign_stoic += 1.5;
  if (scoreMap.D12.dominant === "B") scores.sovereign_stoic += 1.5;

  if (scoreMap.L07.dominant === "A") scores.absurdist_rebel += 3;
  if (scoreMap.L09.dominant === "A") scores.absurdist_rebel += 3;
  if (scoreMap.D05.dominant === "B") scores.absurdist_rebel += 2;
  if (scoreMap.D08.dominant === "B") scores.absurdist_rebel += 2;
  if (scoreMap.B09.dominant === "A") scores.absurdist_rebel += 1.5;
  if (scoreMap.L06.dominant === "C") scores.absurdist_rebel += 1.5;

  if (scoreMap.L13.dominant === "A") scores.promethean_architect += 3;
  if (scoreMap.D06.dominant === "B" || scoreMap.D06.dominant === "C") scores.promethean_architect += 3;
  if (scoreMap.L05.dominant === "A") scores.promethean_architect += 2;
  if (scoreMap.L12.dominant === "B") scores.promethean_architect += 2;
  if (scoreMap.D04.dominant === "C") scores.promethean_architect += 1.5;
  if (scoreMap.D10.dominant === "B") scores.promethean_architect += 1.5;

  if (scoreMap.B06.dominant === "C") scores.oceanic_mystic += 3;
  if (scoreMap.L11.dominant === "C") scores.oceanic_mystic += 3;
  if (scoreMap.D15.dominant === "B") scores.oceanic_mystic += 3;
  if (scoreMap.L13.dominant === "B") scores.oceanic_mystic += 2;
  if (scoreMap.L01.dominant === "B") scores.oceanic_mystic += 1.5;
  if (scoreMap.D09.dominant === "C") scores.oceanic_mystic += 1.5;

  if (scoreMap.L02.dominant === "B") scores.kantian_legislator += 3;
  if (scoreMap.L08.dominant === "A") scores.kantian_legislator += 3;
  if (scoreMap.L14.dominant === "B") scores.kantian_legislator += 2;
  if (scoreMap.B11.dominant === "C") scores.kantian_legislator += 2;
  if (scoreMap.L05.dominant === "B") scores.kantian_legislator += 1.5;
  if (scoreMap.L04.dominant === "A") scores.kantian_legislator += 1.5;

  if (scoreMap.B09.dominant === "C") scores.existential_artisan += 3;
  if (scoreMap.L15.dominant === "C") scores.existential_artisan += 3;
  if (scoreMap.L09.dominant === "B") scores.existential_artisan += 2;
  if (scoreMap.D09.dominant === "A") scores.existential_artisan += 2;
  if (scoreMap.B14.dominant === "C") scores.existential_artisan += 1.5;
  if (scoreMap.D02.dominant === "A") scores.existential_artisan += 1.5;

  if (scoreMap.L03.dominant === "B") scores.epicurean_cartographer += 3;
  if (scoreMap.D02.dominant === "C") scores.epicurean_cartographer += 3;
  if (scoreMap.D05.dominant === "C") scores.epicurean_cartographer += 2;
  if (scoreMap.D15.dominant === "A") scores.epicurean_cartographer += 2;
  if (scoreMap.L12.dominant === "A") scores.epicurean_cartographer += 1.5;
  if (scoreMap.D08.dominant === "C") scores.epicurean_cartographer += 1.5;

  if (scoreMap.L09.dominant === "C") scores.relational_steward += 3;
  if (scoreMap.D02.dominant === "B") scores.relational_steward += 3;
  if (scoreMap.L08.dominant === "B") scores.relational_steward += 2;
  if (scoreMap.L14.dominant === "C") scores.relational_steward += 2;
  if (scoreMap.B11.dominant === "B") scores.relational_steward += 1.5;
  if (scoreMap.D01.dominant === "B") scores.relational_steward += 1.5;

  const shortLabels: Record<string, string> = {
    sovereign_stoic: "Stoic",
    absurdist_rebel: "Rebel",
    promethean_architect: "Promethean",
    oceanic_mystic: "Mystic",
    kantian_legislator: "Legislator",
    existential_artisan: "Artisan",
    epicurean_cartographer: "Epicurean",
    relational_steward: "Steward"
  };

  const orderedKeys = Object.keys(scores);
  const sortedKeys = [...orderedKeys].sort((a, b) => scores[b] - scores[a]);
  const primaryKey = sortedKeys[0];
  const secondaryKey = sortedKeys[1] ?? sortedKeys[0];
  const maxTheoretical = 15;

  const constellation: ArchetypeAffinityPoint[] = orderedKeys.map((key) => {
    const raw = scores[key];
    const pct = Math.min(98, Math.max(18, Math.round((raw / maxTheoretical) * 96)));
    const arch = ARCHETYPES[key];
    return {
      id: key,
      name: arch.name,
      shortLabel: shortLabels[key] ?? arch.name,
      latinTitle: arch.latinTitle,
      affinityPct: pct,
      rawScore: raw,
      isPrimary: key === primaryKey,
      isSecondary: key === secondaryKey
    };
  });

  return {
    primary: ARCHETYPES[primaryKey],
    secondary: ARCHETYPES[secondaryKey],
    constellation
  };
}

function buildTriadMovement(scoreMap: CoordinateScoreMap): TriadMovement {
  // I. ORIGIN (BORN: B01, B03, B06, B09, B14)
  const b01 = scoreMap.B01.dominant;
  const b06 = scoreMap.B06.dominant;
  const b09 = scoreMap.B09.dominant;

  const originOpening =
    b01 === "A"
      ? "Emerging from a silent physicalist vacuum of matter and natural law"
      : b01 === "B"
      ? "Awakening within a cosmos calibrated with teleological elegance"
      : "Booting inside an informational substrate of boundless branch possibilities";

  const originSelf =
    b06 === "A"
      ? "your consciousness ignites from neural complexity"
      : b06 === "B"
      ? "your witnessing awareness steps into the biological vessel"
      : "your mind tunes into a universal field of awareness";

  const originMandate =
    b09 === "A"
      ? "turning an unscripted biological lottery into deliberate agency."
      : b09 === "B"
      ? "answering an unspoken calling woven into your entry."
      : "claiming an open existential canvas for self-forged authorship.";

  // II. CONDUCT (LIVE: L02, L03, L05, L09, L15)
  const l05 = scoreMap.L05.dominant;
  const l02 = scoreMap.L02.dominant;
  const l03 = scoreMap.L03.dominant;

  const conductTruth =
    l05 === "A"
      ? "Testing every claim against hard empirical evidence"
      : l05 === "B"
      ? "Guided by axiomatic reason and logical coherence"
      : "Validating truth through pragmatic lived utility";

  const conductEthics =
    l02 === "A"
      ? "you cultivate unshakeable character virtue"
      : l02 === "B"
      ? "you uphold universal moral duty without exception"
      : "you architect outcomes that minimize suffering for sentient life";

  const conductFlourishing =
    l03 === "A"
      ? "while fortifying the Stoic citadel of inner sovereignty."
      : l03 === "B"
      ? "while savoring the lucid stillness of the Epicurean garden."
      : "while pouring full-blooded passion into eudaimonic mastery.";

  // III. HORIZON (DIE: D01, D02, D05, D06, D15)
  const d05 = scoreMap.D05.dominant;
  const d02 = scoreMap.D02.dominant;
  const d15 = scoreMap.D15.dominant;

  const horizonPosture =
    d05 === "A"
      ? "Embracing mortality with Amor Fati gratitude"
      : d05 === "B"
      ? "Standing in defiant Promethean revolt against entropy"
      : "Meeting finitude with serene Epicurean composure";

  const horizonLegacy =
    d02 === "A"
      ? "you carve enduring monuments of craft and intellect"
      : d02 === "B"
      ? "you plant invisible seeds of kindness in the lives you touch"
      : "you inhabit the luminous sufficiency of the passing hour";

  const horizonFinality =
    d15 === "A"
      ? "before returning peacefully to dreamless rest."
      : d15 === "B"
      ? "as the separate ego dissolves back into the non-dual ocean."
      : "as the pattern of awareness crosses into a new horizon of becoming.";

  return {
    origin: {
      label: "I. Movement of Origin (Act I · Born)",
      act: "BORN",
      sentence: `${originOpening}, ${originSelf}, ${originMandate}`,
      anchorCoords: ["B01", "B06", "B09", "B14"]
    },
    conduct: {
      label: "II. Movement of Conduct (Act II · Live)",
      act: "LIVE",
      sentence: `${conductTruth}, ${conductEthics} ${conductFlourishing}`,
      anchorCoords: ["L02", "L03", "L05", "L15"]
    },
    horizon: {
      label: "III. Movement of Horizon (Act III · Die)",
      act: "DIE",
      sentence: `${horizonPosture}, ${horizonLegacy} ${horizonFinality}`,
      anchorCoords: ["D02", "D05", "D06", "D15"]
    }
  };
}

function buildLivingAxioms(scoreMap: CoordinateScoreMap): LivingAxiom[] {
  // Axiom I: Internal Engine (L03, L15, D05)
  const l03 = scoreMap.L03.dominant;
  const axiom1: LivingAxiom =
    l03 === "A"
      ? {
          id: "axiom_citadel",
          numeral: "I",
          domain: "Ring I · Inner Sovereignty",
          title: "The Rule of the Dichotomy",
          maxim: "Surrender demand over external fortune; guard absolute sovereignty over your own judgment.",
          dailyPractice:
            "When friction strikes today, separate the raw external event from your narrative story about it within three breaths.",
          anchorCoordinates: ["L03", "L15", "D05"]
        }
      : l03 === "B"
      ? {
          id: "axiom_garden",
          numeral: "I",
          domain: "Ring I · Lucid Sufficiency",
          title: "The Principle of Subtractive Peace",
          maxim: "Wealth consists not in having great possessions, but in having few restless cravings.",
          dailyPractice:
            "Identify one manufactured status anxiety today and consciously release it in favor of unhurried sensory presence.",
          anchorCoordinates: ["L03", "L12", "D05"]
        }
      : {
          id: "axiom_forge",
          numeral: "I",
          domain: "Ring I · Vitalist Authorship",
          title: "The Imperative of Alchemical Tension",
          maxim: "Do not wish for a frictionless life; demand the strength to transmute every obstacle into fuel.",
          dailyPractice:
            "Lean deliberately into your most meaningful creative challenge today before checking passive distractions.",
          anchorCoordinates: ["L03", "B09", "L09"]
        };

  // Axiom II: Relational Orbit (L02, L08, L14)
  const l02 = scoreMap.L02.dominant;
  const axiom2: LivingAxiom =
    l02 === "A"
      ? {
          id: "axiom_virtue",
          numeral: "II",
          domain: "Ring II · Relational Ethics",
          title: "The Standard of Structural Character",
          maxim: "Act in private exactly as you would if your choices were etched into the foundation of the city.",
          dailyPractice:
            "Choose the harder, honest word over convenient flattery in at least one interaction today.",
          anchorCoordinates: ["L02", "L08", "B11"]
        }
      : l02 === "B"
      ? {
          id: "axiom_categorical",
          numeral: "II",
          domain: "Ring II · Universal Dignity",
          title: "The Categorical Sanctuary",
          maxim: "Treat every conscious mind never merely as an instrument of your schedule, but always as an end in itself.",
          dailyPractice:
            "Give undivided, non-transactional attention to someone today who cannot advance your ambitions.",
          anchorCoordinates: ["L02", "L14", "B11"]
        }
      : {
          id: "axiom_compassion",
          numeral: "II",
          domain: "Ring II · Sentient Stewardship",
          title: "The Calculus of Reduced Suffering",
          maxim: "Measure the worth of your principles by the tangible relief and flourishing they bring to living beings.",
          dailyPractice:
            "Take one concrete action today that measurably lightens another person's cognitive or material load.",
          anchorCoordinates: ["L02", "L14", "L09"]
        };

  // Axiom III: Material Agency & Cosmic Horizon (L05, D02, D08)
  const d02 = scoreMap.D02.dominant;
  const axiom3: LivingAxiom =
    d02 === "A"
      ? {
          id: "axiom_craft",
          numeral: "III",
          domain: "Ring III & IV · Craft & Finitude",
          title: "The Cathedral Builder's Vow",
          maxim: "Build artefacts of truth and order that outlast the brief thermodynamic flare of your own body.",
          dailyPractice:
            "Dedicate your sharpest hour today to deep, uncompromising craft that will compound in value over years.",
          anchorCoordinates: ["D02", "L05", "B08"]
        }
      : d02 === "B"
      ? {
          id: "axiom_ripples",
          numeral: "III",
          domain: "Ring III & IV · Relational Legacy",
          title: "The Law of Invisible Ripples",
          maxim: "Monuments crumble into dust, but courage and tenderness echo silently across generations.",
          dailyPractice:
            "Transmit a piece of hard-won wisdom, encouragement, or care to someone in your orbit before nightfall.",
          anchorCoordinates: ["D02", "L08", "D08"]
        }
      : {
          id: "axiom_ephemeral",
          numeral: "III",
          domain: "Ring III & IV · Horizon Grace",
          title: "The Theorem of Luminous Impermanence",
          maxim: "A song does not exist to reach its final note; the meaning of existence blooms inside the cadence of now.",
          dailyPractice:
            "Step outside tonight, look up at the stars, and let go of the need to immortalize your ego.",
          anchorCoordinates: ["D02", "D12", "D15"]
        };

  return [axiom1, axiom2, axiom3];
}

function buildRingSummaries(
  scoreMap: CoordinateScoreMap
): Record<RingId, RingSummary> {
  const metadata: Record<RingId, { shortName: string; subtitle: string }> = {
    "Ring 1: Internal Engine": {
      shortName: "Ring I · Internal Engine",
      subtitle: "Phenomenology, Emotion, Selfhood & Aesthetic Texture"
    },
    "Ring 2: Relational Orbit": {
      shortName: "Ring II · Relational Orbit",
      subtitle: "Normative Ethics, Kinship, Loyalty Radius & The Other"
    },
    "Ring 3: Material & Agency": {
      shortName: "Ring III · Material & Agency",
      subtitle: "Free Will, Epistemic Verification, Craft & Technology"
    },
    "Ring 4: Cosmic Horizon": {
      shortName: "Ring IV · Cosmic Horizon",
      subtitle: "First Cause, Thermodynamics, Deep Time & Mortality"
    }
  };

  const out: Record<RingId, RingSummary> = {} as any;

  for (const ringId of RING_ORDER) {
    const coords = COORDINATES.filter((c) => c.ringUi === ringId);
    const poleCounts = { A: 0, B: 0, C: 0 };
    let totalSignal = 0;

    const coordItems = coords.map((c) => {
      const tally = scoreMap[c.id];
      poleCounts[tally.dominant] += 1;
      totalSignal += tally.totalSignal;
      return {
        id: c.id,
        dimension: c.coreDimension,
        descriptor: tally.activeDescriptor,
        pole: tally.dominant,
        signal: tally.totalSignal
      };
    });

    const total = coords.length || 1;
    const dominantDescriptors = coordItems.slice(0, 5).map((i) => i.descriptor);

    // Compute balanced activation score (65 to 98 range based on coherence and signal)
    const maxPole = Math.max(poleCounts.A, poleCounts.B, poleCounts.C);
    const coherenceBonus = Math.round((maxPole / total) * 28);
    const signalBonus = Math.min(12, Math.round(totalSignal / 2));
    const activationScore = Math.min(99, 60 + coherenceBonus + signalBonus);

    let synthesisParagraph = "";
    if (ringId === "Ring 1: Internal Engine") {
      synthesisParagraph = `Your inner theatre operates as a ${scoreMap.B06.activeDescriptor.toLowerCase()} vessel anchored in ${scoreMap.L03.activeDescriptor.toLowerCase()} equipoise. When confronted with mortality and scarcity, you adopt the posture of a ${scoreMap.D05.activeDescriptor.toLowerCase()}—measuring life's completeness as a ${scoreMap.D12.activeDescriptor.toLowerCase()}.`;
    } else if (ringId === "Ring 2: Relational Orbit") {
      synthesisParagraph = `Across the space between minds, your moral engine runs on ${scoreMap.L02.activeDescriptor.toLowerCase()} principles within a ${scoreMap.L08.activeDescriptor.toLowerCase()} social covenant. You extend moral enfranchisement on ${scoreMap.B11.activeDescriptor.toLowerCase()} grounds across a ${scoreMap.L14.activeDescriptor.toLowerCase()} radius, leaving behind the legacy of a ${scoreMap.D02.activeDescriptor.toLowerCase()}.`;
    } else if (ringId === "Ring 3: Material & Agency") {
      synthesisParagraph = `Pushing back against physical friction, you verify truth as a ${scoreMap.L05.activeDescriptor.toLowerCase()} and move with the tactical rhythm of a ${scoreMap.L11.activeDescriptor.toLowerCase()}. Ecologically ${scoreMap.L13.activeDescriptor.toLowerCase()}, you face the technological future as a ${scoreMap.D06.activeDescriptor.toLowerCase()}.`;
    } else {
      synthesisParagraph = `Staring into the deep background, you read the pre-life baseline as ${scoreMap.B01.activeDescriptor.toLowerCase()} within a ${scoreMap.B10.activeDescriptor.toLowerCase()} spacetime architecture. At the far horizon of time, you meet universal finality as a ${scoreMap.D10.activeDescriptor.toLowerCase()} and material dissolution as a ${scoreMap.D01.activeDescriptor.toLowerCase()}.`;
    }

    out[ringId] = {
      ringId,
      shortName: metadata[ringId].shortName,
      subtitle: metadata[ringId].subtitle,
      activationScore,
      dominantPoleRatio: {
        A: Math.round((poleCounts.A / total) * 100),
        B: Math.round((poleCounts.B / total) * 100),
        C: Math.round((poleCounts.C / total) * 100)
      },
      dominantDescriptors,
      synthesisParagraph,
      coordinates: coordItems
    };
  }

  return out;
}

function buildActSummaries(scoreMap: CoordinateScoreMap): PhilosophicalSentenceResult["actSummaries"] {
  const getTop = (act: ActType) =>
    COORDINATES.filter((c) => c.act === act)
      .map((c) => scoreMap[c.id].activeDescriptor)
      .slice(0, 5);

  return {
    BORN: {
      act: "BORN",
      title: "Act I · The Threshold (Origin & Thrownness)",
      subtitle: "B01–B15 · How consciousness crosses from non-existence into being",
      synthesis: `You understand your entry into reality through a ${scoreMap.B01.activeDescriptor.toLowerCase()} cosmos ignited by a ${scoreMap.B02.activeDescriptor.toLowerCase()} spark. Arriving as a ${scoreMap.B03.activeDescriptor.toLowerCase()} entity under ${scoreMap.B04.activeDescriptor.toLowerCase()} physical laws, your purpose of entry is fundamentally ${scoreMap.B09.activeDescriptor.toLowerCase()}.`,
      topDescriptors: getTop("BORN")
    },
    LIVE: {
      act: "LIVE",
      title: "Act II · The Labyrinth (Praxis, Truth & Agency)",
      subtitle: "L01–L15 · How you navigate truth, ethics, craft, and daily friction",
      synthesis: `Within the labyrinth of waking life, you interpret reality as a ${scoreMap.L01.activeDescriptor.toLowerCase()} and verify claims as an ${scoreMap.L05.activeDescriptor.toLowerCase()}. Guided by a ${scoreMap.L02.activeDescriptor.toLowerCase()} moral compass and ${scoreMap.L03.activeDescriptor.toLowerCase()} vision of the good life, you act as a ${scoreMap.L15.activeDescriptor.toLowerCase()}.`,
      topDescriptors: getTop("LIVE")
    },
    DIE: {
      act: "DIE",
      title: "Act III · The Horizon (Finitude, Legacy & Closure)",
      subtitle: "D01–D15 · How you confront scarcity, entropy, and the final curtain",
      synthesis: `Approaching the horizon of finitude, you stand as a ${scoreMap.D08.activeDescriptor.toLowerCase()} and ${scoreMap.D05.activeDescriptor.toLowerCase()}. You view the biological boundary as a ${scoreMap.D04.activeDescriptor.toLowerCase()} and envision the observer's ultimate destination as an ${scoreMap.D15.activeDescriptor.toLowerCase()}.`,
      topDescriptors: getTop("DIE")
    }
  };
}

function buildTriadSummaries(scoreMap: CoordinateScoreMap): PhilosophicalSentenceResult["triadSummaries"] {
  const getTop = (layer: TriadLayer) =>
    COORDINATES.filter((c) => c.triadLayer === layer)
      .map((c) => scoreMap[c.id].activeDescriptor)
      .slice(0, 5);

  return {
    Container: {
      layer: "Container",
      subtitle: "Objective Metaphysics, Cosmology & Physical Law",
      synthesis: `Your Container layer defines the outer stage of existence as ${scoreMap.B01.activeDescriptor.toLowerCase()}, governed by ${scoreMap.B04.activeDescriptor.toLowerCase()} causality and ${scoreMap.L10.activeDescriptor.toLowerCase()} time.`,
      dominantDescriptors: getTop("Container")
    },
    Bridge: {
      layer: "Bridge",
      subtitle: "Relational Ethics, Epistemic Verification & Cultural Praxis",
      synthesis: `Your Bridge layer mediates between self and cosmos through ${scoreMap.L05.activeDescriptor.toLowerCase()} inquiry, ${scoreMap.L02.activeDescriptor.toLowerCase()} ethics, and ${scoreMap.L11.activeDescriptor.toLowerCase()} rhythm.`,
      dominantDescriptors: getTop("Bridge")
    },
    Vessel: {
      layer: "Vessel",
      subtitle: "Phenomenological Selfhood, Affect & Inner Sovereignty",
      synthesis: `Your Vessel layer houses a ${scoreMap.B06.activeDescriptor.toLowerCase()} mind driven by ${scoreMap.L09.activeDescriptor.toLowerCase()} motivation and ${scoreMap.L15.activeDescriptor.toLowerCase()} agency.`,
      dominantDescriptors: getTop("Vessel")
    }
  };
}
