import Phaser from "phaser";

type Direction = "down" | "left" | "right" | "up";

export abstract class BaseRpgScene extends Phaser.Scene {
  protected player!: Phaser.Physics.Arcade.Sprite;
  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  protected wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  protected speed = 150;
  protected readonly tileSize = 32;
  protected readonly mapScale = 2;

  preload() {
    this.load.image("tiles", "/assets/tilesets/minimal-rpg-tileset.png");
    this.load.spritesheet("player", "/assets/sprites/prota-sprite.png", {
      frameWidth: 96,
      frameHeight: 108
    });
  }

  protected createPlayer(x: number, y: number) {
    this.player = this.physics.add.sprite(x, y, "player", 1);
    this.player.setDisplaySize(79, 89);
    this.player.setSize(36, 20);
    this.player.setOffset(30, 84);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(y);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys("W,A,S,D") as Record<string, Phaser.Input.Keyboard.Key>;

    this.registerPlayerAnimations();
  }

  protected getTriggerZone(map: Phaser.Tilemaps.Tilemap, layerName: string, objectName: string) {
    const object = map.findObject(layerName, entry => entry.name === objectName);

    if (!object || object.x == null || object.y == null || object.width == null || object.height == null) {
      throw new Error(`Trigger object "${objectName}" was not found in layer "${layerName}".`);
    }

    const zone = this.add.zone(
      (object.x + object.width / 2) * this.mapScale,
      (object.y + object.height / 2) * this.mapScale,
      object.width * this.mapScale,
      object.height * this.mapScale
    );
    this.physics.add.existing(zone, true);

    return { object, zone };
  }

  protected tileToWorld(tile: number, scale = this.mapScale) {
    return tile * this.tileSize * scale;
  }

  protected setPlayerIdle(direction: Direction) {
    const idleFrames: Record<Direction, number> = {
      down: 0,
      up: 6,
      left: 12,
      right: 18
    };

    this.player.anims.stop();
    this.player.setFrame(idleFrames[direction]);
  }

  private registerPlayerAnimations() {
    if (!this.anims.exists("walk-down")) {
      this.anims.create({
        key: "walk-down",
        frames: this.anims.generateFrameNumbers("player", { start: 0, end: 5 }),
        frameRate: 12,
        repeat: -1
      });
    }

    if (!this.anims.exists("walk-right")) {
      this.anims.create({
        key: "walk-right",
        frames: this.anims.generateFrameNumbers("player", { start: 18, end: 23 }),
        frameRate: 12,
        repeat: -1
      });
    }

    if (!this.anims.exists("walk-left")) {
      this.anims.create({
        key: "walk-left",
        frames: this.anims.generateFrameNumbers("player", { start: 12, end: 17 }),
        frameRate: 12,
        repeat: -1
      });
    }

    if (!this.anims.exists("walk-up")) {
      this.anims.create({
        key: "walk-up",
        frames: this.anims.generateFrameNumbers("player", { start: 6, end: 11 }),
        frameRate: 12,
        repeat: -1
      });
    }
  }

  protected movePlayer() {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    let dir: Direction = "down";
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;

    if (left) {
      body.setVelocityX(-this.speed);
      dir = "left";
    } else if (right) {
      body.setVelocityX(this.speed);
      dir = "right";
    }

    if (up) {
      body.setVelocityY(-this.speed);
      dir = "up";
    } else if (down) {
      body.setVelocityY(this.speed);
      dir = "down";
    }

    if (left || right || up || down) {
      body.velocity.normalize().scale(this.speed);
      this.player.anims.play(`walk-${dir}`, true);
    } else {
      this.player.anims.stop();
    }
  }

  protected buildMap(mapKey: string, offsetX = 0, offsetY = 0) {
    const map = this.make.tilemap({ key: mapKey });
    const tileset = map.addTilesetImage("minimal-rpg-tileset", "tiles");

    if (!tileset) {
      throw new Error(`Tileset "minimal-rpg-tileset" could not be resolved for map "${mapKey}".`);
    }

    const ground = map.createLayer("Ground", tileset, offsetX, offsetY)!;
    const objects = map.createLayer("Objects", tileset, offsetX, offsetY)!;
    const collision = map.createLayer("Collision", tileset, offsetX, offsetY)!;
    ground.setScale(this.mapScale);
    objects.setScale(this.mapScale);
    collision.setScale(this.mapScale);
    collision.setCollisionByExclusion([-1]);
    collision.setVisible(false);

    this.physics.world.setBounds(
      offsetX,
      offsetY,
      map.widthInPixels * this.mapScale,
      map.heightInPixels * this.mapScale
    );
    this.cameras.main.setBounds(
      offsetX,
      offsetY,
      map.widthInPixels * this.mapScale,
      map.heightInPixels * this.mapScale
    );

    return { map, ground, objects, collision };
  }

  protected buildCollisionMap(
    mapKey: string,
    tilesetImageKey: string,
    tilesetName = tilesetImageKey,
    layerName = "Collision",
    offsetX = 0,
    offsetY = 0,
    scale = 1
  ) {
    const map = this.make.tilemap({ key: mapKey });
    const tileset = map.addTilesetImage(tilesetName, tilesetImageKey);

    if (!tileset) {
      throw new Error(`Tileset "${tilesetName}" could not be resolved for map "${mapKey}".`);
    }

    const collision = map.createLayer(layerName, tileset, offsetX, offsetY)!;
    collision.setScale(scale);
    collision.setCollisionByExclusion([-1]);
    collision.setVisible(false);

    const boundsWidth = map.widthInPixels * scale;
    const boundsHeight = map.heightInPixels * scale;
    this.physics.world.setBounds(offsetX, offsetY, boundsWidth, boundsHeight);
    this.cameras.main.setBounds(offsetX, offsetY, boundsWidth, boundsHeight);

    return { map, collision };
  }

  protected addHint(text: string) {
    this.add
      .text(12, 12, text, {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#000000aa",
        padding: { x: 8, y: 6 }
      })
      .setScrollFactor(0)
      .setDepth(100);
  }
}
