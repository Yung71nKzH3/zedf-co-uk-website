import { ScenarioQuestion } from "./schema";

export const SCENARIOS: ScenarioQuestion[] = [
  {
    id: "S01",
    stepNumber: 1,
    timeOfDay: "06:15 AM",
    act: "BORN",
    pillar: "Needs",
    ringFocus: "Ring 1: Internal Engine",
    title: "The Awakening Flesh",
    sceneContext:
      "An alarm fractures the pre-dawn silence. Before your memories or schedule assemble, there is a raw split-second where consciousness boots up inside a physical body you did not design, in a historical century you did not choose.",
    prompt:
      "In that first unfiltered moment of crossing from sleep into waking reality, how do you interpret what you fundamentally are?",
    philosophicalDomain: "Ontology of Self, Thrownness & Mind-Body Emergence",
    options: [
      {
        id: "S01_A",
        key: "A",
        stanceTag: "Reboot the biological engine & start fresh from zero",
        narrativeText:
          "A biological machine of firing neurons waking up in an arbitrary time and place; my slate is blank each morning until my deliberate habits write upon it.",
        philosophicalSubtext: "Lockean Tabula Rasa · Physicalist Monism · Heideggerian Thrownness",
        weights: [
          { coordinateId: "B03", pole: "A", weight: 3 },
          { coordinateId: "B06", pole: "A", weight: 3 },
          { coordinateId: "B14", pole: "A", weight: 3 }
        ]
      },
      {
        id: "S01_B",
        key: "B",
        stanceTag: "Awaken as an eternal pilot stepping back into a biological vehicle",
        narrativeText:
          "An independent conscious witness stepping back into the cockpit of a genetically wired body—carrying innate instincts and a deeper purpose meant for this exact life.",
        philosophicalSubtext: "Cartesian Dualism · Biological Innatism · Teleological Incarnation",
        weights: [
          { coordinateId: "B03", pole: "B", weight: 3 },
          { coordinateId: "B06", pole: "B", weight: 3 },
          { coordinateId: "B14", pole: "B", weight: 3 }
        ]
      },
      {
        id: "S01_C",
        key: "C",
        stanceTag: "Tune in as a node of universal awareness greeting this day's reality",
        narrativeText:
          "A localized tuning fork of universal awareness; I accept the unchosen constraints of my body and era, converting them immediately into a strategic baseline for action.",
        philosophicalSubtext: "Panpsychism / Advaita · Transmigratory Continuity · Pragmatic Situatedness",
        weights: [
          { coordinateId: "B03", pole: "C", weight: 3 },
          { coordinateId: "B06", pole: "C", weight: 3 },
          { coordinateId: "B14", pole: "C", weight: 3 }
        ]
      }
    ]
  },
  {
    id: "S02",
    stepNumber: 2,
    timeOfDay: "07:15 AM",
    act: "BORN",
    pillar: "Needs",
    ringFocus: "Ring 3: Material & Agency",
    title: "The Morning Sustenance",
    sceneContext:
      "Steam rises from a mug in your kitchen as light spills across the counter. You are taking in calories, water, and warmth to keep your cellular engine running against the cold pull of physical exhaustion.",
    prompt:
      "As you replenish your body for the day ahead, what is this biological engine actually doing in the grand scheme of nature?",
    philosophicalDomain: "Thermodynamics, Abiogenesis & Embodied Selfhood",
    options: [
      {
        id: "S02_A",
        key: "A",
        stanceTag: "Fuel the physical machine and savor the warm sensory kick",
        narrativeText:
          "I am a lucky chemical accident burning energy to degrade thermal gradients; I feel most real right here in the raw somatic warmth of breath, heartbeat, and coffee.",
        philosophicalSubtext: "Stochastic Abiogenesis · Entropic Acceleration · Merleau-Ponty Somatic Sentience",
        weights: [
          { coordinateId: "B02", pole: "A", weight: 3 },
          { coordinateId: "B08", pole: "A", weight: 3 },
          { coordinateId: "B12", pole: "A", weight: 3 }
        ]
      },
      {
        id: "S02_B",
        key: "B",
        stanceTag: "Nurture the life-spark that carries my personal story forward",
        narrativeText:
          "I am nurturing a spark of irreducible life-force so that I can continue authoring the long, unbroken story of who I have been and who I am becoming.",
        philosophicalSubtext: "Bergsonian Vitalism · Teilhardian Noosphere · Narrative Autobiographical Identity",
        weights: [
          { coordinateId: "B02", pole: "B", weight: 3 },
          { coordinateId: "B08", pole: "B", weight: 3 },
          { coordinateId: "B12", pole: "B", weight: 3 }
        ]
      },
      {
        id: "S02_C",
        key: "C",
        stanceTag: "Calibrate my body as an orderly instrument for mental clarity",
        narrativeText:
          "My body is a self-organizing vortex resisting chaos—converting simple fuel into the reflective clarity needed to observe myself and the world with precision.",
        philosophicalSubtext: "Deterministic Emergence · Autopoietic Resistance · Reflective Mirror Selfhood",
        weights: [
          { coordinateId: "B02", pole: "C", weight: 3 },
          { coordinateId: "B08", pole: "C", weight: 3 },
          { coordinateId: "B12", pole: "C", weight: 3 }
        ]
      }
    ]
  },
  {
    id: "S03",
    stepNumber: 3,
    timeOfDay: "08:30 AM",
    act: "BORN",
    pillar: "Responsibilities",
    ringFocus: "Ring 2: Relational Orbit",
    title: "The Public Threshold",
    sceneContext:
      "You step into the morning rush. On the transit platform, a confused commuter drops their belongings while an injured stray pigeon limps near the tracks, and your phone buzzes with a favor requested by a close cousin.",
    prompt:
      "When competing claims on your empathy collide in public space, what governs who deserves moral weight and why?",
    philosophicalDomain: "Moral Enfranchisement, Ethical Radius & Conditioning",
    options: [
      {
        id: "S03_A",
        key: "A",
        stanceTag: "Prioritize my family and close tribe first before helping strangers",
        narrativeText:
          "My deepest duty belongs to my bloodline and immediate tribe; our moral instincts are shaped by our cultural roots, and charity must begin with our own people.",
        philosophicalSubtext: "Parochial Kinship · Cultural Hegemony · Biological Personalism",
        weights: [
          { coordinateId: "B05", pole: "A", weight: 3 },
          { coordinateId: "B11", pole: "A", weight: 3 },
          { coordinateId: "L14", pole: "A", weight: 3 }
        ]
      },
      {
        id: "S03_B",
        key: "B",
        stanceTag: "Alleviate suffering wherever I see it—human or animal—without borders",
        narrativeText:
          "The capacity to suffer is the only boundary that matters—whether cousin, stranger, or trembling bird, evolutionary empathy compels me to reduce pain wherever I meet it.",
        philosophicalSubtext: "Pathocentric Sentientism · Evolutionary Primacy · Biospheric Moral Circle",
        weights: [
          { coordinateId: "B05", pole: "B", weight: 3 },
          { coordinateId: "B11", pole: "B", weight: 2 },
          { coordinateId: "L14", pole: "C", weight: 3 }
        ]
      },
      {
        id: "S03_C",
        key: "C",
        stanceTag: "Act as a fair global citizen, following consistent moral rules for everyone",
        narrativeText:
          "Every self-aware, reasoning citizen shares equal dignity under universal moral law; I act as a cosmopolitan steward balancing nature and culture through fair principles.",
        philosophicalSubtext: "Stoic/Kantian Cosmopolitanism · Rational Enfranchisement · Integrated Epigenetics",
        weights: [
          { coordinateId: "B05", pole: "C", weight: 3 },
          { coordinateId: "B11", pole: "C", weight: 3 },
          { coordinateId: "L14", pole: "B", weight: 3 }
        ]
      }
    ]
  },
  {
    id: "S04",
    stepNumber: 4,
    timeOfDay: "10:00 AM",
    act: "LIVE",
    pillar: "Responsibilities",
    ringFocus: "Ring 3: Material & Agency",
    title: "The Intractable Breakdown",
    sceneContext:
      "At work, a critical project grinds to a halt. Two senior colleagues argue fiercely: one insists on waiting for exhaustive empirical telemetry; the other argues from pure theoretical axioms. Deadlines are burning.",
    prompt:
      "How do you cut through the noise to determine what is actually true and how to verify it?",
    philosophicalDomain: "Epistemology, Verification & Philosophy of Truth",
    options: [
      {
        id: "S04_A",
        key: "A",
        stanceTag: "Demand hard data and test which theory collapses under real evidence",
        narrativeText:
          "Strip away unverified opinions and test the raw sensory data. Objective truth exists, but our models are always fallible hypotheses awaiting falsification.",
        philosophicalSubtext: "Popperian Fallibilism · Empirical Verification · Objective Absolutism",
        weights: [
          { coordinateId: "L04", pole: "A", weight: 2 },
          { coordinateId: "L05", pole: "A", weight: 3 },
          { coordinateId: "L06", pole: "B", weight: 3 }
        ]
      },
      {
        id: "S04_B",
        key: "B",
        stanceTag: "Solve it from unshakeable first principles and logical deductions",
        narrativeText:
          "Data is noisy without first principles. Reason backward from unshakeable logical axioms; if the formal architecture is sound, the solution must follow.",
        philosophicalSubtext: "Cartesian/Spinozist Rationalism · Logical Absolutism · Axiomatic Certainty",
        weights: [
          { coordinateId: "L04", pole: "A", weight: 3 },
          { coordinateId: "L05", pole: "B", weight: 3 },
          { coordinateId: "L06", pole: "A", weight: 3 }
        ]
      },
      {
        id: "S04_C",
        key: "C",
        stanceTag: "Merge the best of both ideas and test what actually works right now",
        narrativeText:
          "Truth is what works in practice while colliding opposing viewpoints together. Synthesize both perspectives and run a rapid real-world experiment.",
        philosophicalSubtext: "Deweyan Pragmatism · Perspectival Realism · Hegelian Dialectics",
        weights: [
          { coordinateId: "L04", pole: "B", weight: 2 },
          { coordinateId: "L04", pole: "C", weight: 2 },
          { coordinateId: "L05", pole: "C", weight: 3 },
          { coordinateId: "L06", pole: "C", weight: 3 }
        ]
      }
    ]
  },
  {
    id: "S05",
    stepNumber: 5,
    timeOfDay: "11:30 AM",
    act: "LIVE",
    pillar: "Responsibilities",
    ringFocus: "Ring 2: Relational Orbit",
    title: "The Unsupervised Ledger",
    sceneContext:
      "While reviewing a shared system alone, you discover an undocumented loophole. Exploiting it would quietly benefit your entire team's metrics without harming anyone visibly, though it violates the explicit rules of the covenant.",
    prompt:
      "When no external observer will ever audit your decision, what anchors your moral compass and cognitive boundary?",
    philosophicalDomain: "Normative Ethics, Social Ontology & Extended Mind",
    options: [
      {
        id: "S05_A",
        key: "A",
        stanceTag: "Refuse the loophole—my private integrity and self-respect matter more than metrics",
        narrativeText:
          "I refuse it because every covert act shapes the architecture of my own character inside my skull; I care more about who I become in private than external rewards.",
        philosophicalSubtext: "Aristotelian Virtue Ethics · Neuro-Internalism · Individual Moral Sovereignty",
        weights: [
          { coordinateId: "L02", pole: "A", weight: 3 },
          { coordinateId: "L08", pole: "C", weight: 3 },
          { coordinateId: "B15", pole: "A", weight: 3 }
        ]
      },
      {
        id: "S05_B",
        key: "B",
        stanceTag: "Close the loophole immediately—breaking shared rules erodes community trust",
        narrativeText:
          "I close the loophole immediately. If everyone treated rules as optional conveniences, the social contract and shared institutional trust would collapse.",
        philosophicalSubtext: "Kantian Categorical Imperative · Social Contractarianism · Extended Institutional Mind",
        weights: [
          { coordinateId: "L02", pole: "B", weight: 3 },
          { coordinateId: "L08", pole: "A", weight: 3 },
          { coordinateId: "B15", pole: "B", weight: 3 }
        ]
      },
      {
        id: "S05_C",
        key: "C",
        stanceTag: "Use the loophole if it genuinely lifts the team and causes no real harm",
        narrativeText:
          "I evaluate the net human flourishing: if using it genuinely uplifts the community without hidden harm, rigid rule-worship shouldn't block tangible collective welfare.",
        philosophicalSubtext: "Consequentialist Utilitarianism · Ubuntu Communitarianism · Non-Local Shared Consciousness",
        weights: [
          { coordinateId: "L02", pole: "C", weight: 3 },
          { coordinateId: "L08", pole: "B", weight: 3 },
          { coordinateId: "B15", pole: "C", weight: 3 }
        ]
      }
    ]
  },
  {
    id: "S06",
    stepNumber: 6,
    timeOfDay: "01:00 PM",
    act: "LIVE",
    pillar: "Luxuries/Wants",
    ringFocus: "Ring 1: Internal Engine",
    title: "The Midday Intermission",
    sceneContext:
      "You step away from work into a sunlit courtyard for lunch. Light filters through leaves, distant laughter echoes, and for forty-five minutes you are free to inhabit the present moment.",
    prompt:
      "What constitutes the 'Good Life' in this pause, and how real is the sensory world unfolding around you?",
    philosophicalDomain: "Eudaimonia, Metaphysical Realism & Temporal Flow",
    options: [
      {
        id: "S06_A",
        key: "A",
        stanceTag: "Cultivate inner stillness and anchor awareness in this razor-thin present",
        narrativeText:
          "A quiet, unshakeable inner citadel. The physical trees and stones exist independently of me, and only this razor-thin slice of the present moment is real.",
        philosophicalSubtext: "Stoic Ataraxia · Metaphysical Realism · Temporal Presentism",
        weights: [
          { coordinateId: "L03", pole: "A", weight: 3 },
          { coordinateId: "L01", pole: "A", weight: 3 },
          { coordinateId: "L10", pole: "A", weight: 3 }
        ]
      },
      {
        id: "S06_B",
        key: "B",
        stanceTag: "Savor simple delights in peace, free from all anxiety and drama",
        narrativeText:
          "Savoring simple pleasures in the absence of pain. Everything I experience is woven through the lens of perception, suspended in a vast, timeless tapestry of moments.",
        philosophicalSubtext: "Epicurean Hedonism · Kantian/Phenomenological Idealism · Eternalist Block Time",
        weights: [
          { coordinateId: "L03", pole: "B", weight: 3 },
          { coordinateId: "L01", pole: "B", weight: 3 },
          { coordinateId: "L10", pole: "B", weight: 3 }
        ]
      },
      {
        id: "S06_C",
        key: "C",
        stanceTag: "Embrace the day with creative curiosity, active craft, and vitality",
        narrativeText:
          "Full-blooded engagement, curiosity, and skill-building! Reality is a predictive toolkit we actively shape as the Fixed Past crystallizes into an Open Future.",
        philosophicalSubtext: "Aristotelian/Nietzschean Flourishing · Scientific Instrumentalism · Growing-Block Time",
        weights: [
          { coordinateId: "L03", pole: "C", weight: 3 },
          { coordinateId: "L01", pole: "C", weight: 3 },
          { coordinateId: "L10", pole: "C", weight: 3 }
        ]
      }
    ]
  },
  {
    id: "S07",
    stepNumber: 7,
    timeOfDay: "02:30 PM",
    act: "LIVE",
    pillar: "Ability",
    ringFocus: "Ring 3: Material & Agency",
    title: "The Wall of Resistance",
    sceneContext:
      "Mid-afternoon fatigue hits just as an unexpected obstacle blocks your primary goal. External bureaucracy, resource limits, and your own cognitive bandwidth seem to conspire against you.",
    prompt:
      "When you collide with hard constraints, how much true free will do you actually possess, and how do you move?",
    philosophicalDomain: "Free Will, Causal Determinism & Tactical Rhythm (Wu-Wei vs Will)",
    options: [
      {
        id: "S07_A",
        key: "A",
        stanceTag: "Master my internal reaction and advance patiently along my long-term plan",
        narrativeText:
          "External events follow strict physical chains of cause and effect, but I command my internal judgment. I stick to my multi-year blueprint with disciplined patience.",
        philosophicalSubtext: "Stoic Dichotomy of Control · Causal Determinism · Long-Horizon Teleological Planning",
        weights: [
          { coordinateId: "L15", pole: "A", weight: 3 },
          { coordinateId: "B04", pole: "A", weight: 3 },
          { coordinateId: "L11", pole: "A", weight: 3 }
        ]
      },
      {
        id: "S07_B",
        key: "B",
        stanceTag: "Break conventions and pivot dynamically to exploit unexpected openings",
        narrativeText:
          "Nothing is written in stone—the universe has genuine quantum openings. I exercise radical freedom, pivoting on a dime to exploit the chaos and bend the rules.",
        philosophicalSubtext: "Sartrean Radical Freedom · Quantum Indeterminacy · Kairotic Agile Opportunism",
        weights: [
          { coordinateId: "L15", pole: "C", weight: 3 },
          { coordinateId: "B04", pole: "B", weight: 3 },
          { coordinateId: "L11", pole: "B", weight: 3 }
        ]
      },
      {
        id: "S07_C",
        key: "C",
        stanceTag: "Yield to the natural grain of circumstances and flow around the blockage",
        narrativeText:
          "Forcing against a wall wastes vital energy. Recognizing how biology and circumstance shape the terrain, I flow around the obstacle like water finding the natural seam.",
        philosophicalSubtext: "Daoist Wu-Wei (Effortless Action) · Bounded Compatibilism · Deterministic Realism",
        weights: [
          { coordinateId: "L15", pole: "B", weight: 3 },
          { coordinateId: "B04", pole: "C", weight: 3 },
          { coordinateId: "L11", pole: "C", weight: 3 }
        ]
      }
    ]
  },
  {
    id: "S08",
    stepNumber: 8,
    timeOfDay: "04:00 PM",
    act: "LIVE",
    pillar: "Emotions",
    ringFocus: "Ring 1: Internal Engine",
    title: "The Unfair Strike",
    sceneContext:
      "A project you poured your heart into is abruptly canceled due to someone else's incompetence, and you are handed the blame. A wave of heat, frustration, and existential absurdity rises in your chest.",
    prompt:
      "How do you metabolize sudden suffering, unfairness, and the apparent lack of a fair cosmic script?",
    philosophicalDomain: "Existential Meaning, Suffering Transmutation & Amor Fati",
    options: [
      {
        id: "S08_A",
        key: "A",
        stanceTag: "Smile into the absurdity, accept the hit, and push the boulder anyway",
        narrativeText:
          "I smile into the storm. Life is an arbitrary lottery without a script, yet I embrace even this wreck as necessary fuel—rolling my boulder up the hill with defiant joy.",
        philosophicalSubtext: "Camusian Absurdism · Nietzschean Amor Fati · Stochastic Entry",
        weights: [
          { coordinateId: "B09", pole: "A", weight: 3 },
          { coordinateId: "L07", pole: "A", weight: 3 },
          { coordinateId: "D05", pole: "A", weight: 3 }
        ]
      },
      {
        id: "S08_B",
        key: "B",
        stanceTag: "Convert the sting into focused fire to rebuild stronger and self-author meaning",
        narrativeText:
          "I transmute the anger into cold, focused fire. In a universe devoid of inherent fairness, I refuse to yield—I will rebuild stronger and impose my own meaning on the void.",
        philosophicalSubtext: "Sartrean Self-Authorship · Defiant Resistance · Active Nihilism/Overcoming",
        weights: [
          { coordinateId: "B09", pole: "C", weight: 3 },
          { coordinateId: "L07", pole: "B", weight: 3 },
          { coordinateId: "D05", pole: "B", weight: 3 }
        ]
      },
      {
        id: "S08_C",
        key: "C",
        stanceTag: "Step back into calm detachment, trusting the larger rhythm of reality",
        narrativeText:
          "I breathe and step back from the emotional spiral. Every setback belongs to a larger unfolding lesson or natural pattern; I preserve my inner peace and quiet dignity.",
        philosophicalSubtext: "Teleological Providence / Logotherapy · Destined Calling · Epicurean Neutrality",
        weights: [
          { coordinateId: "B09", pole: "B", weight: 3 },
          { coordinateId: "L07", pole: "C", weight: 3 },
          { coordinateId: "D05", pole: "C", weight: 3 }
        ]
      }
    ]
  },
  {
    id: "S09",
    stepNumber: 9,
    timeOfDay: "05:30 PM",
    act: "LIVE",
    pillar: "Luxuries/Wants",
    ringFocus: "Ring 3: Material & Agency",
    title: "The Dusk Workshop",
    sceneContext:
      "The workday ends, and the golden hour arrives. You turn to a personal craft—shaping code, tending a garden, playing an instrument, or cooking from scratch.",
    prompt:
      "Why do you build and shape things, how should humanity relate to the material earth, and where does your mind anchor in time?",
    philosophicalDomain: "Philosophy of Technology, Ecology & Temporal Orientation",
    options: [
      {
        id: "S09_A",
        key: "A",
        stanceTag: "Invent tools and shape raw matter to accelerate human progress",
        narrativeText:
          "We are here to master matter, invent better tools, and accelerate toward a brighter future—forging our own bold aesthetic signature onto reality.",
        philosophicalSubtext: "Baconian Prometheanism · Enlightenment Meliorism · Existential Will-to-Meaning",
        weights: [
          { coordinateId: "L13", pole: "A", weight: 3 },
          { coordinateId: "L12", pole: "B", weight: 3 },
          { coordinateId: "L09", pole: "B", weight: 3 }
        ]
      },
      {
        id: "S09_B",
        key: "B",
        stanceTag: "Work in gentle harmony with the living biosphere, fully present in the craft",
        narrativeText:
          "I craft to harmonize with the living biosphere, fully immersed in the tactile rhythm of right now—treating my work as a gift of care for the web of life.",
        philosophicalSubtext: "Deep Ecology Biocentrism · Zen Presentism · Altruistic Stewardship",
        weights: [
          { coordinateId: "L13", pole: "B", weight: 3 },
          { coordinateId: "L12", pole: "A", weight: 3 },
          { coordinateId: "L09", pole: "C", weight: 3 }
        ]
      },
      {
        id: "S09_C",
        key: "C",
        stanceTag: "Practice timeless ancestral technique purely for the defiant joy of creation",
        narrativeText:
          "I strip away modern clutter to honor timeless ancestral craft—creating purely for the defiant joy of the act itself, refusing to let utility dictate my soul.",
        philosophicalSubtext: "Monastic/Cynic Asceticism · Classical Traditionalism · Dionysian Ludic Rebellion",
        weights: [
          { coordinateId: "L13", pole: "C", weight: 3 },
          { coordinateId: "L12", pole: "C", weight: 3 },
          { coordinateId: "L09", pole: "A", weight: 3 }
        ]
      }
    ]
  },
  {
    id: "S10",
    stepNumber: 10,
    timeOfDay: "07:15 PM",
    act: "LIVE",
    pillar: "Emotions",
    ringFocus: "Ring 2: Relational Orbit",
    title: "The Evening Confession (The I-Thou Encounter)",
    sceneContext:
      "Over a quiet dinner, someone you deeply care about drops their guard and confesses a profound fear of being forgotten and meaningless once their life is over.",
    prompt:
      "As you look across the table into another vulnerable consciousness, how do you frame human connection and the trace we leave behind?",
    philosophicalDomain: "I-Thou Relationality, Legacy & Cosmic Setting",
    options: [
      {
        id: "S10_A",
        key: "A",
        stanceTag: "Assure them our love and kindness create enduring ripples in others",
        narrativeText:
          "I hold their hand and remind them: we live on in the invisible ripples of kindness and courage we awaken in each other—consciousness co-creates the meaning of this universe.",
        philosophicalSubtext: "Buber's I-Thou & Yalom's Ripples · Cultural Memorialism · Participatory Universe",
        weights: [
          { coordinateId: "D02", pole: "B", weight: 3 },
          { coordinateId: "D11", pole: "B", weight: 3 },
          { coordinateId: "B13", pole: "C", weight: 3 }
        ]
      },
      {
        id: "S10_B",
        key: "B",
        stanceTag: "Encourage them to channel fear into building works and structures that last",
        narrativeText:
          "I encourage them to channel that fear into building enduring works, institutions, or ideas that structurally outlast the fragile biological body.",
        philosophicalSubtext: "Arendtian/Horatian Monumentalism · Systemic Continuity · Anthropocentric Purpose",
        weights: [
          { coordinateId: "D02", pole: "A", weight: 3 },
          { coordinateId: "D11", pole: "C", weight: 3 },
          { coordinateId: "B13", pole: "B", weight: 3 }
        ]
      },
      {
        id: "S10_C",
        key: "C",
        stanceTag: "Offer honest solace: our finitude is precisely what makes tonight so precious",
        narrativeText:
          "I share honest solace: the universe is vast and silent, and when our bodies stop, we are done—and that very impermanence is what makes this shared meal tonight sacred.",
        philosophicalSubtext: "Wabi-Sabi Ephemerality · Somatic Realism · Indifferent Cosmic Sublime",
        weights: [
          { coordinateId: "D02", pole: "C", weight: 3 },
          { coordinateId: "D11", pole: "A", weight: 3 },
          { coordinateId: "B13", pole: "A", weight: 3 }
        ]
      }
    ]
  },
  {
    id: "S11",
    stepNumber: 11,
    timeOfDay: "08:45 PM",
    act: "DIE",
    pillar: "Luxuries/Wants",
    ringFocus: "Ring 1: Internal Engine",
    title: "The Ludic Sandbox & Scarcity",
    sceneContext:
      "Night settles in. You immerse yourself in an evening passion—a sprawling virtual world, a symphony, or a deeply absorbing book. Suddenly, you realize how few thousands of evenings a human life actually contains.",
    prompt:
      "Does the scarcity of our time give this play its precious value, and when would you consider a life truly complete?",
    philosophicalDomain: "Scarcity Value, Telic vs Atelic Living & Finality",
    options: [
      {
        id: "S11_A",
        key: "A",
        stanceTag: "Value life because of its deadline, striving to bring my story arc to a climax",
        narrativeText:
          "Finitude is the very engine of value—without a deadline, nothing would matter. A life is complete when its central mission and story arc reach a resolved climax.",
        philosophicalSubtext: "Heideggerian Urgency · Narrative Teleology · Telic Project Completion",
        weights: [
          { coordinateId: "D08", pole: "A", weight: 3 },
          { coordinateId: "D09", pole: "A", weight: 3 },
          { coordinateId: "D12", pole: "A", weight: 3 }
        ]
      },
      {
        id: "S11_B",
        key: "B",
        stanceTag: "Cherish each note of the melody for its own sake, while mourning that it must end",
        narrativeText:
          "A melody doesn't exist just to reach its final note! I live for the sheer richness of each moment, even as I protest the tragic absurdity that the music must ever stop.",
        philosophicalSubtext: "Atelic Experiential Fullness · Unamuno's Tragic Protest · Open-Ended Presence",
        weights: [
          { coordinateId: "D08", pole: "B", weight: 3 },
          { coordinateId: "D09", pole: "B", weight: 3 },
          { coordinateId: "D12", pole: "B", weight: 3 }
        ]
      },
      {
        id: "S11_C",
        key: "C",
        stanceTag: "Rest content in the stillness of being, where adding centuries adds nothing new",
        narrativeText:
          "Once you have tasted true presence and inner stillness, additional centuries add nothing essential. Death is a gentle release from the restless wheel of craving.",
        philosophicalSubtext: "Senecan/Pyrrhonian Equanimity · Buddhist/Vedantic Moksha · Telic Readiness",
        weights: [
          { coordinateId: "D08", pole: "C", weight: 3 },
          { coordinateId: "D09", pole: "C", weight: 3 },
          { coordinateId: "D12", pole: "C", weight: 3 }
        ]
      }
    ]
  },
  {
    id: "S12",
    stepNumber: 12,
    timeOfDay: "10:15 PM",
    act: "BORN",
    pillar: "Ability",
    ringFocus: "Ring 4: Cosmic Horizon",
    title: "Under the Deep Expanse",
    sceneContext:
      "You step out onto a balcony or quiet street and look up at the night sky. Photons that traveled for millions of years strike your retina from across the abyss.",
    prompt:
      "When you contemplate the architecture of the cosmos before life ever arose, what is the foundational baseline of reality?",
    philosophicalDomain: "Cosmology, First Cause, Anthropic Tuning & Spacetime",
    options: [
      {
        id: "S12_A",
        key: "A",
        stanceTag: "Observe a silent physical cosmos governed strictly by natural laws",
        narrativeText:
          "Cold, mindless matter and quantum fields expanding from a discrete Big Bang origin; we observe fine-tuned laws simply because we couldn't exist anywhere else.",
        philosophicalSubtext: "Material Physicalism · Weak Anthropic Principle · Linear Cosmological Origin",
        weights: [
          { coordinateId: "B01", pole: "A", weight: 3 },
          { coordinateId: "B07", pole: "A", weight: 3 },
          { coordinateId: "B10", pole: "A", weight: 3 }
        ]
      },
      {
        id: "S12_B",
        key: "B",
        stanceTag: "Sense an elegant cosmic intelligence cycling endlessly through time",
        narrativeText:
          "The mathematical elegance of the cosmos whispers of an intentional Architect or rational order—breathing through infinite cycles of cosmic expansion and renewal.",
        philosophicalSubtext: "Spinozist/Deistic Calibration · Fine-Tuned Teleology · Cyclical Recurrence",
        weights: [
          { coordinateId: "B01", pole: "B", weight: 3 },
          { coordinateId: "B07", pole: "B", weight: 3 },
          { coordinateId: "B10", pole: "B", weight: 3 }
        ]
      },
      {
        id: "S12_C",
        key: "C",
        stanceTag: "Recognize reality as an informational substrate spanning all possibilities",
        narrativeText:
          "Reality is fundamentally computational information—an eternal four-dimensional block or vast multiverse ensemble where every possible branch of existence co-occurs.",
        philosophicalSubtext: "Informational/Simulation Ontology · Multiverse Selection · Static Block Spacetime",
        weights: [
          { coordinateId: "B01", pole: "C", weight: 3 },
          { coordinateId: "B07", pole: "C", weight: 3 },
          { coordinateId: "B10", pole: "C", weight: 3 }
        ]
      }
    ]
  },
  {
    id: "S13",
    stepNumber: 13,
    timeOfDay: "11:15 PM",
    act: "DIE",
    pillar: "Needs",
    ringFocus: "Ring 4: Cosmic Horizon",
    title: "The Biological Hourglass",
    sceneContext:
      "Washing your face before bed, you notice subtle signs of time etched in the mirror. Every cell in your body is participating in an ancient biological bargain.",
    prompt:
      "What is the physical destination of your atoms, why does biological death exist in nature, and how do you view aging?",
    philosophicalDomain: "Material Fate, Evolutionary Turnover & Senescence",
    options: [
      {
        id: "S13_A",
        key: "A",
        stanceTag: "Accept biological turnover with grace, returning my borrowed atoms to the soil",
        narrativeText:
          "My atoms are on loan from the stars and will return to feed the soil and forests; aging is a natural evolutionary turnover that clears the stage for new life.",
        philosophicalSubtext: "Biogeochemical Symbiosis · Evolutionary Generational Renewal · Senescent Realism",
        weights: [
          { coordinateId: "D01", pole: "B", weight: 3 },
          { coordinateId: "D07", pole: "A", weight: 3 },
          { coordinateId: "D04", pole: "A", weight: 3 }
        ]
      },
      {
        id: "S13_B",
        key: "B",
        stanceTag: "Acknowledge physical wear as thermodynamic decay without romantic illusion",
        narrativeText:
          "There is no romantic purpose to death—organisms simply wear down under relentless thermodynamic wear-and-tear and stochastic shocks until structure dissolves into heat.",
        philosophicalSubtext: "Entropic Dissolution · Pure Thermodynamic Mechanism · Catastrophic Fragility",
        weights: [
          { coordinateId: "D01", pole: "A", weight: 3 },
          { coordinateId: "D07", pole: "B", weight: 3 },
          { coordinateId: "D04", pole: "B", weight: 3 }
        ]
      },
      {
        id: "S13_C",
        key: "C",
        stanceTag: "Treat senescence as an engineering problem that science will eventually overcome",
        narrativeText:
          "Quantum states are never truly erased, and biological aging is merely an engineering failure of cellular homeostasis waiting to be decoupled and repaired.",
        philosophicalSubtext: "Quantum Information Conservation · Systemic Succession · Homeostatic Decoupling",
        weights: [
          { coordinateId: "D01", pole: "C", weight: 3 },
          { coordinateId: "D07", pole: "C", weight: 3 },
          { coordinateId: "D04", pole: "C", weight: 3 }
        ]
      }
    ]
  },
  {
    id: "S14",
    stepNumber: 14,
    timeOfDay: "12:15 AM",
    act: "DIE",
    pillar: "Ability",
    ringFocus: "Ring 3: Material & Agency",
    title: "The Technological Horizon",
    sceneContext:
      "Past midnight, you read a breakthrough report on neural-digital interfaces, genetic rejuvenation, and synthetic consciousness—humanity standing at the threshold of rewriting its own vessel.",
    prompt:
      "If given the power to transcend biological limits and project intelligence into deep cosmic time, where do you stand?",
    philosophicalDomain: "Transhumanism, Eschatology & Cosmic Equilibrium",
    options: [
      {
        id: "S14_A",
        key: "A",
        stanceTag: "Cherish our natural mortal lifespan, resisting the urge to escape biology",
        narrativeText:
          "Our humanity is inseparable from our fragile, mortal flesh. We should cherish our natural lifespan with grace, accepting that even the stars will eventually cool into silent equilibrium.",
        philosophicalSubtext: "Bioconservative Humanism · Big Freeze Heat-Death Realism · Uniform Entropy",
        weights: [
          { coordinateId: "D06", pole: "A", weight: 3 },
          { coordinateId: "D10", pole: "A", weight: 3 },
          { coordinateId: "D13", pole: "A", weight: 3 }
        ]
      },
      {
        id: "S14_B",
        key: "B",
        stanceTag: "Upgrade our biology and project conscious mind across the stars",
        narrativeText:
          "We must upgrade our biology, conquer disease, and expand conscious intelligence outward—guiding the universe toward a higher, unified Singularity of mind.",
        philosophicalSubtext: "Enhancement Transhumanism · Omega Point Singularism · Cyclical/Renewing Cosmos",
        weights: [
          { coordinateId: "D06", pole: "B", weight: 3 },
          { coordinateId: "D10", pole: "B", weight: 2 },
          { coordinateId: "D13", pole: "B", weight: 3 }
        ]
      },
      {
        id: "S14_C",
        key: "C",
        stanceTag: "Pave the way for post-biological cybernetics and substrate-free awareness",
        narrativeText:
          "Biological humans are a bridge to synthetic and distributed forms of mind—encoding intelligence across quantum horizons and vacuum transitions beyond carbon.",
        philosophicalSubtext: "Posthumanist Substrate Independence · Quantum Vacuum Cosmology · Event Horizonism",
        weights: [
          { coordinateId: "D06", pole: "C", weight: 3 },
          { coordinateId: "D10", pole: "C", weight: 3 },
          { coordinateId: "D13", pole: "C", weight: 3 }
        ]
      }
    ]
  },
  {
    id: "S15",
    stepNumber: 15,
    timeOfDay: "01:00 AM",
    act: "DIE",
    pillar: "Luxuries/Wants",
    ringFocus: "Ring 4: Cosmic Horizon",
    title: "The Earthly Anchor & The Observer's Fate",
    sceneContext:
      "The house is completely still. You think of the physical trace your body and voice will leave on Earth, and what happens to the 'I'—the inner observer—when the final curtain falls.",
    prompt:
      "How should your earthly presence be anchored, and where does the conscious observer ultimately go?",
    philosophicalDomain: "Afterlife/Oblivion, Non-Duality & Physical Memorial",
    options: [
      {
        id: "S15_A",
        key: "A",
        stanceTag: "Scatter my ashes freely as consciousness peacefully dissolves into non-being",
        narrativeText:
          "Scatter my ashes into the wind or ocean with no heavy stone. Consciousness extinguishes like a candle flame—returning to the peaceful, dreamless rest that preceded my birth.",
        philosophicalSubtext: "Epicurean/Lucretian Mortalism · Oblivionism · Diffuse Naturalist Return",
        weights: [
          { coordinateId: "D03", pole: "A", weight: 3 },
          { coordinateId: "D14", pole: "B", weight: 3 },
          { coordinateId: "D15", pole: "A", weight: 3 }
        ]
      },
      {
        id: "S15_B",
        key: "B",
        stanceTag: "Leave a quiet memorial as the separate ego dissolves back into the universal ocean",
        narrativeText:
          "Leave a quiet marker for those who loved me, while the illusion of my separate ego dissolves like a raindrop returning to the boundless, timeless ocean of universal consciousness.",
        philosophicalSubtext: "Advaita / Oceanic Non-Duality · Cenotaph Memorial · Cosmic Re-absorption",
        weights: [
          { coordinateId: "D03", pole: "C", weight: 3 },
          { coordinateId: "D14", pole: "A", weight: 3 },
          { coordinateId: "D15", pole: "B", weight: 3 }
        ]
      },
      {
        id: "S15_C",
        key: "C",
        stanceTag: "Archive my mind’s patterns as consciousness awakens into a new realm or cycle",
        narrativeText:
          "Preserve my thoughts, creations, and neural patterns in an enduring archive—while the soul or pattern of awareness awakens in a new realm or future cycle of becoming.",
        philosophicalSubtext: "Transcendental Continuity · Digital Archivalism · Metempsychosis / Rebirth",
        weights: [
          { coordinateId: "D03", pole: "B", weight: 3 },
          { coordinateId: "D14", pole: "C", weight: 3 },
          { coordinateId: "D15", pole: "C", weight: 3 }
        ]
      }
    ]
  },
  {
    id: "S16",
    stepNumber: 16,
    timeOfDay: "01:45 AM",
    act: "DIE",
    pillar: "Emotions",
    ringFocus: "Ring 1: Internal Engine",
    title: "The Final Surrender (Sleep as Rehearsal)",
    sceneContext:
      "Your head rests on the pillow. The 24-hour cycle is complete. As your breathing slows and waking consciousness dissolves into sleep—the nightly rehearsal for death—one final truth remains.",
    prompt:
      "When you sum up the entire arc of waking, striving, loving, and letting go, what is your ultimate philosophical vow?",
    philosophicalDomain: "Grand Synthesis: Temperament, Conduct & Cosmic Stance",
    options: [
      {
        id: "S16_A",
        key: "A",
        stanceTag: "The Stoic Vow: Master my mind, do my duty, and meet fate with quiet dignity",
        narrativeText:
          "To see reality without illusion, govern my own mind with tranquil virtue, fulfill my duty to the human cosmopolis, and accept fate with an unbowed spirit.",
        philosophicalSubtext: "Stoic Virtue · Rational Realism · Amor Fati Equanimity",
        weights: [
          { coordinateId: "L03", pole: "A", weight: 2 },
          { coordinateId: "L02", pole: "A", weight: 2 },
          { coordinateId: "D05", pole: "A", weight: 2 },
          { coordinateId: "L15", pole: "A", weight: 2 }
        ]
      },
      {
        id: "S16_B",
        key: "B",
        stanceTag: "The Vitalist Vow: Burn brightly, forge my own values, and turn scars into art",
        narrativeText:
          "To burn brightly against the dark, forge my own values out of raw freedom, love fiercely in the face of impermanence, and turn every scar into art.",
        philosophicalSubtext: "Existential Self-Authorship · Dionysian Vitalism · Defiant Rebellion",
        weights: [
          { coordinateId: "B09", pole: "C", weight: 2 },
          { coordinateId: "L07", pole: "A", weight: 2 },
          { coordinateId: "L09", pole: "A", weight: 2 },
          { coordinateId: "D05", pole: "B", weight: 2 }
        ]
      },
      {
        id: "S16_C",
        key: "C",
        stanceTag: "The Promethean Vow: Test reality, alleviate suffering, and expand human horizons",
        narrativeText:
          "To decode the machinery of nature through empirical truth, build tools that alleviate suffering for all sentient beings, and push consciousness beyond its mortal horizon.",
        philosophicalSubtext: "Scientific Empiricism · Utilitarian Compassion · Transhumanist Meliorism",
        weights: [
          { coordinateId: "L05", pole: "A", weight: 2 },
          { coordinateId: "L02", pole: "C", weight: 2 },
          { coordinateId: "L13", pole: "A", weight: 2 },
          { coordinateId: "D06", pole: "B", weight: 2 }
        ]
      },
      {
        id: "S16_D",
        key: "D",
        stanceTag: "The Harmonist Vow: Flow with nature, awaken to unity, and rest in deep peace",
        narrativeText:
          "To move with effortless grace along the grain of nature, awaken to the non-dual unity beneath all things, and rest in serene gratitude for the gift of being.",
        philosophicalSubtext: "Daoist Wu-Wei · Panpsychist Non-Duality · Epicurean/Zen Peace",
        weights: [
          { coordinateId: "B06", pole: "C", weight: 2 },
          { coordinateId: "L11", pole: "C", weight: 2 },
          { coordinateId: "L13", pole: "B", weight: 2 },
          { coordinateId: "D15", pole: "B", weight: 2 }
        ]
      }
    ]
  }
];

