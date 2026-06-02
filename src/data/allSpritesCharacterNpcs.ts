import { assetUrl } from "../utils/assetUrl";
import type { NpcDefinition } from "../systems/npc/NpcTypes";
import { createArrangeStage, createChoiceStage, createRouteFlow } from "./npcRoutePresets";

const allSpritesSheet = {
  key: "all-sprites-characters",
  path: assetUrl("/assets/sprites/all-sprites-characters.png"),
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
  dialogueText: string,
  routeFlow?: NpcDefinition["routeFlow"]
): NpcDefinition {
  return {
    id,
    name,
    sprite: allSpritesSheet,
    portrait: {
      key: `character-${id}`,
      path: assetUrl(`/assets/character-${id}.png`)
    },
    audio: {
      key: `${id}-audio`,
      path: assetUrl(`/assets/sounds/${id}.m4a`)
    },
    dialogueText,
    dialogueTextSpeedMs: 24,
    routeOptions: [],
    correctRoute: [],
    routeFlow,
    spawnRandomly: false,
    x,
    y,
    frame,
    ...sharedBody
  };
}

const sidneyRouteFlow = createRouteFlow(332, [
  createArrangeStage("w1-s1", "Stage 1: build the sentence.", [
    "Continue",
    "Straight",
    "past",
    "the",
    "School."
  ]),
  createArrangeStage("w1-s2", "Stage 2: build the sentence.", [
    "Continue",
    "Straight",
    "past",
    "the",
    "Bank."
  ]),
  createArrangeStage("w1-s3", "Stage 3: build the sentence.", [
    "Continue",
    "Straight",
    "past",
    "the",
    "Police",
    "Station."
  ]),
  createArrangeStage("w1-s4", "Stage 4: build the sentence.", [
    "Continue",
    "Straight",
    "past",
    "the",
    "Library."
  ]),
  createArrangeStage("w1-s5", "Stage 5: build the sentence.", [
    "Continue",
    "Straight",
    "past",
    "the",
    "Playground."
  ]),
  createArrangeStage("w1-s6", "Stage 6: build the sentence.", [
    "Continue",
    "Straight",
    "past",
    "the",
    "Fire",
    "Station."
  ]),
  createChoiceStage("w1-s7", "Stage 7: choose the next turn.", [
    { label: "Turn Left", correct: false },
    { label: "Turn Right", correct: true },
    { label: "Go Back", correct: false },
    { label: "Stop here", correct: false }
  ]),
  createArrangeStage("w1-s8", "Stage 8: build the sentence.", [
    "Continue",
    "Straight",
    "past",
    "the",
    "Garden",
    "and",
    "the",
    "Bookstore."
  ]),
  createArrangeStage("w1-s9", "Stage 9: arrive at the destination.", [
    "Arrive",
    "at",
    "your",
    "destination,",
    "the",
    "Restaurant."
  ], "Indicate")
]);

const danilaRouteFlow = createRouteFlow(332, [
  createArrangeStage("g2-s1", "Stage 1: build the sentence.", [
    "Continue",
    "Straight",
    "past",
    "the",
    "Church."
  ]),
  createArrangeStage("g2-s2", "Stage 2: build the sentence.", [
    "Continue",
    "Straight",
    "until",
    "you",
    "reach",
    "the",
    "Pharmacy."
  ]),
  createChoiceStage("g2-s3", "Stage 3: choose the next turn.", [
    { label: "Turn Left", correct: false },
    { label: "Turn Right", correct: true },
    { label: "Go Back", correct: false },
    { label: "Stop here", correct: false }
  ]),
  createArrangeStage("g2-s4", "Stage 4: build the sentence.", [
    "Continue",
    "Straight",
    "past",
    "the",
    "Gym."
  ]),
  createArrangeStage("g2-s5", "Stage 5: arrive at the destination.", [
    "Arrive",
    "at",
    "your",
    "destination,",
    "the",
    "Restaurant."
  ], "Indicate")
]);

const rubyRouteFlow = createRouteFlow(332, [
  createArrangeStage("g3-s1", "Stage 1: build the sentence.", [
    "Continue",
    "Straight",
    "to",
    "the",
    "School."
  ]),
  createChoiceStage("g3-s2", "Stage 2: choose the next turn.", [
    { label: "Turn Left", correct: true },
    { label: "Turn Right", correct: false },
    { label: "Go Back", correct: false },
    { label: "Stop here", correct: false }
  ]),
  createArrangeStage("g3-s3", "Stage 3: build the sentence.", [
    "Continue",
    "Straight",
    "past",
    "the",
    "Church."
  ]),
  createArrangeStage("g3-s4", "Stage 4: build the sentence.", [
    "Continue",
    "Straight",
    "past",
    "the",
    "Park."
  ]),
  createArrangeStage("g3-s5", "Stage 5: build the sentence.", [
    "Continue",
    "Straight",
    "to",
    "the",
    "Pharmacy."
  ]),
  createChoiceStage("g3-s6", "Stage 6: choose the next turn.", [
    { label: "Turn Left", correct: false },
    { label: "Turn Right", correct: true },
    { label: "Go Back", correct: false },
    { label: "Stop here", correct: false }
  ]),
  createArrangeStage("g3-s7", "Stage 7: build the sentence.", [
    "Continue",
    "Straight."
  ]),
  createArrangeStage("g3-s8", "Stage 8: arrive at the destination.", [
    "Arrive",
    "at",
    "your",
    "destination,",
    "the",
    "Gym."
  ], "Indicate")
]);

const lunaRobertaRouteFlow = createRouteFlow(332, [
  createArrangeStage("bg-s1", "Stage 1: build the sentence.", [
    "Continue",
    "Straight",
    "past",
    "the",
    "Park."
  ]),
  createArrangeStage("bg-s2", "Stage 2: build the sentence.", [
    "Continue",
    "Straight",
    "to",
    "the",
    "Pharmacy."
  ]),
  createChoiceStage("bg-s3", "Stage 3: choose the next turn.", [
    { label: "Turn Left", correct: false },
    { label: "Turn Right", correct: true },
    { label: "Go Back", correct: false },
    { label: "Stop here", correct: false }
  ]),
  createArrangeStage("bg-s4", "Stage 4: build the sentence.", [
    "Continue",
    "Straight",
    "past",
    "the",
    "Gym",
    "and",
    "the",
    "Restaurant."
  ]),
  createArrangeStage("bg-s5", "Stage 5: arrive at the destination.", [
    "Arrive",
    "at",
    "your",
    "destination,",
    "the",
    "City",
    "Hall."
  ], "Indicate")
]);

const bekkyRouteFlow = createRouteFlow(332, [
  createArrangeStage("g4-s1", "Stage 1: build the sentence.", [
    "Continue",
    "Straight",
    "past",
    "the",
    "Cafe."
  ]),
  createChoiceStage("g4-s2", "Stage 2: choose the next turn.", [
    { label: "Turn Left", correct: true },
    { label: "Turn Right", correct: false },
    { label: "Go Back", correct: false },
    { label: "Stop here", correct: false }
  ]),
  createArrangeStage("g4-s3", "Stage 3: build the sentence.", [
    "Continue",
    "Straight",
    "past",
    "the",
    "Church."
  ]),
  createArrangeStage("g4-s4", "Stage 4: build the sentence.", [
    "Continue",
    "Straight",
    "past",
    "the",
    "Park."
  ]),
  createArrangeStage("g4-s5", "Stage 5: arrive at the destination.", [
    "Arrive",
    "at",
    "your",
    "destination,",
    "the",
    "Pharmacy."
  ], "Indicate")
]);

const charlesRouteFlow = createRouteFlow(332, [
  createArrangeStage("b2-s1", "Stage 1: build the sentence.", [
    "Continue",
    "Straight",
    "to",
    "the",
    "area",
    "between",
    "the",
    "Park",
    "and",
    "the",
    "Fire",
    "Station."
  ]),
  createChoiceStage("b2-s2", "Stage 2: choose the next turn.", [
    { label: "Turn Left", correct: true },
    { label: "Turn Right", correct: false },
    { label: "Go Back", correct: false },
    { label: "Stop here", correct: false }
  ]),
  createArrangeStage("b2-s3", "Stage 3: build the sentence.", [
    "Continue",
    "Straight",
    "past",
    "the",
    "Houses."
  ]),
  createArrangeStage("b2-s4", "Stage 4: build the sentence.", [
    "Continue",
    "Straight",
    "to",
    "the",
    "Park."
  ]),
  createChoiceStage("b2-s5", "Stage 5: choose the next turn.", [
    { label: "Turn Left", correct: false },
    { label: "Turn Right", correct: true },
    { label: "Go Back", correct: false },
    { label: "Stop here", correct: false }
  ]),
  createArrangeStage("b2-s6", "Stage 6: build the sentence.", [
    "Continue",
    "Straight",
    "to",
    "the",
    "Church."
  ]),
  createArrangeStage("b2-s7", "Stage 7: arrive at the destination.", [
    "Arrive",
    "at",
    "your",
    "destination."
  ], "Indicate")
]);

export const ALL_SPRITES_CHARACTER_NPCS: NpcDefinition[] = [
  createSheetNpc("g2-npc", "Danila", 160, 160, 0, "Good afternoon Hally, I lost my brother Miguel, but Mom told us we were at the restaurant. Could you tell me how to get there?", danilaRouteFlow),
  createSheetNpc("w1-npc", "Sidney", 576, 128, 1, "Hi Hanlly, I lost my children while visiting a friend in the hospital, but we were supposed to meet at the restaurant. Can you tell me how to get there?", sidneyRouteFlow),
  createSheetNpc("g3-npc", "Ruby", 1216, 192, 2, "Hey brat, I heard you knew how to get to the gym, tell me how to get there.", rubyRouteFlow),
  createSheetNpc("bg-npc", "Luna Roberta", 192, 448, 3, "Hi Hanlly, how are you? I need to go to the City Hall right now to report harassment. Can you tell me how to get there?", lunaRobertaRouteFlow),
  createSheetNpc("g4-npc", "Bekky", 960, 448, 4, "Hi Hallny, I was told you have a pharmacy. I need to buy medicine for my parents. Can you tell me how to get there?", bekkyRouteFlow),
  createSheetNpc("b2-npc", "Charles", 1408, 768, 5, "Hi Hanlly, remember we have a coffee date. Tell me how to get to the church. When you finish your chores, I'll see you at the caf\u00e9.", charlesRouteFlow)
];
