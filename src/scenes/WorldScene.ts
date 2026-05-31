import { BaseRpgScene } from "./BaseRpgScene";

type WorldSceneData = {
  spawnX?: number;
  spawnY?: number;
};

export class WorldScene extends BaseRpgScene {
  private spawnX = this.tileToWorld(16);
  private spawnY = this.tileToWorld(12);
  private transitionLocked = false;

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
  }

  create() {
    const { map, collision } = this.buildMap("world");
    this.createPlayer(this.spawnX, this.spawnY);

    this.physics.add.collider(this.player, collision);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    const { object: door, zone } = this.getTriggerZone(map, "Triggers", "enter_house");

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
  }
}
