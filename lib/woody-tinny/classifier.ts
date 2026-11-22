/**
 * Woody vs. Tinny phonetic/orthographic scoring breakdown.
 * Computes human-readable reasons on the fly so D1 stays lean.
 */

const DIGRAPH_WEIGHTS: Record<string, [number, string]> = {
  our: [3.6, "rounded rhotic /ɔːr/ or /aʊər/"],
  igh: [1.8, "diphthong /aɪ/ (warm)"],
  ert: [2.0, "stressed rhotic /ɜːrt/"],
  ist: [-0.6, "agentive suffix"],
  oo: [2.6, "back rounded vowel /uː/"],
  ou: [2.5, "rounded diphthong /aʊ/ or /uː/"],
  ow: [2.4, "rounded diphthong /aʊ/ or /oʊ/"],
  au: [2.4, "low back vowel /ɔː/"],
  aw: [2.4, "low back vowel /ɔː/"],
  uu: [2.4, "double u resonance"],
  or: [2.4, "rhotic back vowel /ɔːr/"],
  er: [1.4, "mid-central rhotic /ɜːr/ or /ər/"],
  ar: [1.4, "open back rhotic /ɑːr/"],
  ur: [2.0, "mid-central rhotic /ɜːr/"],
  ng: [1.6, "velar nasal resonance"],
  ml: [3.4, "warm bilabial-liquid sonorant cluster"],
  th: [0.9, "dental fricative"],
  wa: [2.2, "labiovelar rounded /wɒ/"],
  wo: [2.2, "labiovelar rounded /wʊ/"],
  zo: [2.2, "voiced sibilant + round vowel"],
  ge: [0.8, "soft voiced affricate /dʒ/"],
  ff: [0.8, "warm labiodental coda"],
  ea: [-2.4, "high front vowel /iː/"],
  ee: [-1.2, "high front vowel /iː/"],
  ew: [-1.2, "palatal glide /juː/"],
  tt: [-2.0, "geminate voiceless alveolar stop"],
  pp: [-2.0, "geminate voiceless bilabial stop"],
  kk: [-2.0, "geminate voiceless velar stop"],
  ck: [-1.5, "sharp voiceless velar stop"],
  sp: [-1.2, "sharp sibilant-plosive cluster"],
  st: [-1.0, "sharp sibilant-plosive cluster"],
  sk: [-1.2, "sharp sibilant-plosive cluster"],
  ti: [-1.5, "sharp alveolar + high front vowel"],
  si: [-1.5, "sharp sibilant + high front vowel"],
  pi: [-1.5, "sharp bilabial + high front vowel"],
  ki: [-1.5, "sharp velar + high front vowel"],
  ci: [-1.2, "sharp sibilant + high front vowel"],
};

const CHAR_WEIGHTS: Record<string, [number, string]> = {
  o: [2.2, "rounded back vowel"],
  u: [1.6, "back/central vowel"],
  a: [0.2, "open vowel"],
  e: [-0.4, "mid-front vowel"],
  i: [-1.4, "high front vowel"],
  y: [-0.4, "high front / palatal"],
  w: [1.8, "labiovelar glide"],
  v: [2.3, "voiced labiodental fricative"],
  b: [1.2, "voiced bilabial stop"],
  g: [1.1, "voiced velar stop"],
  z: [1.4, "voiced sibilant"],
  m: [1.1, "bilabial nasal"],
  d: [1.1, "voiced alveolar stop"],
  l: [0.8, "alveolar lateral liquid"],
  r: [0.9, "rhotic liquid"],
  n: [0.2, "alveolar nasal"],
  j: [1.0, "voiced affricate"],
  f: [0.3, "labiodental fricative"],
  h: [0.2, "glottal fricative"],
  t: [-1.1, "voiceless alveolar stop"],
  p: [-1.2, "voiceless bilabial stop"],
  k: [-1.4, "voiceless velar stop"],
  s: [-1.0, "voiceless sibilant"],
  c: [-0.8, "voiceless stop/sibilant"],
  x: [-1.2, "sharp cluster /ks/"],
  q: [-0.6, "voiceless velar"],
};

export function explainWord(text: string): string[] {
  const tokens = text.match(/[a-zA-Z]+/g) ?? [];
  const reasons: string[] = [];

  for (const raw of tokens) {
    const w = raw.toLowerCase();
    if (!w) continue;

    if (w.length <= 5 && !/[aeiouy]/.test(w)) {
      reasons.push("acronym/initialism (high front /iː/ letter names)");
    }

    let i = 0;
    if (w.startsWith("y") && w.length > 1) {
      reasons.push("+1.0 initial 'y' glide");
      i = 1;
    }

    let effectiveEnd = w.length;
    if (w.length > 3 && w.endsWith("e") && !/(ee|ie|ye)$/.test(w)) {
      effectiveEnd -= 1;
    }

    while (i < effectiveEnd) {
      let matched = false;
      for (const len of [3, 2]) {
        if (i + len <= w.length) {
          const sub = w.slice(i, i + len);
          const entry = DIGRAPH_WEIGHTS[sub];
          if (entry) {
            const [wt, desc] = entry;
            reasons.push(`${wt >= 0 ? "+" : ""}${wt.toFixed(1)} '${sub}' (${desc})`);
            i += len;
            matched = true;
            break;
          }
        }
      }
      if (matched) continue;

      const ch = w[i];
      const entry = CHAR_WEIGHTS[ch];
      if (entry) {
        const [wt, desc] = entry;
        reasons.push(`${wt >= 0 ? "+" : ""}${wt.toFixed(1)} '${ch}' (${desc})`);
      }
      i += 1;
    }
  }

  return reasons;
}
