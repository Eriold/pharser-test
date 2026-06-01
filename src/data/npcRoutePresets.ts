import type { NpcRouteFlowDefinition, RouteArrangeStage, RouteChoiceStage, RoutePalette, RouteStage } from "../systems/npc/NpcRouteTypes";

export const defaultRoutePalette: RoutePalette = {
  panel: "#101827",
  prompt: "#cfe3ff",
  helper: "#d6dde7",
  tokenIdleBg: "#1e293b",
  tokenSelectedBg: "#2563eb",
  tokenText: "#ffffff",
  tokenBorder: "#5b8def",
  phraseBg: "#0b1220",
  phraseBorder: "#64748b",
  actionIdleBg: "#1d4ed8",
  actionReadyBg: "#16a34a",
  actionText: "#ffffff",
  choiceIdleBg: "#1f2937",
  choiceSelectedBg: "#2563eb",
  choiceCorrectBg: "#16a34a",
  choiceWrongBg: "#b91c1c",
  resetBg: "#6b7280",
  resetText: "#ffffff"
};

export function createRouteFlow(panelHeight: number, stages: RouteStage[]): NpcRouteFlowDefinition {
  return { panelHeight, stages };
}

export function createArrangeStage(
  prefix: string,
  prompt: string,
  tokens: string[],
  actionLabel = "Continue"
): RouteArrangeStage {
  const arrangedTokens = tokens.map((label, index) => ({
    id: `${prefix}-${index + 1}`,
    label
  }));

  return {
    kind: "arrange",
    prompt,
    tokens: arrangedTokens,
    answerTokenIds: arrangedTokens.map(token => token.id),
    actionLabel,
    palette: defaultRoutePalette
  };
}

export function createChoiceStage(
  prefix: string,
  prompt: string,
  choices: Array<{ label: string; correct: boolean }>,
  actionLabel = "Continue"
): RouteChoiceStage {
  return {
    kind: "choice",
    prompt,
    choices: choices.map((choice, index) => ({
      id: `${prefix}-${index + 1}`,
      label: choice.label,
      correct: choice.correct
    })),
    actionLabel,
    palette: defaultRoutePalette
  };
}
