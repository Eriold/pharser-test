import Phaser from "phaser";
import { WorldScene } from "./scenes/WorldScene";
import { HouseScene } from "./scenes/HouseScene";

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: 1280,
  height: 720,
  pixelArt: false,
  antialias: true,
  backgroundColor: "#222",
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.NO_CENTER
  },
  physics: {
    default: "arcade",
    arcade: { debug: false }
  },
  scene: [WorldScene, HouseScene]
});
