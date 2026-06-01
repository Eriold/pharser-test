export type RouteToken = {
  id: string;
  label: string;
};

export type RouteChoice = {
  id: string;
  label: string;
  correct: boolean;
};

export type RoutePalette = {
  panel: string;
  prompt: string;
  helper: string;
  tokenIdleBg: string;
  tokenSelectedBg: string;
  tokenText: string;
  tokenBorder: string;
  phraseBg: string;
  phraseBorder: string;
  actionIdleBg: string;
  actionReadyBg: string;
  actionText: string;
  choiceIdleBg: string;
  choiceSelectedBg: string;
  choiceCorrectBg: string;
  choiceWrongBg: string;
  resetBg: string;
  resetText: string;
};

export type RouteArrangeStage = {
  kind: "arrange";
  prompt: string;
  tokens: RouteToken[];
  answerTokenIds: string[];
  actionLabel?: string;
  palette: RoutePalette;
};

export type RouteChoiceStage = {
  kind: "choice";
  prompt: string;
  choices: RouteChoice[];
  actionLabel?: string;
  palette: RoutePalette;
};

export type RouteStage = RouteArrangeStage | RouteChoiceStage;

export type NpcRouteFlowDefinition = {
  panelHeight: number;
  stages: RouteStage[];
};
