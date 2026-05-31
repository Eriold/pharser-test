import Phaser from "phaser";
import { BaseRpgScene } from "./BaseRpgScene";

type WorldSceneData = {
  spawnX?: number;
  spawnY?: number;
};

export class WorldScene extends BaseRpgScene {
  private spawnX = this.tileToWorld(16);
  private spawnY = this.tileToWorld(12);
  private transitionLocked = false;
  private npc!: Phaser.Physics.Arcade.Sprite;
  private npcRoute: Phaser.Math.Vector2[] = [];
  private npcRouteIndex = 0;
  private npcRouteDirection: 1 | -1 = 1;
  private readonly npcSpeed = 72;
  private readonly npcPauseDistance = 116;
  private npcFacing: "down" | "left" | "right" | "up" = "down";

  constructor() {
    super("WorldScene");
  }

  init(data: WorldSceneData) {
    this.spawnX = data.spawnX ?? this.tileToWorld(16);
    this.spawnY = data.spawnY ?? this.tileToWorld(12);
    this.transitionLocked = false;
  }

  preload() {
    super.preload();
    this.load.tilemapTiledJSON("world", "/assets/maps/world.map.json");
    this.load.spritesheet("girl-npc", "/assets/sprites/g1-npc.png", {
      frameWidth: 96,
      frameHeight: 108
    });
  }

  create() {
    const { map, collision } = this.buildMap("world");
    this.createPlayer(this.spawnX, this.spawnY);

    this.physics.add.collider(this.player, collision);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    const { object: door, zone } = this.getTriggerZone(map, "Triggers", "enter_house");
    this.createGirlNpc(zone, collision as Phaser.Tilemaps.TilemapLayer);
    this.physics.add.collider(this.player, this.npc);

    this.physics.add.overlap(this.player, zone, () => {
      if (this.transitionLocked) {
        return;
      }

      this.transitionLocked = true;
      this.scene.start("HouseScene", {
        spawnX: 320 + this.tileToWorld(5) + this.tileSize,
        spawnY: 104 + this.tileToWorld(5) + this.tileSize,
        returnX: (door.x! + door.width! / 2) * this.mapScale,
        returnY: (door.y! + door.height! + 16) * this.mapScale
      });
    });

    this.addHint("Ciudad exterior: muévete con WASD/Flechas y entra a la casa.");
  }

  update() {
    this.movePlayer();
    this.player.setDepth(this.player.y);
    this.updateGirlNpc();
  }

  private createGirlNpc(doorZone: Phaser.GameObjects.Zone, worldCollision: Phaser.Tilemaps.TilemapLayer) {
    const routeTileSize = this.tileSize * this.mapScale;

    this.npcRoute = [
      new Phaser.Math.Vector2(doorZone.x - routeTileSize * 1.5, doorZone.y + routeTileSize * 2),
      new Phaser.Math.Vector2(doorZone.x + routeTileSize * 1.5, doorZone.y + routeTileSize * 2),
      new Phaser.Math.Vector2(doorZone.x + routeTileSize * 1.5, doorZone.y + routeTileSize * 4),
      new Phaser.Math.Vector2(doorZone.x - routeTileSize * 1.5, doorZone.y + routeTileSize * 4)
    ];

    const startPoint = this.npcRoute[0];
    this.npc = this.physics.add.sprite(startPoint.x, startPoint.y, "girl-npc", 0);
    this.npc.setDisplaySize(70, 79);
    this.npc.setSize(36, 20);
    this.npc.setOffset(30, 84);
    this.npc.setDepth(this.npc.y);
    this.npc.setImmovable(true);
    this.npcRouteIndex = 1;
    this.npcRouteDirection = Math.random() > 0.5 ? 1 : -1;
    this.physics.add.collider(this.npc, worldCollision);

    this.registerGirlNpcAnimations();
    this.setGirlNpcIdle("down");
  }

  private registerGirlNpcAnimations() {
    if (!this.anims.exists("girl-walk-down")) {
      this.anims.create({
        key: "girl-walk-down",
        frames: [0, 1, 2, 3, 4, 5].map(frame => ({ key: "girl-npc", frame })),
        frameRate: 8,
        repeat: -1
      });
    }

    if (!this.anims.exists("girl-walk-up")) {
      this.anims.create({
        key: "girl-walk-up",
        frames: [6, 7, 8, 9, 10, 11].map(frame => ({ key: "girl-npc", frame })),
        frameRate: 8,
        repeat: -1
      });
    }

    if (!this.anims.exists("girl-walk-left")) {
      this.anims.create({
        key: "girl-walk-left",
        frames: [12, 13, 14, 15, 16, 17].map(frame => ({ key: "girl-npc", frame })),
        frameRate: 8,
        repeat: -1
      });
    }

    if (!this.anims.exists("girl-walk-right")) {
      this.anims.create({
        key: "girl-walk-right",
        frames: [18, 19, 20, 21, 22, 23].map(frame => ({ key: "girl-npc", frame })),
        frameRate: 8,
        repeat: -1
      });
    }
  }

  private updateGirlNpc() {
    if (!this.npc || this.npcRoute.length === 0) {
      return;
    }

    const body = this.npc.body as Phaser.Physics.Arcade.Body;
    const playerDistance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.npc.x,
      this.npc.y
    );

    if (playerDistance <= this.npcPauseDistance) {
      body.setVelocity(0);
      this.setGirlNpcIdle(this.npcFacing);
      this.npc.setDepth(this.npc.y);
      return;
    }

    const target = this.npcRoute[this.npcRouteIndex];
    const dx = target.x - this.npc.x;
    const dy = target.y - this.npc.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 6) {
      this.npc.setPosition(target.x, target.y);
      body.setVelocity(0);
      this.advanceGirlNpcRoute();
      return;
    }

    body.setVelocity(0);

    if (Math.abs(dx) > Math.abs(dy)) {
      body.setVelocityX(Math.sign(dx) * this.npcSpeed);
      this.npcFacing = dx > 0 ? "right" : "left";
      this.npc.anims.play(dx > 0 ? "girl-walk-right" : "girl-walk-left", true);
    } else {
      body.setVelocityY(Math.sign(dy) * this.npcSpeed);
      this.npcFacing = dy > 0 ? "down" : "up";
      this.npc.anims.play(dy > 0 ? "girl-walk-down" : "girl-walk-up", true);
    }

    this.npc.setDepth(this.npc.y);
  }

  private advanceGirlNpcRoute() {
    const current = this.npcRoute[this.npcRouteIndex];
    const previous = this.npcRoute[(this.npcRouteIndex - this.npcRouteDirection + this.npcRoute.length) % this.npcRoute.length];

    if (Math.random() < 0.35) {
      this.npcRouteDirection = this.npcRouteDirection === 1 ? -1 : 1;
    }

    this.npcRouteIndex =
      (this.npcRouteIndex + this.npcRouteDirection + this.npcRoute.length) % this.npcRoute.length;

    const next = this.npcRoute[this.npcRouteIndex];

    if (next.x > current.x) this.setGirlNpcIdle("right");
    else if (next.x < current.x) this.setGirlNpcIdle("left");
    else if (next.y > current.y) this.setGirlNpcIdle("down");
    else if (next.y < current.y) this.setGirlNpcIdle("up");
    else if (previous.x !== current.x || previous.y !== current.y) this.setGirlNpcIdle("down");
  }

  private setGirlNpcIdle(direction: "down" | "left" | "right" | "up") {
    const idleFrames = {
      down: 0,
      up: 6,
      left: 12,
      right: 18
    };

    this.npcFacing = direction;
    this.npc.anims.stop();
    this.npc.setFrame(idleFrames[direction]);
  }
}
