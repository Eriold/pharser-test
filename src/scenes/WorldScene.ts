import Phaser from "phaser";
import { BaseRpgScene } from "./BaseRpgScene";

type WorldSceneData = {
  spawnX?: number;
  spawnY?: number;
};

type NpcIndicatorState = "alert" | "thinking";

type NpcDefinition = {
  id: string;
  name: string;
  spriteKey: string;
  portraitKey: string;
  frame?: number;
  x: number;
  y: number;
  displayWidth: number;
  displayHeight: number;
  bodyWidth: number;
  bodyHeight: number;
  bodyOffsetX: number;
  bodyOffsetY: number;
};

type NpcEntry = {
  definition: NpcDefinition;
  sprite: Phaser.Physics.Arcade.Sprite;
  indicatorBox: Phaser.GameObjects.Rectangle;
  indicatorLabel: Phaser.GameObjects.Text;
};

export class WorldScene extends BaseRpgScene {
  private spawnX = this.tileToWorld(28, 1);
  private spawnY = this.tileToWorld(15, 1);
  private worldWidth = 0;
  private worldHeight = 0;
  private activeNpcId: string | null = null;
  private activeNpcPortraitKey = "";
  private activeNpcName = "";
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private qKey!: Phaser.Input.Keyboard.Key;
  private dialogOpen = false;
  private dialogElements: Array<Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text> = [];
  private npcs: NpcEntry[] = [];
  private readonly talkDistance = 120;
  private readonly dialogueBarHeight = 212;
  private readonly npcDefinitions: NpcDefinition[] = [
    {
      id: "g1",
      name: "Sara",
      spriteKey: "girl-npc",
      portraitKey: "girl-npc-character",
      frame: 0,
      x: 1408,
      y: 576,
      displayWidth: 70,
      displayHeight: 79,
      bodyWidth: 36,
      bodyHeight: 20,
      bodyOffsetX: 30,
      bodyOffsetY: 84
    },
    {
      id: "o1",
      name: "Old man",
      spriteKey: "old-npc",
      portraitKey: "old-npc-character",
      frame: 0,
      x: 480,
      y: 480,
      displayWidth: 70,
      displayHeight: 79,
      bodyWidth: 36,
      bodyHeight: 20,
      bodyOffsetX: 30,
      bodyOffsetY: 84
    }
  ];

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
    this.load.spritesheet("old-npc", "/assets/sprites/o1-npc-png.png", {
      frameWidth: 167,
      frameHeight: 167,
      spacing: 1
    });
    this.load.image("old-npc-character", "/assets/character-o1-npc.png");
  }

  create() {
    this.add.image(0, 0, "world-complete").setOrigin(0).setDepth(0);

    const { map, collision } = this.buildCollisionMap("world-complete-map", "collision-grid");
    this.worldWidth = map.widthInPixels;
    this.worldHeight = map.heightInPixels;
    this.createPlayer(this.spawnX, this.spawnY);

    for (const definition of this.npcDefinitions) {
      const entry = this.createNpc(definition);
      this.npcs.push(entry);
      this.physics.add.collider(this.player, entry.sprite);
    }

    this.physics.add.collider(this.player, collision);
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.qKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.updateNpcIndicators();
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
      this.updateNpcDepths();
      this.updateNpcIndicators();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      const nearbyNpc = this.findNearbyNpc();
      if (nearbyNpc) {
        this.activeNpcId = nearbyNpc.definition.id;
        this.activeNpcPortraitKey = nearbyNpc.definition.portraitKey;
        this.activeNpcName = nearbyNpc.definition.name;
        this.openDialog();
        return;
      }
    }

    this.movePlayer();
    this.player.setDepth(this.player.y);
    this.updateNpcDepths();
    this.updateNpcIndicators();
  }

  private createNpc(definition: NpcDefinition) {
    const sprite = this.physics.add.sprite(
      definition.x,
      definition.y,
      definition.spriteKey,
      definition.frame ?? 0
    );
    sprite.setDisplaySize(definition.displayWidth, definition.displayHeight);
    sprite.setSize(definition.bodyWidth, definition.bodyHeight);
    sprite.setOffset(definition.bodyOffsetX, definition.bodyOffsetY);
    sprite.setImmovable(true);
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    body.allowGravity = false;
    sprite.setDepth(definition.y);

    const indicatorBox = this.add.rectangle(definition.x, definition.y, 56, 50, 0xffffff, 1);
    indicatorBox.setStrokeStyle(3, 0x111111, 0.92);
    const indicatorLabel = this.add
      .text(definition.x, definition.y, "\u2757", {
        fontFamily: "Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif",
        fontSize: "34px",
        fontStyle: "bold",
        color: "#111111"
      })
      .setOrigin(0.5);

    return {
      definition,
      sprite,
      indicatorBox,
      indicatorLabel
    };
  }

  private findNearbyNpc() {
    let nearest: NpcEntry | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const entry of this.npcs) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, entry.sprite.x, entry.sprite.y);
      if (distance <= this.talkDistance && distance < nearestDistance) {
        nearest = entry;
        nearestDistance = distance;
      }
    }

    return nearest;
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
    this.activeNpcId = null;
    this.activeNpcPortraitKey = "";
    this.activeNpcName = "";
    this.updateNpcIndicators();
    this.dialogElements.forEach(element => element.destroy());
    this.dialogElements = [];
  }

  private updateNpcDepths() {
    for (const entry of this.npcs) {
      entry.sprite.setDepth(entry.sprite.y);
    }
  }

  private updateNpcIndicators() {
    for (const entry of this.npcs) {
      const indicatorY = entry.sprite.y - entry.sprite.displayHeight / 2 - 28;
      entry.indicatorBox.setPosition(entry.sprite.x, indicatorY);
      entry.indicatorLabel.setPosition(entry.sprite.x, indicatorY + 1);
      entry.indicatorBox.setDepth(entry.sprite.y + 10);
      entry.indicatorLabel.setDepth(entry.sprite.y + 11);
      this.updateNpcIndicatorState(entry);
    }
  }

  private updateNpcIndicatorState(entry: NpcEntry) {
    const state: NpcIndicatorState =
      this.dialogOpen && this.activeNpcId === entry.definition.id ? "thinking" : "alert";
    entry.indicatorLabel.setText(state === "thinking" ? "\u{1F914}" : "\u2757");
  }

  private buildDialogUi() {
    const width = this.scale.width;
    const height = this.scale.height;
    const barY = height - this.dialogueBarHeight;
    const bar = this.add.rectangle(0, barY, width, this.dialogueBarHeight, 0x160f14, 0.95).setOrigin(0);
    const barLine = this.add.rectangle(0, barY, width, 4, 0xffffff, 0.16).setOrigin(0);

    const portraitX = width - 250;
    const portraitY = barY;
    const portrait = this.add.image(portraitX, portraitY, this.activeNpcPortraitKey);
    portrait.setDisplaySize(400, 600);

    const portraitFrame = this.add.rectangle(portraitX, portraitY, 206, 206, 0x000000, 0);

    const title = this.add
      .text(264, barY + 24, `${this.activeNpcName} is lost`, {
        fontFamily: "monospace",
        fontSize: "26px",
        fontStyle: "bold",
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

    this.cameras.resize(viewWidth, viewHeight);

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
