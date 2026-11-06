import { SCENARIOS } from "../data/scenarios";

const STORAGE_KEY = "philosophical_quiz_state_v1";

/**
 * Encodes a map of { S01: "S01_A", S02: "S02_C", ... } into a compact 16-char string like "ACAB..."
 */
export function encodeAnswersToParam(answers: Record<string, string>): string {
  return SCENARIOS.map((s) => {
    const chosenId = answers[s.id];
    if (!chosenId) return "-";
    const opt = s.options.find((o) => o.id === chosenId);
    return opt ? opt.key : "-";
  }).join("");
}

/**
 * Decodes a compact 16-char string like "ACAB..." back into { S01: "S01_A", ... }
 */
export function decodeParamToAnswers(param: string | null): Record<string, string> | null {
  if (!param || param.length !== SCENARIOS.length) return null;
  const answers: Record<string, string> = {};
  for (let i = 0; i < SCENARIOS.length; i++) {
    const ch = param[i].toUpperCase();
    if (ch === "-") continue;
    const scenario = SCENARIOS[i];
    const opt = scenario.options.find((o) => o.key === ch);
    if (opt) {
      answers[scenario.id] = opt.id;
    }
  }
  return Object.keys(answers).length > 0 ? answers : null;
}

export function saveStateToLocal(answers: Record<string, string>, currentStepIndex: number, isCompleted: boolean) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ answers, currentStepIndex, isCompleted })
    );
  } catch {
    // Ignore storage quota / privacy errors
  }
}

export function loadStateFromLocal(): {
  answers: Record<string, string>;
  currentStepIndex: number;
  isCompleted: boolean;
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.answers === "object") {
      return {
        answers: parsed.answers,
        currentStepIndex: typeof parsed.currentStepIndex === "number" ? parsed.currentStepIndex : 0,
        isCompleted: Boolean(parsed.isCompleted)
      };
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

export function clearLocalState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
