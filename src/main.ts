import Phaser from "phaser";
import { WorldScene } from "./scenes/WorldScene";
import { HouseScene } from "./scenes/HouseScene";

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: 640,
  height: 480,
  pixelArt: true,
  backgroundColor: "#222",
  physics: {
    default: "arcade",
    arcade: { debug: false }
  },
  scene: [WorldScene, HouseScene]
});
