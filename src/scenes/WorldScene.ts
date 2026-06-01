import Phaser from "phaser";
import { NPC_DEFINITIONS } from "../data/npcs";
import { NpcDialogueTypewriter } from "../systems/npc/NpcDialogueTypewriter";
import { findRandomOpenNpcPosition } from "../systems/npc/NpcSpawn";
import type { NpcDefinition, NpcEntry, NpcResultState } from "../systems/npc/NpcTypes";
import { NpcRouteFlow } from "../systems/npc/NpcRouteFlow";
import { BaseRpgScene } from "./BaseRpgScene";

type WorldSceneData = {
  spawnX?: number;
  spawnY?: number;
};

export class WorldScene extends BaseRpgScene {
  private spawnX = this.tileToWorld(28, 1);
  private spawnY = this.tileToWorld(15, 1);
  private worldWidth = 0;
  private worldHeight = 0;
  private activeNpc: NpcEntry | null = null;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private qKey!: Phaser.Input.Keyboard.Key;
  private dialogOpen = false;
  private dialogElements: Array<Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text> = [];
  private npcs: NpcEntry[] = [];
  private dialogueTypewriter = new NpcDialogueTypewriter();
  private routeFlow: NpcRouteFlow | null = null;
  private successCloseTimer: Phaser.Time.TimerEvent | null = null;
  private readonly talkDistance = 120;
  private dialogueBarHeight = 212;
  private readonly npcDefinitions = NPC_DEFINITIONS;

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
    for (const definition of this.npcDefinitions) {
      this.load.spritesheet(definition.sprite.key, definition.sprite.path, {
        frameWidth: definition.sprite.frameWidth,
        frameHeight: definition.sprite.frameHeight,
        spacing: definition.sprite.spacing
      });
      this.load.image(definition.portrait.key, definition.portrait.path);

      if (definition.audio) {
        this.load.audio(definition.audio.key, definition.audio.path);
      }
    }
  }

  create() {
    this.add.image(0, 0, "world-complete").setOrigin(0).setDepth(0);

    const { map, collision } = this.buildCollisionMap("world-complete-map", "collision-grid");
    this.worldWidth = map.widthInPixels;
    this.worldHeight = map.heightInPixels;
    this.createPlayer(this.spawnX, this.spawnY);

    for (const definition of this.npcDefinitions) {
      const entry = this.createNpc(definition, collision);
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

  update(time: number, delta: number) {
    if (this.dialogOpen) {
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0);
      this.player.anims.stop();
      this.dialogueTypewriter.update(delta);
      this.routeFlow?.setVisible(this.dialogueTypewriter.isComplete());

      if (this.isSuccessDialogueActive() && this.dialogueTypewriter.isComplete()) {
        this.scheduleSuccessClose();
      }

      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.dialogueTypewriter.skip();
        this.routeFlow?.setVisible(true);
        if (this.isSuccessDialogueActive()) {
          this.scheduleSuccessClose();
        }
      }

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
        this.activeNpc = nearbyNpc;
        this.openDialog();
        return;
      }
    }

    this.movePlayer();
    this.player.setDepth(this.player.y);
    this.updateNpcDepths();
    this.updateNpcIndicators();
  }

  private createNpc(definition: NpcDefinition, collision: Phaser.Tilemaps.TilemapLayer | Phaser.Tilemaps.TilemapGPULayer): NpcEntry {
    const spawn = definition.spawnRandomly
      ? findRandomOpenNpcPosition(
        collision,
        this.worldWidth,
        this.worldHeight,
        this.tileSize,
        this.spawnX,
        this.spawnY,
        this.npcs.map(entry => ({ x: entry.sprite.x, y: entry.sprite.y }))
      )
      : { x: definition.x, y: definition.y };

    const sprite = this.physics.add.sprite(
      spawn.x,
      spawn.y,
      definition.sprite.key,
      definition.frame ?? 0
    );
    sprite.setDisplaySize(definition.displayWidth, definition.displayHeight);
    sprite.setSize(definition.bodyWidth, definition.bodyHeight);
    sprite.setOffset(definition.bodyOffsetX, definition.bodyOffsetY);
    sprite.setImmovable(true);
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    body.allowGravity = false;
    sprite.setDepth(spawn.y);

    const indicatorBox = this.add.rectangle(spawn.x, spawn.y, 56, 50, 0xffffff, 1);
    indicatorBox.setStrokeStyle(3, 0x111111, 0.92);
    const indicatorLabel = this.add
      .text(spawn.x, spawn.y, "\u2757", {
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
      indicatorLabel,
      resultState: "idle"
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

    this.dialogueBarHeight = this.isTerminalDialogueActive() ? 212 : this.activeNpc?.definition.routeFlow?.panelHeight ?? 212;
    this.dialogOpen = true;
    if (!this.isTerminalDialogueActive()) {
      this.playActiveNpcAudio();
    }
    this.buildDialogUi();
  }

  private closeDialog() {
    if (!this.dialogOpen) {
      return;
    }

    this.stopActiveNpcAudio();
    this.clearSuccessCloseTimer();
    this.dialogOpen = false;
    this.activeNpc = null;
    this.dialogueTypewriter.clear();
    this.routeFlow?.destroy();
    this.routeFlow = null;
    this.updateNpcIndicators();
    this.dialogElements.forEach(element => element.destroy());
    this.dialogElements = [];
  }

  private playActiveNpcAudio() {
    const audio = this.activeNpc?.definition.audio;

    if (audio) {
      this.sound.play(audio.key);
    }
  }

  private stopActiveNpcAudio() {
    const audio = this.activeNpc?.definition.audio;

    if (audio) {
      this.sound.stopByKey(audio.key);
    }
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
    const state = this.getNpcIndicatorState(entry);
    const labels: Record<NpcResultState, string> = {
      idle: "\u2757",
      thinking: "\u{1F914}",
      happy: "\u263A\uFE0F",
      angry: "\u{1F92C}"
    };
    entry.indicatorLabel.setText(labels[state]);
  }

  private getNpcIndicatorState(entry: NpcEntry): NpcResultState {
    if (entry.resultState === "happy" || entry.resultState === "angry") {
      return entry.resultState;
    }

    return this.dialogOpen && this.activeNpc === entry ? "thinking" : "idle";
  }

  private buildDialogUi() {
    if (!this.activeNpc) {
      return;
    }

    const definition = this.activeNpc.definition;
    const isSuccessDialogue = this.isSuccessDialogueActive();
    const isFailureDialogue = this.isFailureDialogueActive();
    const isTerminalDialogue = isSuccessDialogue || isFailureDialogue;
    const width = this.scale.width;
    const height = this.scale.height;
    const barY = height - this.dialogueBarHeight;
    const bar = this.add.rectangle(0, barY, width, this.dialogueBarHeight, 0x160f14, 0.95).setOrigin(0);
    const barLine = this.add.rectangle(0, barY, width, 4, 0xffffff, 0.16).setOrigin(0);

    const portraitX = width - 250;
    const portraitY = barY;
    const portrait = this.add.image(portraitX, portraitY, definition.portrait.key);
    if (definition.portraitCrop) {
      portrait.setCrop(
        definition.portraitCrop.x,
        definition.portraitCrop.y,
        definition.portraitCrop.width,
        definition.portraitCrop.height
      );
    }
    portrait.setDisplaySize(400, 600);

    const portraitFrame = this.add.rectangle(portraitX, portraitY, 206, 206, 0x000000, 0);

    const title = this.add
      .text(264, barY + 24, isTerminalDialogue ? definition.name : `${definition.name} is lost`, {
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
      .text(264, barY + 64, "", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#f3ecef",
        wordWrap: { width: width - 360 }
      })
      .setOrigin(0);

    this.dialogueTypewriter.attach(placeholderText);
    this.dialogueTypewriter.start(
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

    if (definition.routeFlow && !isTerminalDialogue) {
      this.routeFlow = new NpcRouteFlow(
        this,
        definition.routeFlow,
        {
          x: 264,
          y: barY + 108,
          width: width - 360,
          height: this.dialogueBarHeight - 118
        },
        success => {
          this.activeNpc!.resultState = success ? "happy" : "angry";
          this.updateNpcIndicators();
          this.showResolutionDialogue();
        }
      );
      this.routeFlow.setVisible(false);
    } else {
      this.routeFlow = null;
    }

    [bar, barLine, portraitFrame, portrait, title, placeholderText, prompt].forEach(element => {
      element.setScrollFactor(0).setDepth(1000);
      this.dialogElements.push(element);
    });
  }

  private isSuccessDialogueActive() {
    return this.activeNpc?.resultState === "happy";
  }

  private isFailureDialogueActive() {
    return this.activeNpc?.resultState === "angry";
  }

  private isTerminalDialogueActive() {
    return this.isSuccessDialogueActive() || this.isFailureDialogueActive();
  }

  private scheduleSuccessClose() {
    if (this.successCloseTimer || !this.dialogOpen) {
      return;
    }

    const delay = this.activeNpc?.definition.successAutoCloseDelayMs ?? 1400;
    this.successCloseTimer = this.time.delayedCall(delay, () => {
      this.successCloseTimer = null;
      this.closeDialog();
    });
  }

  private clearSuccessCloseTimer() {
    this.successCloseTimer?.remove(false);
    this.successCloseTimer = null;
  }

  private showResolutionDialogue() {
    if (!this.activeNpc) {
      return;
    }

    this.clearSuccessCloseTimer();
    this.stopActiveNpcAudio();
    this.routeFlow?.destroy();
    this.routeFlow = null;
    this.dialogueTypewriter.clear();
    this.dialogElements.forEach(element => element.destroy());
    this.dialogElements = [];
    this.dialogueBarHeight = 212;
    this.buildDialogUi();
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    const activeNpc = this.activeNpc;
    this.updateCameraMode(gameSize.width, gameSize.height);
    if (this.dialogOpen) {
      this.closeDialog();
      this.activeNpc = activeNpc;
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
