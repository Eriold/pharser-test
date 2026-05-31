import { BaseRpgScene } from "./BaseRpgScene";

type HouseSceneData = {
  spawnX?: number;
  spawnY?: number;
  returnX?: number;
  returnY?: number;
};

export class HouseScene extends BaseRpgScene {
  private readonly roomOffsetX = 160;
  private readonly roomOffsetY = 96;
  private readonly entrySpawnX = this.roomOffsetX + 5 * 32 + 16;
  private readonly entrySpawnY = this.roomOffsetY + 6 * 32 + 16;
  private spawnX = this.entrySpawnX;
  private spawnY = this.entrySpawnY;
  private returnX = 10 * 32;
  private returnY = 9 * 32;
  private transitionLocked = false;

  constructor() {
    super("HouseScene");
  }

  init(data: HouseSceneData) {
    this.spawnX = data.spawnX ?? this.entrySpawnX;
    this.spawnY = data.spawnY ?? this.entrySpawnY;
    this.returnX = data.returnX ?? 10 * 32;
    this.returnY = data.returnY ?? 9 * 32;
    this.transitionLocked = false;
  }

  preload() {
    super.preload();
    this.load.tilemapTiledJSON("house", "/assets/maps/house.map.json");
  }

  create() {
    this.cameras.main.setBackgroundColor("#000000");

    const { map, collision } = this.buildMap("house", this.roomOffsetX, this.roomOffsetY);
    this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
    this.cameras.main.setBounds(0, 0, this.scale.width, this.scale.height);
    this.createPlayer(this.spawnX, this.spawnY);

    this.physics.add.collider(this.player, collision);
    this.cameras.main.centerOn(
      this.roomOffsetX + map.widthInPixels / 2,
      this.roomOffsetY + map.heightInPixels / 2
    );

    const { object, zone } = this.getTriggerZone(map, "Triggers", "exit_house");
    zone.setPosition(zone.x + this.roomOffsetX, zone.y + this.roomOffsetY);
    const zoneBody = zone.body as Phaser.Physics.Arcade.StaticBody;
    zoneBody.updateFromGameObject();

    const exitMarker = this.add.rectangle(
      this.roomOffsetX + object.x! + object.width! / 2,
      this.roomOffsetY + object.y! + object.height! / 2,
      object.width!,
      object.height!,
      0xa46a2a
    );
    exitMarker.setDepth(0.5);

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

    this.addHint("Interior: la alfombra marron marca la salida.");
  }

  update() {
    this.movePlayer();
    this.player.setDepth(this.player.y);
  }
}
