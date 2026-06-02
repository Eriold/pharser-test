import Phaser from "phaser";
import { NpcDialogueTypewriter } from "./NpcDialogueTypewriter";
import { NpcRouteFlow } from "./NpcRouteFlow";
import type { NpcEntry } from "./NpcTypes";

export type NpcDialogUiResult = {
  elements: Array<Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text>;
  routeFlow: NpcRouteFlow | null;
};

export type NpcDialogUiArgs = {
  scene: Phaser.Scene;
  activeNpc: NpcEntry;
  dialogueBarHeight: number;
  dialogueTypewriter: NpcDialogueTypewriter;
  isSuccessDialogue: boolean;
  isFailureDialogue: boolean;
  onRouteResolved: (success: boolean) => void;
};

export function buildNpcDialogUi({
  scene,
  activeNpc,
  dialogueBarHeight,
  dialogueTypewriter,
  isSuccessDialogue,
  isFailureDialogue,
  onRouteResolved
}: NpcDialogUiArgs): NpcDialogUiResult {
  const definition = activeNpc.definition;
  const isTerminalDialogue = isSuccessDialogue || isFailureDialogue;
  const width = scene.scale.width;
  const height = scene.scale.height;
  const barY = height - dialogueBarHeight;
  const bar = scene.add.rectangle(0, barY, width, dialogueBarHeight, 0x160f14, 0.95).setOrigin(0);
  const barLine = scene.add.rectangle(0, barY, width, 4, 0xffffff, 0.16).setOrigin(0);

  const portraitX = width - 250;
  const portraitY = barY;
  const portrait = scene.add.image(portraitX, portraitY, definition.portrait.key);
  if (definition.portraitCrop) {
    portrait.setCrop(
      definition.portraitCrop.x,
      definition.portraitCrop.y,
      definition.portraitCrop.width,
      definition.portraitCrop.height
    );
  }
  portrait.setDisplaySize(400, 600);

  const portraitFrame = scene.add.rectangle(portraitX, portraitY, 206, 206, 0x000000, 0);

  const title = scene.add
    .text(264, barY + 24, isTerminalDialogue ? definition.name : `${definition.name} is lost`, {
      fontFamily: "monospace",
      fontSize: "26px",
      fontStyle: "bold",
      color: "#cdf8c2"
    })
    .setOrigin(0);

  const prompt = scene
    .add
    .text(width - 550, barY + dialogueBarHeight - 42, "Press Q for quit", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#ffffff"
    })
    .setOrigin(0);

  const placeholderText = scene
    .add
    .text(264, barY + 64, "", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#f3ecef",
      wordWrap: { width: width - 360 }
    })
    .setOrigin(0);

  dialogueTypewriter.attach(placeholderText);
  dialogueTypewriter.start(
    isSuccessDialogue
      ? definition.successDialogueText ?? "Thank you!!"
      : isFailureDialogue
        ? definition.failureDialogueText ?? "Thanks to you I will never arrive"
        : definition.dialogueText,
    isSuccessDialogue
      ? definition.successDialogueTextSpeedMs ?? 24
      : isFailureDialogue
        ? definition.failureDialogueTextSpeedMs ?? 24
        : definition.dialogueTextSpeedMs ?? 24
  );

  let routeFlow: NpcRouteFlow | null = null;
  if (definition.routeFlow && !isTerminalDialogue) {
    routeFlow = new NpcRouteFlow(
      scene,
      definition.routeFlow,
      {
        x: 264,
        y: barY + 108,
        width: width - 360,
        height: dialogueBarHeight - 118
      },
      onRouteResolved
    );
    routeFlow.setVisible(false);
  }

  const elements = [bar, barLine, portraitFrame, portrait, title, placeholderText, prompt];
  elements.forEach(element => element.setScrollFactor(0).setDepth(1000));

  return { elements, routeFlow };
}
