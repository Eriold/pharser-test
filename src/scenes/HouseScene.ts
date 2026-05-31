import { BaseRpgScene } from "./BaseRpgScene";

type HouseSceneData = {
  spawnX?: number;
  spawnY?: number;
  returnX?: number;
  returnY?: number;
};

export class HouseScene extends BaseRpgScene {
  private readonly roomOffsetX = 320;
  private readonly roomOffsetY = 104;
  private readonly entrySpawnX = this.roomOffsetX + this.tileToWorld(5) + this.tileSize;
  private readonly entrySpawnY = this.roomOffsetY + this.tileToWorld(5) + this.tileSize;
  private spawnX = this.entrySpawnX;
  private spawnY = this.entrySpawnY;
  private returnX = this.tileToWorld(10);
  private returnY = this.tileToWorld(9);
  private transitionLocked = false;
  private exitArmed = false;
  private exitZone!: Phaser.GameObjects.Zone;

  constructor() {
    super("HouseScene");
  }

  init(data: HouseSceneData) {
    this.spawnX = data.spawnX ?? this.entrySpawnX;
    this.spawnY = data.spawnY ?? this.entrySpawnY;
    this.returnX = data.returnX ?? this.tileToWorld(10);
    this.returnY = data.returnY ?? this.tileToWorld(9);
    this.transitionLocked = false;
    this.exitArmed = false;
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
    this.setPlayerIdle("up");

    this.physics.add.collider(this.player, collision);
    this.cameras.main.centerOn(
      this.roomOffsetX + (map.widthInPixels * this.mapScale) / 2,
      this.roomOffsetY + (map.heightInPixels * this.mapScale) / 2
    );

    const { object, zone } = this.getTriggerZone(map, "Triggers", "exit_house");
    this.exitZone = zone;
    this.exitZone.setPosition(zone.x + this.roomOffsetX, zone.y + this.roomOffsetY);
    const zoneBody = this.exitZone.body as Phaser.Physics.Arcade.StaticBody;
    zoneBody.updateFromGameObject();

    const exitMarker = this.add.rectangle(
      this.roomOffsetX + (object.x! + object.width! / 2) * this.mapScale,
      this.roomOffsetY + (object.y! + object.height! / 2) * this.mapScale,
      object.width! * this.mapScale,
      object.height! * this.mapScale,
      0xa46a2a
    );
    exitMarker.setDepth(0.5);

    this.physics.add.overlap(this.player, this.exitZone, () => {
      if (!this.exitArmed) {
        return;
      }

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

    if (!this.exitArmed && !this.physics.world.overlap(this.player, this.exitZone)) {
      this.exitArmed = true;
    }
  }
}
