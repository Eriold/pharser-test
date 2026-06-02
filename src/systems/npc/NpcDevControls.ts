import Phaser from "phaser";

export function addDevCompleteButton(
  scene: Phaser.Scene,
  onClick: () => void
) {
  const container = scene.add.container(16, 16).setScrollFactor(0).setDepth(4000);
  const background = scene.add.rectangle(0, 0, 220, 44, 0x0f172a, 0.92).setOrigin(0);
  background.setStrokeStyle(2, 0x38bdf8, 1);
  const label = scene.add.text(110, 22, "TEST: Complete all", {
    fontFamily: "monospace",
    fontSize: "18px",
    color: "#e2e8f0"
  }).setOrigin(0.5);
  container.add([background, label]);
  container.setSize(220, 44);
  container.setInteractive(new Phaser.Geom.Rectangle(0, 0, 220, 44), Phaser.Geom.Rectangle.Contains);
  container.on("pointerdown", onClick);
  return container;
}
