import { BaseRpgScene } from "./BaseRpgScene";

type HouseSceneData = {
  spawnX?: number;
  spawnY?: number;
  returnX?: number;
  returnY?: number;
};

export class HouseScene extends BaseRpgScene {
  private spawnX = 5 * 32;
  private spawnY = 2 * 32;
  private returnX = 10 * 32;
  private returnY = 9 * 32;
  private transitionLocked = false;

  constructor() {
    super("HouseScene");
  }

  init(data: HouseSceneData) {
    this.spawnX = data.spawnX ?? 5 * 32;
    this.spawnY = data.spawnY ?? 2 * 32;
    this.returnX = data.returnX ?? 10 * 32;
    this.returnY = data.returnY ?? 9 * 32;
    this.transitionLocked = false;
  }

  preload() {
    super.preload();
    this.load.tilemapTiledJSON("house", "/assets/maps/house.json");
  }

  create() {
    const { map, collision } = this.buildMap("house");
    this.createPlayer(this.spawnX, this.spawnY);

    this.physics.add.collider(this.player, collision);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    const { zone } = this.getTriggerZone(map, "Triggers", "exit_house");

    this.physics.add.overlap(this.player, zone, () => {
      if (this.transitionLocked) {
        return;
      }

      this.transitionLocked = true;
      this.scene.start("WorldScene", {
        spawnX: this.returnX,
        spawnY: this.returnY
      });
    });

    this.addHint("Interior de casa: camina hacia la puerta inferior para salir.");
  }

  update() {
    this.movePlayer();
    this.player.setDepth(this.player.y);
  }
}
