import { PhilosophicalArchetype } from "../types/schema";

export const ARCHETYPES: Record<string, PhilosophicalArchetype> = {
  sovereign_stoic: {
    id: "sovereign_stoic",
    name: "The Sovereign Stoic",
    latinTitle: "Imperator Mentis · Citadel of Logos",
    tagline: "Governing the internal citadel with lucid reason while embracing cosmic necessity.",
    description:
      "You distinguish with surgical precision between what lies within your agency and the vast deterministic machinery of the external cosmos. Rather than demanding that reality bend to your desires, you align your judgment with nature's law—finding unshakeable freedom in self-mastery, private integrity, and Amor Fati.",
    kin: [
      {
        name: "Marcus Aurelius",
        era: "121–180 CE",
        tradition: "Roman Stoicism",
        quote: "The impediment to action advances action. What stands in the way becomes the way.",
        resonanceReason: "Shares your devotion to civic duty, inner equanimity, and viewing obstacles as fuel for virtue."
      },
      {
        name: "Baruch Spinoza",
        era: "1632–1677",
        tradition: "Continental Rationalism",
        quote: "Peace is not an absence of war, it is a virtue, a state of mind, a disposition for benevolence.",
        resonanceReason: "Mirrors your reverence for deterministic natural order and intellectual love of the universe."
      }
    ],
    rival: {
      name: "Aristippus of Cyrene",
      era: "435–356 BCE",
      tradition: "Cyrenaic Hedonism",
      quote: "The art of life lies in taking pleasures as they pass.",
      resonanceReason: "Rejects disciplined self-restraint and teleological duty in favor of immediate, impulsive sensory gratification."
    },
    shadow: {
      title: "The Fortress of Frost",
      blindSpot: "Mistaking emotional suppression for wisdom and retreating so deeply into the inner citadel that genuine human vulnerability cannot reach you.",
      psychologicalRisk: "Affective numbing and quiet alienation from the messy, irrational warmth of grief and ecstatic joy.",
      philosophicalAntidote: "Integrate Buber's 'I-Thou' relational vulnerability—allowing your heart to break open without losing your moral spine."
    }
  },
  absurdist_rebel: {
    id: "absurdist_rebel",
    name: "The Absurdist Rebel",
    latinTitle: "Homo Ludens Defians · Dancer in the Void",
    tagline: "Smiling into the cosmic silence and transmuting friction into vitalist art.",
    description:
      "You look directly into the cold, unscripted silence of the universe without blinking—and refuse both despair and comforting fairy tales. For you, the absence of a pre-written cosmic meaning is the ultimate liberation: an open canvas to roll the boulder with defiant joy, passion, and fierce authenticity.",
    kin: [
      {
        name: "Albert Camus",
        era: "1913–1960",
        tradition: "French Absurdism",
        quote: "The struggle itself toward the heights is enough to fill a human heart. One must imagine Sisyphus happy.",
        resonanceReason: "Captures your lucid rebellion against meaninglessness through passion, revolt, and lived intensity."
      },
      {
        name: "Friedrich Nietzsche",
        era: "1844–1900",
        tradition: "Existential Vitalism",
        quote: "One must still have chaos in oneself to be able to give birth to a dancing star.",
        resonanceReason: "Echoes your instinct to transmute suffering into creative power and affirm life without reservation."
      }
    ],
    rival: {
      name: "Arthur Schopenhauer",
      era: "1788–1860",
      tradition: "Pessimistic Idealism",
      quote: "Life swings like a pendulum backward and forward between pain and boredom.",
      resonanceReason: "Looks at the same unscripted cosmos and counsels ascetic withdrawal rather than your defiant celebration."
    },
    shadow: {
      title: "The Sisyphus Burnout",
      blindSpot: "Addiction to perpetual struggle and intensity, making peaceful stillness or ordinary routine feel like existential surrender.",
      psychologicalRisk: "Exhaustion from treating every quiet afternoon as a battle against the void.",
      philosophicalAntidote: "Temper your Dionysian fire with Epicurean garden stillness—recognizing that serenity is not surrender."
    }
  },
  promethean_architect: {
    id: "promethean_architect",
    name: "The Promethean Architect",
    latinTitle: "Faber Futuri · Engineer of Ascent",
    tagline: "Decoding nature through empirical rigor to conquer entropy and elevate consciousness.",
    description:
      "You refuse to treat human limitations, disease, or thermodynamic decay as sacred boundaries. Armed with empirical verification, pragmatic experimentation, and systemic ethics, you see humanity as nature's way of waking up and re-engineering the universe toward higher complexity and flourishing.",
    kin: [
      {
        name: "Karl Popper",
        era: "1902–1994",
        tradition: "Critical Rationalism",
        quote: "All life is problem solving.",
        resonanceReason: "Aligns with your fallibilist scientific method—progressing endlessly through bold conjecture and rigorous testing."
      },
      {
        name: "John Stuart Mill",
        era: "1806–1873",
        tradition: "Reformist Utilitarianism",
        quote: "The worth of a State, in the long run, is the worth of the individuals composing it.",
        resonanceReason: "Shares your drive to measurably expand human flourishing and dismantle archaic suffering."
      }
    ],
    rival: {
      name: "Diogenes of Sinope",
      era: "412–323 BCE",
      tradition: "Classical Cynicism",
      quote: "Man is the most intelligent of the animals—and the most silly.",
      resonanceReason: "Mocks technological progress, civilizational ambition, and material complexity as vain distractions."
    },
    shadow: {
      title: "The Instrumental Trap",
      blindSpot: "Reducing every mystery, relationship, and afternoon into an optimization problem or stepping-stone toward a future horizon.",
      psychologicalRisk: "Inability to inhabit the unoptimized present; viewing your own fragile biology with impatience rather than grace.",
      philosophicalAntidote: "Practice Daoist Wu-Wei and Zen presentism—honoring things that have no utility other than simply being."
    }
  },
  oceanic_mystic: {
    id: "oceanic_mystic",
    name: "The Oceanic Harmonist",
    latinTitle: "Anima Mundi · Navigator of the Way",
    tagline: "Flowing effortlessly with the grain of nature while resting in non-dual awareness.",
    description:
      "Beneath the noisy theatre of separate egos and rigid categories, you sense a seamless, interconnected continuum. Rather than forcing reality through brute friction, you practice effortless alignment (Wu-Wei), ecological reverence, and quiet wonder—knowing the observer and the cosmos are a single breathing whole.",
    kin: [
      {
        name: "Zhuangzi (Chuang Tzu)",
        era: "369–286 BCE",
        tradition: "Classical Daoism",
        quote: "Flow with whatever may happen, and let your mind be free: Stay centered by accepting whatever you are doing.",
        resonanceReason: "Embodies your spontaneous playfulness, perspectival humility, and effortless harmony with nature's current."
      },
      {
        name: "Adi Shankara",
        era: "700–750 CE",
        tradition: "Advaita Vedanta",
        quote: "The wave is the same as the ocean, though it rises under a temporary name.",
        resonanceReason: "Articulates your intuition that individual consciousness is a localized aperture of universal awareness."
      }
    ],
    rival: {
      name: "Francis Bacon",
      era: "1561–1626",
      tradition: "Promethean Empiricism",
      quote: "Knowledge and human power are synonymous.",
      resonanceReason: "Views nature as raw mechanical resource to be dissected and commanded rather than harmonized with."
    },
    shadow: {
      title: "The Drift of Quietism",
      blindSpot: "Dissolving moral urgency into cosmic acceptance so completely that structural injustice or personal boundaries go unchallenged.",
      psychologicalRisk: "Spiritual bypassing—using non-dual serenity to avoid necessary confrontation and decisive worldly action.",
      philosophicalAntidote: "Ground your cosmic unity in Kantian or Levinasian ethical responsibility for the concrete individual standing before you."
    }
  },
  kantian_legislator: {
    id: "kantian_legislator",
    name: "The Moral Architect",
    latinTitle: "Custos Legis · Pillar of the Cosmopolis",
    tagline: "Acting from universal principles that could serve as a timeless law for all rational minds.",
    description:
      "You refuse moral shortcuts, tribal favoritism, and opportunistic excuses. Whether under public scrutiny or alone in the dark, your choices are anchored in rational dignity, universal justice, and the sacred covenant that binds conscious agents into a fair civilization.",
    kin: [
      {
        name: "Immanuel Kant",
        era: "1724–1804",
        tradition: "Deontological Idealism",
        quote: "Two things fill the mind with ever new and increasing admiration and awe: the starry heavens above me and the moral law within me.",
        resonanceReason: "Forms the bedrock of your conviction that rational autonomy and universal duty define human worth."
      },
      {
        name: "John Rawls",
        era: "1921–2002",
        tradition: "Contractarian Justice",
        quote: "Justice is the first virtue of social institutions, as truth is of systems of thought.",
        resonanceReason: "Reflects your commitment to designing fair rules from behind a veil of impartiality."
      }
    ],
    rival: {
      name: "Niccolò Machiavelli",
      era: "1469–1527",
      tradition: "Political Realism",
      quote: "It is necessary for a prince wishing to hold his own to know how to do wrong, and to make use of it or not according to necessity.",
      resonanceReason: "Subordinates universal moral law to tactical expedience and raw survival outcomes."
    },
    shadow: {
      title: "The Iron Geometry",
      blindSpot: "Holding yourself and others to such an unforgiving standard of formal principle that human frailty is judged without mercy.",
      psychologicalRisk: "Moral rigidity and chronic guilt when messy lived reality refuses to fit clean categorical imperatives.",
      philosophicalAntidote: "Infuse your universal principles with Aristotelian Phronesis (contextual wisdom) and Wabi-Sabi forgiveness for imperfection."
    }
  },
  existential_artisan: {
    id: "existential_artisan",
    name: "The Existential Artisan",
    latinTitle: "Auctor Sui · Sculptor of Essence",
    tagline: "Condemned to freedom, forging authentic essence through deliberate craft and choice.",
    description:
      "You reject the excuse that genes, upbringing, or destiny wrote your script in advance. Existence precedes essence: you arrive as raw potential and sculpt who you are through every promise kept, every craft mastered, and every courageous leap into the open future.",
    kin: [
      {
        name: "Jean-Paul Sartre",
        era: "1905–1980",
        tradition: "Continental Existentialism",
        quote: "Man is nothing else but that which he makes of himself.",
        resonanceReason: "Echoes your uncompromising belief in radical personal responsibility and self-authorship."
      },
      {
        name: "Simone de Beauvoir",
        era: "1908–1986",
        tradition: "Existential Ethics",
        quote: "To will oneself free is also to will others free.",
        resonanceReason: "Connects your fierce individual agency with ethical solidarity in a shared human world."
      }
    ],
    rival: {
      name: "Pierre-Simon Laplace",
      era: "1749–1827",
      tradition: "Mechanistic Determinism",
      quote: "An intellect which at a certain moment would know all forces... for it, nothing would be uncertain and the future, as the past, would be present to its eyes.",
      resonanceReason: "Reduces your hard-won choices to predetermined billiard balls set in motion at the Big Bang."
    },
    shadow: {
      title: "The Vertigo of Hyper-Agency",
      blindSpot: "Carrying the crushing weight of total responsibility for every outcome, even where biology or systemic luck stacked the deck.",
      psychologicalRisk: "Existential anxiety and relentless self-criticism when confronting unyielding physical limits.",
      philosophicalAntidote: "Balance your Sartrean freedom with compassionate recognition of Heideggerian thrownness and bodily grace."
    }
  },
  epicurean_cartographer: {
    id: "epicurean_cartographer",
    name: "The Lucid Epicurean",
    latinTitle: "Cultor Horti · Connoisseur of Finer Presence",
    tagline: "Savoring the luminous texture of mortal hours in tranquil freedom from fear.",
    description:
      "You see through the hollow treadmill of status, superstition, and frantic ambition. Knowing that our time under the sun is finite, you cultivate a quiet garden of deep friendships, sensory appreciation, intellectual clarity, and gratitude—treating death not as a terror, but as the frame that makes today's canvas priceless.",
    kin: [
      {
        name: "Epicurus",
        era: "341–270 BCE",
        tradition: "Hellenistic Materialism",
        quote: "Not what we have, but what we enjoy, constitutes our abundance.",
        resonanceReason: "Mirrors your focus on measured pleasure, deep friendship, and fearless acceptance of mortality."
      },
      {
        name: "Michel de Montaigne",
        era: "1533–1592",
        tradition: "Renaissance Humanism",
        quote: "The greatest thing in the world is to know how to belong to oneself.",
        resonanceReason: "Shares your gentle skepticism, curiosity about everyday human texture, and anti-dogmatic warmth."
      }
    ],
    rival: {
      name: "Georg Wilhelm Friedrich Hegel",
      era: "1770–1831",
      tradition: "Absolute Idealism",
      quote: "History is not the soil in which happiness grows. The periods of happiness in it are the blank pages of history.",
      resonanceReason: "Sacrifices quiet individual peace on the grand, bloody altar of historical dialectic and cosmic ambition."
    },
    shadow: {
      title: "The Walled Garden",
      blindSpot: "Prioritizing tranquility and pain-avoidance so carefully that you shrink back from high-stakes struggle and transformative risk.",
      psychologicalRisk: "Missing the sublime heights that only emerge when we risk heartbreak and heroic friction.",
      philosophicalAntidote: "Occasionally open the garden gate to Nietzschean daring—risking comfort for a cause larger than peace."
    }
  },
  relational_steward: {
    id: "relational_steward",
    name: "The Relational Steward",
    latinTitle: "Custos Vinculi · Weaver of the Living Web",
    tagline: "Finding sacred truth in the space between minds, where care outlives the self.",
    description:
      "For you, the isolated ego is a fiction; we become real only in communion with others and the living biosphere ('I am because we are'). You measure a life not by cold monuments or abstract theorems, but by the suffering you soften, the trust you shelter, and the invisible ripples of love that echo across generations.",
    kin: [
      {
        name: "Martin Buber",
        era: "1878–1965",
        tradition: "Dialogical Existentialism",
        quote: "All real living is meeting.",
        resonanceReason: "Captures your reverence for the sacred 'I-Thou' encounter over transactional manipulation."
      },
      {
        name: "Confucius (Kong Qiu)",
        era: "551–479 BCE",
        tradition: "Classical Ruism",
        quote: "The humane person, wishing to establish themselves, seeks also to establish others.",
        resonanceReason: "Reflects your grounding in relational harmony, everyday ritual care, and intergenerational stewardship."
      }
    ],
    rival: {
      name: "Max Stirner",
      era: "1806–1856",
      tradition: "Radical Egoism",
      quote: "Nothing is more to me than myself!",
      resonanceReason: "Dismisses communal bonds, altruism, and ethical duty as mere phantoms enslaving the solitary ego."
    },
    shadow: {
      title: "The Porous Vessel",
      blindSpot: "Pouring so much of your identity into caretaking and relational harmony that your own autonomous voice goes unlived.",
      psychologicalRisk: "Empathic exhaustion and losing your center when those around you are in crisis.",
      philosophicalAntidote: "Anchor your boundless empathy with Stoic self-sovereignty—remembering a vessel must be whole to carry water."
    }
  }
};
