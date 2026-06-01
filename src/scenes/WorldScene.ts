import { BaseRpgScene } from "./BaseRpgScene";

type WorldSceneData = {
  spawnX?: number;
  spawnY?: number;
};

export class WorldScene extends BaseRpgScene {
  private spawnX = this.tileToWorld(28, 1);
  private spawnY = this.tileToWorld(15, 1);

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

    const { collision } = this.buildCollisionMap("world-complete-map", "collision-grid");
    this.createPlayer(this.spawnX, this.spawnY);

    this.physics.add.collider(this.player, collision);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.addHint("Ciudad exterior: muevete con WASD/Flechas. El borde esta bloqueado.");
  }

  update() {
    this.movePlayer();
    this.player.setDepth(this.player.y);
  }
}
