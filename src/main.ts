import Phaser from "phaser";
import { WorldScene } from "./scenes/WorldScene";
import { HouseScene } from "./scenes/HouseScene";

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: 1280,
  height: 720,
  pixelArt: true,
  antialias: false,
  backgroundColor: "#222",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: "arcade",
    arcade: { debug: false }
  },
  scene: [WorldScene, HouseScene]
});
