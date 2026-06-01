import type { NpcDefinition } from "../systems/npc/NpcTypes";
import { createArrangeStage, createChoiceStage, createRouteFlow } from "./npcRoutePresets";

const defaultNpcBody = {
  displayWidth: 70,
  displayHeight: 79,
  bodyWidth: 36,
  bodyHeight: 20,
  bodyOffsetX: 30,
  bodyOffsetY: 84
};

const routeFlowPalette = createRouteFlow(332, [
  createArrangeStage("route-s1", "Stage 1: build the sentence.", [
    "Continue",
    "Straight",
    "to",
    "the",
    "intersection."
  ]),
  createChoiceStage("route-s2", "Stage 2: choose the next turn.", [
    { label: "Turn Left", correct: true },
    { label: "Turn Right", correct: false },
    { label: "Go Back", correct: false },
    { label: "Stop here", correct: false }
  ]),
  createArrangeStage("route-s3", "Stage 3: build the sentence.", [
    "Continue",
    "Straight",
    "past",
    "the",
    "Supermarket,",
    "the",
    "Convenience",
    "Store,",
    "and",
    "the",
    "Cafe."
  ]),
  createChoiceStage("route-s4", "Stage 4: choose the next turn.", [
    { label: "Turn Left", correct: false },
    { label: "Turn Right", correct: true },
    { label: "Go Straight", correct: false },
    { label: "Stop here", correct: false }
  ]),
  createArrangeStage("route-s5", "Stage 5: build the sentence.", [
    "Continue",
    "Straight."
  ]),
  createArrangeStage("route-s6", "Stage 6: arrive at the destination.", [
    "Arrive",
    "at",
    "your",
    "destination,",
    "the",
    "School."
  ], "Indicate")
]);

export const NPC_DEFINITIONS: NpcDefinition[] = [
  {
    id: "g1",
    name: "Sara",
    sprite: {
      key: "girl-npc",
      path: "/assets/sprites/g1-npc.png",
      frameWidth: 96,
      frameHeight: 108
    },
    portrait: {
      key: "girl-npc-character",
      path: "/assets/character-g1-npc.png"
    },
    audio: {
      key: "girl-npc-audio",
      path: "/assets/sounds/g1-npc.m4a"
    },
    dialogueText: "Good afternoon Hanlly, I missed the bus, can you tell me how to get to school?",
    dialogueTextSpeedMs: 24,
    successDialogueText: "Thank you!!",
    successDialogueTextSpeedMs: 40,
    successAutoCloseDelayMs: 1400,
    failureDialogueText: "Thanks to you I will never arrive",
    failureDialogueTextSpeedMs: 40,
    routeOptions: ["Turn Left", "Turn Right", "Go Straight", "Stop here"],
    correctRoute: [
      "Continue Straight to the intersection.",
      "Turn Left.",
      "Continue Straight past the Supermarket, the Convenience Store, and the Cafe.",
      "Turn Right.",
      "Continue Straight.",
      "Arrive at your destination, the School."
    ],
    routeFlow: routeFlowPalette,
    frame: 0,
    x: 1408,
    y: 576,
    ...defaultNpcBody
  },
  {
    id: "o1",
    name: "Old man",
    sprite: {
      key: "old-npc",
      path: "/assets/sprites/o1-npc-png.png",
      frameWidth: 167,
      frameHeight: 167,
      spacing: 1
    },
    portrait: {
      key: "old-npc-character",
      path: "/assets/character-o1-npc.png"
    },
    audio: {
      key: "old-npc-audio",
      path: "/assets/sounds/o1-npc.m4a"
    },
    dialogueText: "Hi Hanlly, I'm tired and lost, could you help me? I need to get to the library.",
    dialogueTextSpeedMs: 70,
    successDialogueText: "Thank you!!",
    successDialogueTextSpeedMs: 40,
    successAutoCloseDelayMs: 1400,
    failureDialogueText: "Thanks to you I will never arrive",
    failureDialogueTextSpeedMs: 40,
    routeOptions: ["Go to the bus stop", "Walk past the store", "Turn right", "Enter the school"],
    correctRoute: ["Walk past the store", "Turn right", "Go to the bus stop"],
    routeFlow: createRouteFlow(332, [
      createArrangeStage("o1-s1", "Stage 1: build the sentence.", [
        "Continue",
        "Straight",
        "to",
        "the",
        "road",
        "on",
        "the",
        "right."
      ]),
      createChoiceStage("o1-s2", "Stage 2: choose the next turn.", [
        { label: "Turn Right", correct: false },
        { label: "Turn Left", correct: true },
        { label: "Go Back", correct: false },
        { label: "Stop here", correct: false }
      ]),
      createArrangeStage("o1-s3", "Stage 3: build the sentence.", [
        "Continue",
        "Straight",
        "until",
        "you",
        "reach",
        "the",
        "top",
        "road."
      ]),
      createChoiceStage("o1-s4", "Stage 4: choose the next turn.", [
        { label: "Turn Left", correct: false },
        { label: "Turn Right", correct: true },
        { label: "Go Straight", correct: false },
        { label: "Stop here", correct: false }
      ]),
      createArrangeStage("o1-s5", "Stage 5: build the sentence.", [
        "Continue",
        "Straight",
        "past",
        "the",
        "Bank",
        "and",
        "the",
        "Police",
        "Station."
      ]),
      createArrangeStage("o1-s6", "Stage 6: arrive at the destination.", [
        "Arrive",
        "at",
        "your",
        "destination,",
        "the",
        "Library."
      ], "Indicate")
    ]),
    frame: 0,
    x: 480,
    y: 480,
    ...defaultNpcBody
  }
];
