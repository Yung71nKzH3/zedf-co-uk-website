export interface GlossaryEntry {
  term: string;
  category: 'Epistemology' | 'Disposition' | 'Ethics' | 'Meaning & Teleology' | 'Cosmic Horizon';
  plainSummary: string;
  inDailyLife: string;
  keyThinkers: string[];
}

export function lookupGlossary(query: string): GlossaryEntry | undefined {
  if (!query) return undefined;
  const clean = query.trim().replace(/^[,.\s]+|[,.\s]+$/g, '');
  
  // Exact match
  if (PHILOSOPHICAL_GLOSSARY[clean]) return PHILOSOPHICAL_GLOSSARY[clean];

  // Case-insensitive match
  const lower = clean.toLowerCase();
  for (const [key, val] of Object.entries(PHILOSOPHICAL_GLOSSARY)) {
    if (key.toLowerCase() === lower) return val;
  }

  // Partial match for compound phrases
  for (const [key, val] of Object.entries(PHILOSOPHICAL_GLOSSARY)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return val;
    }
  }

  return undefined;
}

export const PHILOSOPHICAL_GLOSSARY: Record<string, GlossaryEntry> = {
  // === 1. Epistemology / Reality ===
  'Panpsychist': {
    term: 'Panpsychism',
    category: 'Epistemology',
    plainSummary:
      'The view that consciousness is not an accidental byproduct created only by meat and neurons, but a fundamental building block of the universe—like mass, gravity, or electrical charge.',
    inDailyLife:
      'You experience living things and the cosmos with innate reverence; you treat subjective experience as real and primary rather than an illusion of biological hardware.',
    keyThinkers: ['Baruch Spinoza', 'Bertrand Russell', 'David Chalmers', 'Alfred North Whitehead']
  },
  'Panpsychist, Idealist': {
    term: 'Panpsychist Idealism',
    category: 'Epistemology',
    plainSummary:
      'The belief that reality is fundamentally mental and conscious; the physical universe is an outward manifestation of an interconnected universal mind.',
    inDailyLife:
      'You look past physical surfaces, sensing an underlying conscious unity connecting yourself, nature, and other people.',
    keyThinkers: ['Bernardo Kastrup', 'Arthur Schopenhauer', 'Upanishadic Sages']
  },
  'Empirical Physicalist': {
    term: 'Empirical Physicalism',
    category: 'Epistemology',
    plainSummary:
      'The stance that reality is composed entirely of physical matter, energy, and natural laws, and the only reliable way to understand it is through observation, evidence, and scientific testing.',
    inDailyLife:
      'You trust hard evidence over wishful thinking; you demand data, test assumptions, and look for practical physical mechanisms behind life’s events.',
    keyThinkers: ['Democritus', 'David Hume', 'Karl Popper', 'Carl Sagan']
  },
  'Physicalist': {
    term: 'Physicalism',
    category: 'Epistemology',
    plainSummary:
      'The philosophical principle that everything that exists is ultimately physical, governed by the laws of physics and chemistry.',
    inDailyLife:
      'You approach life as a grounded realist, seeing human beings as biological organisms navigating the physical world without supernatural interference.',
    keyThinkers: ['Thomas Hobbes', 'W.V.O. Quine', 'Daniel Dennett']
  },
  'Deistic': {
    term: 'Deism',
    category: 'Epistemology',
    plainSummary:
      'The view that an architect or prime intelligence established the elegant mathematical laws of the universe, which now runs self-sufficiently without magical interventions.',
    inDailyLife:
      'You find awe in the ordered, harmonious architecture of physics and biology, believing reason and nature reveal everything worth knowing.',
    keyThinkers: ['Voltaire', 'Thomas Jefferson', 'Albert Einstein (Spinozan God)']
  },
  'Deistic, Rationalist': {
    term: 'Deistic Rationalism',
    category: 'Epistemology',
    plainSummary:
      'Belief in an ordered cosmic design understood through pure human reason and logical deduction rather than blind dogma or emotional mysticism.',
    inDailyLife:
      'You seek first-principles logic in everything you do, confident that universal truth can be deciphered through disciplined intellect.',
    keyThinkers: ['Gottfried Wilhelm Leibniz', 'René Descartes', 'Baruch Spinoza']
  },
  'Axiomatic Rationalist': {
    term: 'Axiomatic Rationalism',
    category: 'Epistemology',
    plainSummary:
      'The view that genuine certainty begins with self-evident logical axioms and deductive reasoning, which are more reliable than fallible sensory perceptions.',
    inDailyLife:
      'You value consistency, mental clarity, and principled arguments; you distrust gut feelings until they survive rigorous logical scrutiny.',
    keyThinkers: ['René Descartes', 'Baruch Spinoza', 'Kurt Gödel']
  },
  'Pragmatic Realist': {
    term: 'Pragmatic Realism',
    category: 'Epistemology',
    plainSummary:
      'The view that truth is measured by what actually works in practice to solve problems, navigate reality, and improve life.',
    inDailyLife:
      'You care less about endless theoretical debates and focus on real-world results: tools that work, habits that succeed, and adaptable survival.',
    keyThinkers: ['William James', 'John Dewey', 'Charles Sanders Peirce']
  },
  'Simulational': {
    term: 'Simulation Hypothesis',
    category: 'Epistemology',
    plainSummary:
      'The perspective that physical reality is an engineered computational environment or mathematical information matrix rather than baseline brute matter.',
    inDailyLife:
      'You view physical reality like code—seeking its systemic rules, underlying parameters, and opportunities to optimize within its sandbox constraints.',
    keyThinkers: ['Nick Bostrom', 'John Archibald Wheeler', 'Donald Hoffman']
  },
  'Simulational, Empiricist': {
    term: 'Simulational Empiricism',
    category: 'Epistemology',
    plainSummary:
      'Viewing reality as an informational substrate while testing its rules and limits through rigorous scientific experimentation and data collection.',
    inDailyLife:
      'You approach life as an experimental player-scientist—testing the boundary conditions of reality through concrete empirical trials.',
    keyThinkers: ['Nick Bostrom', 'Max Tegmark', 'David Deutsch']
  },

  // === 2. Disposition / Temperament ===
  'Optimistic': {
    term: 'Philosophical Optimism',
    category: 'Disposition',
    plainSummary:
      'A baseline trust that existence possesses genuine coherence, potential, and goodness, and that conscious effort leads toward flourishing.',
    inDailyLife:
      'You bounce back from difficulties with renewed purpose, expecting solutions and focusing energy on what can be improved.',
    keyThinkers: ['G.W. Leibniz', 'Ralph Waldo Emerson', 'Steven Pinker']
  },
  'Tragic-Optimistic': {
    term: 'Tragic Optimism',
    category: 'Disposition',
    plainSummary:
      'Genuine optimism maintained not by pretending suffering does not exist, but by deliberately choosing courage, meaning, and joy despite tragedy and loss.',
    inDailyLife:
      'You acknowledge life’s heartbreak and unfairness with open eyes, yet stubbornly turn painful realities into character, compassion, and grit.',
    keyThinkers: ['Viktor Frankl', 'Albert Camus', 'Friedrich Nietzsche']
  },
  'Defiant, Vitalist': {
    term: 'Defiant Vitalism',
    category: 'Disposition',
    plainSummary:
      'A fiery, passion-driven affirmation of life that refuses quiet surrender to entropy, boredom, or arbitrary authority.',
    inDailyLife:
      'You meet obstacles with passionate energy, treat friction as creative fuel, and live with unapologetic boldness.',
    keyThinkers: ['Friedrich Nietzsche', 'Dylan Thomas', 'Henry David Thoreau']
  },
  'Promethean, Melioristic': {
    term: 'Promethean Meliorism',
    category: 'Disposition',
    plainSummary:
      'The resolute belief that human ingenuity, technology, and moral development can steadily conquer disease, suffering, and ignorance.',
    inDailyLife:
      'You are a builder who rejects fatalism; you invest in technology, clean solutions, and systems that leave tomorrow better than yesterday.',
    keyThinkers: ['Francis Bacon', 'Karl Popper', 'Ray Kurzweil']
  },
  'Serene, Presentist': {
    term: 'Serene Presentism',
    category: 'Disposition',
    plainSummary:
      'Grounding your attention entirely in the immediate, living present—freed from past regrets and anxious future projections.',
    inDailyLife:
      'You savor small sensory textures (a hot cup of tea, the breeze, current work), keeping a calm, uncluttered nervous system.',
    keyThinkers: ['Epicurus', 'Laozi', 'Eckhart Tolle', 'Thich Nhat Hanh']
  },
  'Lucid, Unflinching': {
    term: 'Lucid Realism',
    category: 'Disposition',
    plainSummary:
      'A fearless commitment to seeing things precisely as they are, without psychological crutches, false illusions, or sugar-coating.',
    inDailyLife:
      'People seek your counsel because you tell the unvarnished truth; you diagnose problems without panic and act with steady poise.',
    keyThinkers: ['Marcus Aurelius', 'Arthur Schopenhauer', 'Joan Didion']
  },
  'Forward-Looking': {
    term: 'Futurism & Meliorism',
    category: 'Disposition',
    plainSummary:
      'An orientation toward building the future, believing that progress is not automatic but achieved through deliberate human initiative.',
    inDailyLife:
      'You think in decades, plant trees under whose shade you may never sit, and prioritize enduring progress over short-term gratification.',
    keyThinkers: ['H.G. Wells', 'Buckminster Fuller', 'Stewart Brand']
  },
  'Equanimous': {
    term: 'Equanimity (Ataraxia)',
    category: 'Disposition',
    plainSummary:
      'An unshakeable psychological calm that remains steady whether receiving sudden praise, crushing loss, or quiet obscurity.',
    inDailyLife:
      'You are the calm in the room during a crisis; you do not let external chaos dictate your internal peace.',
    keyThinkers: ['Epictetus', 'Pyrrho', 'Zeno of Citium', 'Shantideva']
  },

  // === 3. Ethics / Conduct ===
  'Stoic': {
    term: 'Stoic Virtue Ethics',
    category: 'Ethics',
    plainSummary:
      'The moral conviction that virtue (wisdom, courage, justice, and moderation) is the sole true good, and that peace comes from mastering what is in your control.',
    inDailyLife:
      'You govern your impulses, take full ownership of your reactions, fulfill duties faithfully, and let go of what you cannot alter.',
    keyThinkers: ['Marcus Aurelius', 'Seneca', 'Epictetus']
  },
  'Cosmopolitan Stoic': {
    term: 'Cosmopolitan Stoicism',
    category: 'Ethics',
    plainSummary:
      'Combining disciplined inner self-mastery with a universal moral circle—viewing all human beings as equal citizens of a shared global community.',
    inDailyLife:
      'You treat strangers with the same ethical duty as family, refusing petty tribalism and working for the universal public good.',
    keyThinkers: ['Hierocles', 'Marcus Aurelius', 'Cicero']
  },
  'Utilitarian Architect': {
    term: 'Utilitarian Consequentialism',
    category: 'Ethics',
    plainSummary:
      'The principle that the moral worth of an action is determined by its tangible results: maximizing flourishing and minimizing suffering for all affected.',
    inDailyLife:
      'You focus on practical impact over moral posturing; you look at facts and consequences, asking: "Does this action measurably help people?"',
    keyThinkers: ['Jeremy Bentham', 'John Stuart Mill', 'Peter Singer']
  },
  'Kantian Constitutionalist': {
    term: 'Kantian Deontology',
    category: 'Ethics',
    plainSummary:
      'The duty to act strictly on universal moral principles, never treating another human being merely as a tool or means to an end.',
    inDailyLife:
      'You keep your word even when it costs you; you refuse to cheat or cut corners because you hold your integrity to universal standards.',
    keyThinkers: ['Immanuel Kant', 'John Rawls', 'W.D. Ross']
  },
  'Sentientist Humanist': {
    term: 'Sentientist Ethics',
    category: 'Ethics',
    plainSummary:
      'Expanding compassion and moral responsibility to all living beings capable of feeling pain and joy, human and animal alike.',
    inDailyLife:
      'You care deeply about animal welfare, ecological preservation, and vulnerable lives, refusing to exploit the weak for personal convenience.',
    keyThinkers: ['Peter Singer', 'Tom Regan', 'Albert Schweitzer']
  },
  'Daoist Harmonist': {
    term: 'Daoist Harmony (Wu-Wei)',
    category: 'Ethics',
    plainSummary:
      'Living in effortless alignment with the natural grain of reality (the Dao), practicing restraint, humility, and non-coercive action.',
    inDailyLife:
      'You accomplish great things without violent force or rigid friction; you know when to yield, when to act, and when to let things resolve naturally.',
    keyThinkers: ['Laozi', 'Zhuangzi', 'Liezi']
  },
  'Lucid Epicurean': {
    term: 'Epicurean Moderation',
    category: 'Ethics',
    plainSummary:
      'Seeking tranquil happiness through modest living, close philosophical friendships, and freeing the mind from unnecessary anxieties and superstitions.',
    inDailyLife:
      'You avoid drama, rat races, and ostentatious consumerism; you find deep joy in quiet meals with trusted friends and intellectual peace.',
    keyThinkers: ['Epicurus', 'Lucretius', 'Michel de Montaigne']
  },
  'Eudaimonic Artisan': {
    term: 'Aristotelian Eudaimonia',
    category: 'Ethics',
    plainSummary:
      'The pursuit of human flourishing through the continuous cultivation of excellence, craft, practical wisdom, and balanced living.',
    inDailyLife:
      'You take genuine pride in doing things with craftsmanship; you hone your skills and character over years of patient practice.',
    keyThinkers: ['Aristotle', 'Alasdair MacIntyre', 'Richard Sennett']
  },
  'Existential Vitalist': {
    term: 'Existential Self-Authorship',
    category: 'Ethics',
    plainSummary:
      'The conviction that existence precedes essence: you are not born with a pre-assigned purpose, but must courageously author your own values through action.',
    inDailyLife:
      'You take complete personal responsibility for your choices, rejecting conformity and living with bold authenticity.',
    keyThinkers: ['Jean-Paul Sartre', 'Simone de Beauvoir', 'Friedrich Nietzsche']
  },

  // === 4. Meaning & Teleology Verb Phrases ===
  'inhabiting the luminous grace of the passing hour': {
    term: 'The Savoring Presence',
    category: 'Meaning & Teleology',
    plainSummary:
      'Discovering sacred meaning not in distant monuments or future promises, but in the immediate, breathtaking richness of the present moment.',
    inDailyLife:
      'You do not rush through today to get to tomorrow; you find profound completeness in the simple, quiet reality of here and now.',
    keyThinkers: ['Epicurus', 'Zhuangzi', 'Matsuo Bashō', 'Ralph Waldo Emerson']
  },
  'forging conscious order': {
    term: 'The Antientropic Forge',
    category: 'Meaning & Teleology',
    plainSummary:
      'Finding life’s purpose in pushing back against physical and moral disorder—bringing structure, insight, and harmony to a chaotic world.',
    inDailyLife:
      'You organize messy problems, clarify confusion, build working systems, and create stability for those around you.',
    keyThinkers: ['Norbert Wiener', 'Ilya Prigogine', 'Jordan Peterson']
  },
  'kindling defiant joy and self-authored meaning': {
    term: 'The Absurdist Spark',
    category: 'Meaning & Teleology',
    plainSummary:
      'Celebrating the lack of an imposed cosmic script as the ultimate freedom—creating your own laughter, art, and meaning out of pure courage.',
    inDailyLife:
      'When things go wrong, you smile, roll up your sleeves, and dance anyway; you write your own rules and refuse to let cynicism win.',
    keyThinkers: ['Albert Camus', 'Friedrich Nietzsche', 'Kazantzakis (Zorba)']
  },
  'weaving enduring ripples of relational care': {
    term: 'The Relational Web',
    category: 'Meaning & Teleology',
    plainSummary:
      'Measuring life’s significance by the warmth, safety, healing, and love you leave etched into the hearts and lives of other people.',
    inDailyLife:
      'You invest deeply in relationships, listen closely to others, offer forgiveness, and create environments where people feel cherished.',
    keyThinkers: ['Martin Buber', 'Emmanuel Levinas', 'Irvin Yalom']
  },
  'architecting monuments of awakening intelligence': {
    term: 'The Promethean Project',
    category: 'Meaning & Teleology',
    plainSummary:
      'Devoting your mortal energy to elevating human knowledge, building technological breakthroughs, and enabling consciousness to flourish across generations.',
    inDailyLife:
      'You dedicate yourself to ambitious creative or technical pursuits that will outlast your biological life and empower humanity.',
    keyThinkers: ['Francis Bacon', 'G.W. Leibniz', 'Nikola Tesla', 'Carl Sagan']
  },
  'sculpting authentic essence and lasting craft': {
    term: 'The Autotelic Artisan',
    category: 'Meaning & Teleology',
    plainSummary:
      'Finding fulfillment in patient, disciplined creation—imposing deliberate form onto matter, code, or ideas for the sheer joy of craft.',
    inDailyLife:
      'You lose yourself in deep focus and flow; you treat your work as an art form and take pride in doing every detail right.',
    keyThinkers: ['Aristotle', 'John Ruskin', 'Jiro Ono', 'Richard Sennett']
  },
  'fulfilling an unwritten teleological mandate': {
    term: 'The Implicit Calling',
    category: 'Meaning & Teleology',
    plainSummary:
      'Feeling an intuitive, quiet sense of duty that you were placed here to play a specific, irreplaceable part in the unfolding cosmic tapestry.',
    inDailyLife:
      'You pay attention to synchronicities and inner moral callings, striving to align your daily choices with what you feel you were meant to do.',
    keyThinkers: ['Carl Jung', 'Marcus Aurelius', 'Dag Hammarskjöld']
  },

  // === 5. Cosmic Horizon Anchors ===
  'within the unbroken ocean of non-dual consciousness': {
    term: 'Oceanic Non-Duality',
    category: 'Cosmic Horizon',
    plainSummary:
      'The cosmic perspective that your individual ego is like a wave on the sea: temporary in form, but eternally part of one unbroken ocean of universal awareness.',
    inDailyLife:
      'You look at death without terror, recognizing it not as total destruction, but as a drop of water peacefully returning to its source.',
    keyThinkers: ['Adi Shankara (Advaita)', 'Spinoza', 'Alan Watts', 'Erwin Schrödinger']
  },
  'toward a post-biological cosmic horizon': {
    term: 'The Transhuman Horizon',
    category: 'Cosmic Horizon',
    plainSummary:
      'The horizon that sees humanity’s future beyond the confines of fragile biology—expanding intelligence into digital substrates, cybernetics, and deep space.',
    inDailyLife:
      'You look forward to scientific breakthroughs in longevity, AI, and space exploration, seeing conscious intelligence as an expanding cosmic flame.',
    keyThinkers: ['Vernor Vinge', 'Ray Kurzweil', 'Hans Moravec', 'Nick Bostrom']
  },
  'from thermodynamic chaos before the quiet curtain of oblivion': {
    term: 'Epicurean Oblivion',
    category: 'Cosmic Horizon',
    plainSummary:
      'The peaceful realization that death is simply non-existence—identical to the millions of years before you were born. Where you are, death is not; where death is, you are not.',
    inDailyLife:
      'Knowing this is your one finite shot gives today immense rarity and preciousness; you don’t waste hours worrying about an afterlife.',
    keyThinkers: ['Epicurus', 'Lucretius', 'Mark Twain', 'Bertrand Russell']
  },
  'across the living biosphere\'s eternal cycle of renewal': {
    term: 'Biogeochemical Immortality',
    category: 'Cosmic Horizon',
    plainSummary:
      'The material reality that every atom of your body was forged in ancient stars and will be recycled directly into soil, trees, oceans, and future life.',
    inDailyLife:
      'You feel a deep, comforting kinship with the natural earth; your physical death is simply passing the baton to tomorrow’s forest.',
    keyThinkers: ['Lucretius', 'Baruch Spinoza', 'Aldo Leopold', 'Robin Wall Kimmerer']
  },
  'within the indestructible fabric of quantum information': {
    term: 'Quantum Informational Conservation',
    category: 'Cosmic Horizon',
    plainSummary:
      'The modern physical perspective that according to quantum unitarity, the fundamental information describing your physical state can never be truly erased from the universe.',
    inDailyLife:
      'You take comfort in physical law: every action, word, and photon of light that bounced off you has forever altered the causal future of reality.',
    keyThinkers: ['Leonard Susskind', 'Stephen Hawking', 'John Wheeler']
  },
  'from thermodynamic chaos': {
    term: 'Antientropic Emergence',
    category: 'Cosmic Horizon',
    plainSummary:
      'The sheer wonder that against the cold universal pull of entropy and disorder, conscious life managed to kindle, think, and love at all.',
    inDailyLife:
      'You treat each day as an astounding victory against the cold odds of the universe.',
    keyThinkers: ['Erwin Schrödinger', 'Ludwig Boltzmann', 'Sean Carroll']
  }
};

