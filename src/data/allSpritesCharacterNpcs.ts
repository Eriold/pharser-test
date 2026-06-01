import type { NpcDefinition } from "../systems/npc/NpcTypes";

const allSpritesSheet = {
  key: "all-sprites-characters",
  path: "/assets/sprites/all-sprites-characters.png",
  frameWidth: 96,
  frameHeight: 108
};

const sharedBody = {
  displayWidth: 70,
  displayHeight: 79,
  bodyWidth: 36,
  bodyHeight: 20,
  bodyOffsetX: 30,
  bodyOffsetY: 84
};

function createSheetNpc(
  id: string,
  name: string,
  x: number,
  y: number,
  frame: number,
  dialogueText: string
): NpcDefinition {
  return {
    id,
    name,
    sprite: allSpritesSheet,
    portrait: {
      key: `character-${id}`,
      path: `/assets/character-${id}.png`
    },
    dialogueText,
    dialogueTextSpeedMs: 24,
    routeOptions: [],
    correctRoute: [],
    spawnRandomly: false,
    x,
    y,
    frame,
    ...sharedBody
  };
}

export const ALL_SPRITES_CHARACTER_NPCS: NpcDefinition[] = [
  createSheetNpc("g2-npc", "Danila", 160, 160, 0, "Hello, I am Danila."),
  createSheetNpc("w1-npc", "Sidney", 576, 128, 1, "Hello, I am Sidney."),
  createSheetNpc("g3-npc", "Ruby", 1216, 192, 2, "Hello, I am Ruby."),
  createSheetNpc("bg-npc", "Luna Roberta", 192, 448, 3, "Hello, I am Luna Roberta."),
  createSheetNpc("g4-npc", "Bekky", 960, 448, 4, "Hello, I am Bekky."),
  createSheetNpc("b2-npc", "Charles", 1408, 768, 5, "Hello, I am Charles.")
];
