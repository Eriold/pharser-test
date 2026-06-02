import Phaser from "phaser";

type LoseSceneData = {
  title: string;
  message: string;
  audio?: {
    key: string;
    path: string;
  };
};

export class LoseScene extends Phaser.Scene {
  private sceneData!: LoseSceneData;

  constructor() {
    super("LoseScene");
  }

  init(data: LoseSceneData) {
    this.sceneData = data;
  }

  preload() {
    if (this.sceneData.audio && !this.cache.audio.exists(this.sceneData.audio.key)) {
      this.load.audio(this.sceneData.audio.key, this.sceneData.audio.path);
    }
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.add.rectangle(0, 0, width, height, 0x000000, 0.72).setOrigin(0);

    const modalWidth = Math.min(width * 0.72, 720);
    const modalHeight = Math.min(height * 0.42, 320);
    const modalX = width / 2;
    const modalY = height / 2;

    this.add.rectangle(modalX, modalY, modalWidth, modalHeight, 0x111827, 0.98)
      .setStrokeStyle(4, 0xef4444, 1)
      .setDepth(1001);

    this.add.text(modalX, modalY - 52, this.sceneData.title, {
      fontFamily: "monospace",
      fontSize: "44px",
      fontStyle: "bold",
      color: "#fca5a5"
    }).setOrigin(0.5).setDepth(1002);

    this.add.text(modalX, modalY + 20, this.sceneData.message, {
      fontFamily: "monospace",
      fontSize: "24px",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: modalWidth * 0.8 }
    }).setOrigin(0.5).setDepth(1002);

    if (this.sceneData.audio) {
      this.sound.play(this.sceneData.audio.key);
    }
  }
}
