import type Phaser from "phaser";
import type { NpcRouteFlowDefinition } from "./NpcRouteTypes";

export type NpcResultState = "idle" | "thinking" | "happy" | "angry";

export type NpcSpriteConfig = {
  key: string;
  path: string;
  frameWidth: number;
  frameHeight: number;
  spacing?: number;
};

export type NpcDefinition = {
  id: string;
  name: string;
  sprite: NpcSpriteConfig;
  portrait: {
    key: string;
    path: string;
  };
  audio?: {
    key: string;
    path: string;
  };
  dialogueText: string;
  dialogueTextSpeedMs?: number;
  successDialogueText?: string;
  successDialogueTextSpeedMs?: number;
  successAutoCloseDelayMs?: number;
  routeOptions: string[];
  correctRoute: string[];
  routeFlow?: NpcRouteFlowDefinition;
  frame?: number;
  x: number;
  y: number;
  displayWidth: number;
  displayHeight: number;
  bodyWidth: number;
  bodyHeight: number;
  bodyOffsetX: number;
  bodyOffsetY: number;
};

export type NpcEntry = {
  definition: NpcDefinition;
  sprite: Phaser.Physics.Arcade.Sprite;
  indicatorBox: Phaser.GameObjects.Rectangle;
  indicatorLabel: Phaser.GameObjects.Text;
  resultState: NpcResultState;
};
