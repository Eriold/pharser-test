import Phaser from "phaser";
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
  }

  create() {
    this.add.image(0, 0, "world-complete").setOrigin(0).setDepth(0);

    const { map, collision } = this.buildCollisionMap("world-complete-map", "collision-grid");
    this.worldWidth = map.widthInPixels;
    this.worldHeight = map.heightInPixels;
    this.createPlayer(this.spawnX, this.spawnY);

    this.physics.add.collider(this.player, collision);
    this.updateCameraMode(this.scale.width, this.scale.height);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    });

    this.addHint("Ciudad exterior: muevete con WASD/Flechas. El borde esta bloqueado.");
  }

  update() {
    this.movePlayer();
    this.player.setDepth(this.player.y);
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    this.updateCameraMode(gameSize.width, gameSize.height);
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
