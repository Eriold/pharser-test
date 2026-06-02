import Phaser from "phaser";
import { assetUrl } from "../../utils/assetUrl";

export function launchEndGameSequence(scene: Phaser.Scene) {
  scene.sound.stopByKey("background-music");
  scene.sound.stopByKey("challenge-loop");
  scene.scene.launch("EndGameScene", {
    speakerName: "Charles",
    portrait: {
      key: "character-b2-npc",
      path: assetUrl("/assets/character-b2-npc.png")
    },
    finalDialogueText: "Hanlly! I heard you did an excellent job. You helped our city with the missing people. It's time for coffee, let's go.",
    dialogueAudio: {
      key: "charles-finale-audio",
      path: assetUrl("/assets/sounds/b2-w-npc.m4a")
    },
    postDialogueHoldMs: 2400,
    endImage: {
      key: "end-game",
      path: assetUrl("/assets/end-game.png")
    },
    endMessage: "You have completed the challenge, congratulations Hanlly",
    audio: {
      key: "win-audio",
      path: assetUrl("/assets/sounds/win.mp3")
    }
  });
  scene.scene.pause(scene.scene.key);
}

export function launchLoseSequence(scene: Phaser.Scene) {
  scene.sound.stopByKey("background-music");
  scene.sound.stopByKey("challenge-loop");
  scene.scene.launch("LoseScene", {
    title: "You lose",
    message: "You have lost the challenge",
    audio: {
      key: "lose-audio",
      path: assetUrl("/assets/sounds/lose.mp3")
    }
  });
  scene.scene.pause(scene.scene.key);
}
