import Phaser from "phaser";
import { BaseRpgScene } from "./BaseRpgScene";

type WorldSceneData = {
  spawnX?: number;
  spawnY?: number;
};

type NpcIndicatorState = "alert" | "thinking";

export class WorldScene extends BaseRpgScene {
  private spawnX = this.tileToWorld(28, 1);
  private spawnY = this.tileToWorld(15, 1);
  private worldWidth = 0;
  private worldHeight = 0;
  private girlNpc!: Phaser.Physics.Arcade.Sprite;
  private activeNpc: Phaser.Physics.Arcade.Sprite | null = null;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private qKey!: Phaser.Input.Keyboard.Key;
  private dialogOpen = false;
  private dialogElements: Array<Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text> = [];
  private npcIndicators: Array<{ npc: Phaser.Physics.Arcade.Sprite; indicator: Phaser.GameObjects.Text }> = [];
  private readonly talkDistance = 120;
  private readonly dialogueBarHeight = 212;

  constructor() {
    super("WorldScene");
  }

  init(data: WorldSceneData) {
    this.spawnX = data.spawnX ?? this.tileToWorld(28, 1);
    this.spawnY = data.spawnY ?? this.tileToWorld(15, 1);
  }

  preload() {
    super.preload();
    this.load.tilemapTiledJSON("world-complete-map", "/assets/maps/world-complete.map.json");
    this.load.image("world-complete", "/assets/maps/world-complete.png");
    this.load.image("collision-grid", "/assets/tilesets/collision-grid.png");
    this.load.spritesheet("girl-npc", "/assets/sprites/g1-npc.png", {
      frameWidth: 96,
      frameHeight: 108
    });
    this.load.image("girl-npc-character", "/assets/character-g1-npc.png");
  }

  create() {
    this.add.image(0, 0, "world-complete").setOrigin(0).setDepth(0);

    const { map, collision } = this.buildCollisionMap("world-complete-map", "collision-grid");
    this.worldWidth = map.widthInPixels;
    this.worldHeight = map.heightInPixels;
    this.createPlayer(this.spawnX, this.spawnY);
    this.createGirlNpc(1408, 576);

    this.physics.add.collider(this.player, collision);
    this.physics.add.collider(this.player, this.girlNpc);
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.qKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.registerNpcIndicator(this.girlNpc);
    this.updateCameraMode(this.scale.width, this.scale.height);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    });

    this.addHint("Ciudad exterior: muevete con WASD/Flechas. El borde esta bloqueado.");
  }

  update() {
    if (this.dialogOpen) {
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0);
      this.player.anims.stop();

      if (Phaser.Input.Keyboard.JustDown(this.qKey)) {
        this.closeDialog();
      }

      this.player.setDepth(this.player.y);
      this.girlNpc.setDepth(this.girlNpc.y);
      this.updateNpcIndicators();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.isNearGirlNpc()) {
      this.activeNpc = this.girlNpc;
      this.openDialog();
      return;
    }

    this.movePlayer();
    this.player.setDepth(this.player.y);
    if (this.girlNpc) {
      this.girlNpc.setDepth(this.girlNpc.y);
    }
    this.updateNpcIndicators();
  }

  private createGirlNpc(x: number, y: number) {
    this.girlNpc = this.physics.add.sprite(x, y, "girl-npc", 0);
    this.girlNpc.setDisplaySize(70, 79);
    this.girlNpc.setSize(36, 20);
    this.girlNpc.setOffset(30, 84);
    this.girlNpc.setImmovable(true);
    const body = this.girlNpc.body as Phaser.Physics.Arcade.Body;
    body.allowGravity = false;
    this.girlNpc.setFrame(0);
    this.girlNpc.setDepth(y);
  }

  private isNearGirlNpc() {
    return (
      Phaser.Math.Distance.Between(this.player.x, this.player.y, this.girlNpc.x, this.girlNpc.y) <=
      this.talkDistance
    );
  }

  private openDialog() {
    if (this.dialogOpen) {
      return;
    }

    this.dialogOpen = true;
    this.buildDialogUi();
  }

  private closeDialog() {
    if (!this.dialogOpen) {
      return;
    }

    this.dialogOpen = false;
    this.activeNpc = null;
    this.updateNpcIndicators();
    this.dialogElements.forEach(element => element.destroy());
    this.dialogElements = [];
  }

  private registerNpcIndicator(npc: Phaser.Physics.Arcade.Sprite) {
    const indicator = this.add
      .text(npc.x, npc.y, "❗", {
        fontFamily: "Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif",
        fontSize: "28px",
        color: "#ffffff"
      })
      .setOrigin(0.5, 1);

    this.npcIndicators.push({ npc, indicator });
    this.updateNpcIndicatorState(npc, indicator);
  }

  private updateNpcIndicators() {
    for (const { npc, indicator } of this.npcIndicators) {
      indicator.setPosition(npc.x, npc.y - npc.displayHeight / 2 - 6);
      indicator.setDepth(npc.y + 10);
      this.updateNpcIndicatorState(npc, indicator);
    }
  }

  private updateNpcIndicatorState(
    npc: Phaser.Physics.Arcade.Sprite,
    indicator: Phaser.GameObjects.Text
  ) {
    const state: NpcIndicatorState = this.dialogOpen && this.activeNpc === npc ? "thinking" : "alert";
    indicator.setText(state === "thinking" ? "🤔" : "❗");
  }

  private buildDialogUi() {
    const width = this.scale.width;
    const height = this.scale.height;
    const barY = height - this.dialogueBarHeight;
    const bar = this.add.rectangle(0, barY, width, this.dialogueBarHeight, 0x160f14, 0.95).setOrigin(0);
    const barLine = this.add
      .rectangle(0, barY, width, 4, 0xffffff, 0.16)
      .setOrigin(0);

    const portraitX = width - 250;
    const portraitY = barY;
    const portrait = this.add.image(portraitX, portraitY, "girl-npc-character");
    portrait.setDisplaySize(400, 600);

    const portraitFrame = this.add.rectangle(portraitX, portraitY, 206, 206, 0x000000, 0);

    const title = this.add
      .text(264, barY + 24, "Sara is lost", {
        fontFamily: "monospace",
        fontSize: "26px",
        fontStyle: "bold",
        // color: "#ffffff"
        color: "#cdf8c2"
      })
      .setOrigin(0);

    const prompt = this.add
      .text(width - 550, barY + this.dialogueBarHeight - 42, "Press Q for quit", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#ffffff"
      })
      .setOrigin(0);

    const placeholderText = this.add
      .text(264, barY + 64, "Presiona Espacio junto a la NPC para abrir este evento.", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#f3ecef",
        wordWrap: { width: width - 360 }
      })
      .setOrigin(0);

    [bar, barLine, portraitFrame, portrait, title, placeholderText, prompt].forEach(element => {
      element.setScrollFactor(0).setDepth(1000);
      this.dialogElements.push(element);
    });
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    this.updateCameraMode(gameSize.width, gameSize.height);
    if (this.dialogOpen) {
      this.closeDialog();
      this.openDialog();
    }
  }

  private updateCameraMode(viewWidth: number, viewHeight: number) {
    if (this.worldWidth === 0 || this.worldHeight === 0) {
      return;
    }

    const worldFits = viewWidth >= this.worldWidth && viewHeight >= this.worldHeight;

    if (worldFits) {
      const scrollX = -(viewWidth - this.worldWidth) / 2;
      const scrollY = -(viewHeight - this.worldHeight) / 2;

      this.cameras.main.stopFollow();
      this.cameras.main.removeBounds();
      this.cameras.main.setScroll(scrollX, scrollY);
      return;
    }

    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
  }
}
