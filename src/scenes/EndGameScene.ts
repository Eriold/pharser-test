import Phaser from "phaser";
import { NpcDialogueTypewriter } from "../systems/npc/NpcDialogueTypewriter";

type EndGameSceneData = {
  speakerName: string;
  portrait: {
    key: string;
    path: string;
  };
  finalDialogueText: string;
  dialogueAudio?: {
    key: string;
    path: string;
  };
  postDialogueHoldMs?: number;
  endImage: {
    key: string;
    path: string;
  };
  endMessage: string;
  audio?: {
    key: string;
    path: string;
  };
};

export class EndGameScene extends Phaser.Scene {
  private sceneData!: EndGameSceneData;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private dialogueTypewriter = new NpcDialogueTypewriter();
  private dialogueElements: Array<Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text> = [];
  private fadeOverlay!: Phaser.GameObjects.Rectangle;
  private finalTimer: Phaser.Time.TimerEvent | null = null;
  private transitionStarted = false;
  private finalScreenShown = false;
  private dialogueTextComplete = false;
  private dialogueAudioComplete = false;
  private dialogueAudio: Phaser.Sound.BaseSound | null = null;

  constructor() {
    super("EndGameScene");
  }

  init(data: EndGameSceneData) {
    this.sceneData = data;
  }

  preload() {
    if (!this.textures.exists(this.sceneData.portrait.key)) {
      this.load.image(this.sceneData.portrait.key, this.sceneData.portrait.path);
    }

    if (!this.textures.exists(this.sceneData.endImage.key)) {
      this.load.image(this.sceneData.endImage.key, this.sceneData.endImage.path);
    }

    if (this.sceneData.dialogueAudio && !this.cache.audio.exists(this.sceneData.dialogueAudio.key)) {
      this.load.audio(this.sceneData.dialogueAudio.key, this.sceneData.dialogueAudio.path);
    }
    if (this.sceneData.audio && !this.cache.audio.exists(this.sceneData.audio.key)) {
      this.load.audio(this.sceneData.audio.key, this.sceneData.audio.path);
    }
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    const barHeight = 212;
    const barY = height - barHeight;

    this.add.rectangle(0, 0, width, height, 0x000000, 0.0).setOrigin(0);
    this.fadeOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.0).setOrigin(0).setDepth(999);

    const bar = this.add.rectangle(0, barY, width, barHeight, 0x160f14, 0.95).setOrigin(0);
    const barLine = this.add.rectangle(0, barY, width, 4, 0xffffff, 0.16).setOrigin(0);
    const portraitX = width - 250;
    const portraitY = barY;
    const portrait = this.add.image(portraitX, portraitY, this.sceneData.portrait.key).setDisplaySize(400, 600);
    const portraitFrame = this.add.rectangle(portraitX, portraitY, 206, 206, 0x000000, 0);
    const title = this.add.text(264, barY + 24, this.sceneData.speakerName, {
      fontFamily: "monospace",
      fontSize: "26px",
      fontStyle: "bold",
      color: "#cdf8c2"
    });
    const prompt = this.add.text(width - 550, barY + barHeight - 42, "Press Space to skip", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#ffffff"
    });
    const placeholderText = this.add.text(264, barY + 64, "", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#f3ecef",
      wordWrap: { width: width - 360 }
    });

    this.dialogueTypewriter.attach(placeholderText);
    this.dialogueTypewriter.start(this.sceneData.finalDialogueText, 24);

    this.dialogueElements = [bar, barLine, portraitFrame, portrait, title, placeholderText, prompt];
    this.dialogueElements.forEach(element => element.setScrollFactor(0).setDepth(1000));

    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.fadeOverlay.setDepth(998);
    this.time.delayedCall(500, () => {
      this.fadeOverlay.setAlpha(0.18);
    });
    if (this.sceneData.dialogueAudio) {
      this.dialogueAudio = this.sound.add(this.sceneData.dialogueAudio.key);
      this.dialogueAudio.once(Phaser.Sound.Events.COMPLETE, () => {
        this.dialogueAudioComplete = true;
        this.scheduleFinalTransition();
      });
      this.dialogueAudio.play();
    } else {
      this.dialogueAudioComplete = true;
    }
  }

  update(time: number, delta: number) {
    if (this.finalScreenShown) {
      return;
    }

    this.dialogueTypewriter.update(delta);

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.dialogueTypewriter.skip();
    }

    if (this.dialogueTypewriter.isComplete()) {
      this.dialogueTextComplete = true;
      this.scheduleFinalTransition();
    }
  }

  private scheduleFinalTransition() {
    if (this.finalTimer || this.transitionStarted || this.finalScreenShown) {
      return;
    }

    if (!this.dialogueTextComplete || !this.dialogueAudioComplete) {
      return;
    }

    this.transitionStarted = true;
    this.finalTimer = this.time.delayedCall(this.sceneData.postDialogueHoldMs ?? 2000, () => {
      this.finalTimer = null;
      this.beginFadeOut();
    });
  }

  private beginFadeOut() {
    if (this.finalScreenShown) {
      return;
    }

    this.dialogueElements.forEach(element => element.destroy());
    this.dialogueElements = [];
    this.tweens.add({
      targets: this.fadeOverlay,
      alpha: 1,
      duration: 1200,
      onComplete: () => this.showFinalScreen()
    });
  }

  private showFinalScreen() {
    if (this.finalScreenShown) {
      return;
    }

    this.finalScreenShown = true;
    if (this.sceneData.audio) {
      this.sound.stopAll();
      this.sound.play(this.sceneData.audio.key);
    }
    const width = this.scale.width;
    const height = this.scale.height;
    const source = this.textures.get(this.sceneData.endImage.key).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const sourceWidth = "naturalWidth" in source ? source.naturalWidth : source.width;
    const sourceHeight = "naturalHeight" in source ? source.naturalHeight : source.height;
    const scale = Math.min((width * 0.9) / sourceWidth, (height * 0.82) / sourceHeight);

    const image = this.add.image(width / 2, height / 2 - 20, this.sceneData.endImage.key).setScale(scale).setDepth(1001);
    const message = this.add.text(width / 2, height - 90, this.sceneData.endMessage, {
      fontFamily: "monospace",
      fontSize: "28px",
      fontStyle: "bold",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: width * 0.75 }
    }).setOrigin(0.5).setDepth(1002);
    const messageShadow = this.add.text(width / 2 + 2, height - 88, this.sceneData.endMessage, {
      fontFamily: "monospace",
      fontSize: "28px",
      fontStyle: "bold",
      color: "#000000",
      align: "center",
      wordWrap: { width: width * 0.75 }
    }).setOrigin(0.5).setDepth(1001);

    image.setAlpha(0);
    message.setAlpha(0);
    messageShadow.setAlpha(0);
    this.tweens.add({
      targets: [image, messageShadow, message],
      alpha: 1,
      duration: 900
    });
  }
}
