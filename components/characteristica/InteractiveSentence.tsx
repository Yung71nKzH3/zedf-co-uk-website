import React, { useState } from 'react';
import { GlossaryEntry, lookupGlossary } from '../../data/philosophicalGlossary';
import { BookOpen, Sparkles, X, Lightbulb, Users, HelpCircle } from 'lucide-react';

interface InteractiveSentenceProps {
  parts: {
    article: string;
    epistemology: string;
    disposition: string;
    ethicsNoun: string;
    teleologyVerbPhrase: string;
    horizonAnchor: string;
  };
}

export const InteractiveSentence: React.FC<InteractiveSentenceProps> = ({ parts }) => {
  const [activeTokenKey, setActiveTokenKey] = useState<string | null>(null);
  const [activeEntry, setActiveEntry] = useState<GlossaryEntry | null>(() => {
    return lookupGlossary(parts.epistemology) || null;
  });

  const handleSelectToken = (phrase: string, key: string) => {
    if (activeTokenKey === key) {
      // Toggle off if clicking the same one again
      setActiveTokenKey(null);
      setActiveEntry(null);
    } else {
      setActiveTokenKey(key);
      const entry = lookupGlossary(phrase);
      if (entry) {
        setActiveEntry(entry);
      }
    }
  };

  const handleHoverToken = (phrase: string, key: string) => {
    setActiveTokenKey(key);
    const entry = lookupGlossary(phrase);
    if (entry) {
      setActiveEntry(entry);
    }
  };

  const tokens = [
    { key: 'epistemology', text: parts.epistemology, phrase: parts.epistemology, comma: ',' },
    { key: 'disposition', text: parts.disposition, phrase: parts.disposition, comma: '' },
    { key: 'ethics', text: parts.ethicsNoun, phrase: parts.ethicsNoun, comma: '' },
    { key: 'teleology', text: parts.teleologyVerbPhrase, phrase: parts.teleologyVerbPhrase, comma: '' },
    { key: 'horizon', text: parts.horizonAnchor, phrase: parts.horizonAnchor, comma: '.' }
  ];

  return (
    <div className="space-y-4 my-6">
      {/* Helper guide pill */}
      <div className="flex items-center gap-1.5 text-xs font-mono-code opacity-75">
        <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
        <span>Hover or tap any highlighted phrase below to reveal what it reveals about your life:</span>
      </div>

      {/* The Interactive Grand Sentence */}
      <blockquote className="font-serif-philo text-2xl sm:text-3xl lg:text-4xl font-semibold leading-relaxed tracking-tight p-4 sm:p-6 rounded-2xl border transition-all"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        <span className="opacity-70 mr-2">“{parts.article}</span>
        {tokens.map((t, idx) => {
          const isSelected = activeTokenKey === t.key;
          return (
            <React.Fragment key={t.key}>
              <button
                type="button"
                onClick={() => handleSelectToken(t.phrase, t.key)}
                onMouseEnter={() => handleHoverToken(t.phrase, t.key)}
                className={`inline-block px-1.5 py-0.5 my-1 mx-0.5 rounded-lg border text-left transition-all cursor-pointer font-serif-philo font-semibold ${
                  isSelected
                    ? 'border-amber-400 bg-amber-400/20 text-amber-300 shadow-sm'
                    : 'border-dashed border-amber-400/40 hover:border-amber-400 hover:bg-amber-400/10 text-[var(--text-primary)]'
                }`}
                title={`Click or hover to define ${t.phrase}`}
                aria-expanded={isSelected}
              >
                {t.text}
              </button>
              {t.comma && <span className="opacity-70 mr-1.5">{t.comma}</span>}
              {idx < tokens.length - 1 && !t.comma && <span className="opacity-50"> </span>}
            </React.Fragment>
          );
        })}
        <span className="opacity-70 ml-1">”</span>
      </blockquote>

      {/* Active Glossary Popover Card */}
      {activeEntry ? (
        <div
          className="rounded-2xl border p-5 sm:p-6 transition-all animate-fadeIn shadow-md relative"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--accent-gold)'
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-mono-code uppercase tracking-wider px-2 py-0.5 rounded-full border font-semibold"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--accent-gold)',
                    color: 'var(--accent-gold)'
                  }}
                >
                  {activeEntry.category}
                </span>
                <span className="text-xs font-mono-code opacity-55">Philosophical Concept</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif-philo font-bold tracking-tight text-amber-300">
                {activeEntry.term}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTokenKey(null);
                setActiveEntry(null);
              }}
              className="p-1 rounded-lg border opacity-60 hover:opacity-100 transition-opacity"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-subtle)'
              }}
              title="Close card"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Plain Summary */}
          <div className="mb-4">
            <h4 className="text-xs font-mono-code uppercase tracking-wider opacity-60 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              In Simple Terms:
            </h4>
            <p className="text-sm sm:text-base leading-relaxed text-[var(--text-primary)]">
              {activeEntry.plainSummary}
            </p>
          </div>

          {/* In Daily Life */}
          <div className="mb-4 p-3.5 rounded-xl border"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-subtle)'
            }}
          >
            <h4 className="text-xs font-mono-code uppercase tracking-wider opacity-70 mb-1 flex items-center gap-1.5 text-amber-300">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              What This Looks Like in Your Life:
            </h4>
            <p className="text-sm leading-relaxed opacity-90">
              {activeEntry.inDailyLife}
            </p>
          </div>

          {/* Key Thinkers */}
          {activeEntry.keyThinkers && activeEntry.keyThinkers.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-dashed"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <span className="text-xs font-mono-code opacity-60 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                Archetypal Thinkers:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeEntry.keyThinkers.map((thinker) => (
                  <span
                    key={thinker}
                    className="text-xs font-mono-code px-2 py-0.5 rounded border"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {thinker}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className="p-4 rounded-xl border border-dashed text-center text-xs font-mono-code opacity-60"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          Hover over or click any underlined word in the sentence above to view its plain-English meaning and real-world impact.
        </div>
      )}
    </div>
  );
};
