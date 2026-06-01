import Phaser from "phaser";
import { WorldScene } from "./scenes/WorldScene";
import { HouseScene } from "./scenes/HouseScene";

const getViewportSize = () => ({
  width: Math.floor(window.visualViewport?.width ?? window.innerWidth),
  height: Math.floor(window.visualViewport?.height ?? window.innerHeight)
});

const initialSize = getViewportSize();

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: initialSize.width,
  height: initialSize.height,
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

const syncInitialSize = () => {
  game.scale.refresh();
};

window.addEventListener("load", syncInitialSize, { once: true });
requestAnimationFrame(syncInitialSize);
