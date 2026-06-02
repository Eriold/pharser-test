import Phaser from "phaser";

export function launchEndGameSequence(scene: Phaser.Scene) {
  scene.sound.stopByKey("background-music");
  scene.sound.stopByKey("challenge-loop");
  scene.scene.launch("EndGameScene", {
    speakerName: "Charles",
    portrait: {
      key: "character-b2-npc",
      path: "/assets/character-b2-npc.png"
    },
    finalDialogueText: "Hanlly! I heard you did an excellent job. You helped our city with the missing people. It's time for coffee, let's go.",
    dialogueAudio: {
      key: "charles-finale-audio",
      path: "/assets/sounds/b2-w-npc.m4a"
    },
    postDialogueHoldMs: 2400,
    endImage: {
      key: "end-game",
      path: "/assets/end-game.png"
    },
    endMessage: "You have completed the challenge, congratulations Hanlly",
    audio: {
      key: "win-audio",
      path: "/assets/sounds/win.mp3"
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
      path: "/assets/sounds/lose.mp3"
    }
  });
  scene.scene.pause(scene.scene.key);
}
