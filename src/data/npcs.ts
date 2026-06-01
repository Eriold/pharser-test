import type { NpcDefinition } from "../systems/npc/NpcTypes";

const defaultNpcBody = {
  displayWidth: 70,
  displayHeight: 79,
  bodyWidth: 36,
  bodyHeight: 20,
  bodyOffsetX: 30,
  bodyOffsetY: 84
};

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
    dialogueText: "I am lost. Can you help me find the right place?",
    dialogueTextSpeedMs: 24,
    routeOptions: ["Go straight", "Turn left", "Turn right", "Stop at the park"],
    correctRoute: ["Go straight", "Turn left", "Stop at the park"],
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
    routeOptions: ["Go to the bus stop", "Walk past the store", "Turn right", "Enter the school"],
    correctRoute: ["Walk past the store", "Turn right", "Go to the bus stop"],
    routeFlow: {
      panelHeight: 332,
      stages: [
        {
          kind: "arrange",
          prompt: "Stage 1: build the sentence.",
          tokens: [
            { id: "o1-s1-1", label: "Continue" },
            { id: "o1-s1-2", label: "Straight" },
            { id: "o1-s1-3", label: "to" },
            { id: "o1-s1-4", label: "the" },
            { id: "o1-s1-5", label: "road" },
            { id: "o1-s1-6", label: "on" },
            { id: "o1-s1-7", label: "the" },
            { id: "o1-s1-8", label: "right." }
          ],
          answerTokenIds: [
            "o1-s1-1",
            "o1-s1-2",
            "o1-s1-3",
            "o1-s1-4",
            "o1-s1-5",
            "o1-s1-6",
            "o1-s1-7",
            "o1-s1-8"
          ],
          actionLabel: "Continue",
          palette: {
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
          }
        },
        {
          kind: "choice",
          prompt: "Stage 2: choose the next turn.",
          choices: [
            { id: "o1-c1", label: "Turn Right", correct: false },
            { id: "o1-c2", label: "Turn Left", correct: true },
            { id: "o1-c3", label: "Go Back", correct: false },
            { id: "o1-c4", label: "Stop here", correct: false }
          ],
          actionLabel: "Continue",
          palette: {
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
          }
        },
        {
          kind: "arrange",
          prompt: "Stage 3: build the sentence.",
          tokens: [
            { id: "o1-s3-1", label: "Continue" },
            { id: "o1-s3-2", label: "Straight" },
            { id: "o1-s3-3", label: "until" },
            { id: "o1-s3-4", label: "you" },
            { id: "o1-s3-5", label: "reach" },
            { id: "o1-s3-6", label: "the" },
            { id: "o1-s3-7", label: "top" },
            { id: "o1-s3-8", label: "road." }
          ],
          answerTokenIds: [
            "o1-s3-1",
            "o1-s3-2",
            "o1-s3-3",
            "o1-s3-4",
            "o1-s3-5",
            "o1-s3-6",
            "o1-s3-7",
            "o1-s3-8"
          ],
          actionLabel: "Indicate",
          palette: {
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
          }
        },
        {
          kind: "choice",
          prompt: "Stage 4: choose the next turn.",
          choices: [
            { id: "o1-c5", label: "Turn Left", correct: false },
            { id: "o1-c6", label: "Turn Right", correct: true },
            { id: "o1-c7", label: "Go Straight", correct: false },
            { id: "o1-c8", label: "Stop here", correct: false }
          ],
          actionLabel: "Continue",
          palette: {
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
          }
        },
        {
          kind: "arrange",
          prompt: "Stage 5: build the sentence.",
          tokens: [
            { id: "o1-s5-1", label: "Continue" },
            { id: "o1-s5-2", label: "Straight" },
            { id: "o1-s5-3", label: "past" },
            { id: "o1-s5-4", label: "the" },
            { id: "o1-s5-5", label: "Bank" },
            { id: "o1-s5-6", label: "and" },
            { id: "o1-s5-7", label: "the" },
            { id: "o1-s5-8", label: "Police" },
            { id: "o1-s5-9", label: "Station." }
          ],
          answerTokenIds: [
            "o1-s5-1",
            "o1-s5-2",
            "o1-s5-3",
            "o1-s5-4",
            "o1-s5-5",
            "o1-s5-6",
            "o1-s5-7",
            "o1-s5-8",
            "o1-s5-9"
          ],
          actionLabel: "Continue",
          palette: {
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
          }
        },
        {
          kind: "arrange",
          prompt: "Stage 6: arrive at the destination.",
          tokens: [
            { id: "o1-s6-1", label: "Arrive" },
            { id: "o1-s6-2", label: "at" },
            { id: "o1-s6-3", label: "your" },
            { id: "o1-s6-4", label: "destination," },
            { id: "o1-s6-5", label: "the" },
            { id: "o1-s6-6", label: "Library." }
          ],
          answerTokenIds: [
            "o1-s6-1",
            "o1-s6-2",
            "o1-s6-3",
            "o1-s6-4",
            "o1-s6-5",
            "o1-s6-6"
          ],
          actionLabel: "Indicate",
          palette: {
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
          }
        }
      ]
    },
    frame: 0,
    x: 480,
    y: 480,
    ...defaultNpcBody
  }
];
