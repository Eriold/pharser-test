import Phaser from "phaser";

export class NpcDialogueTypewriter {
  private textObject: Phaser.GameObjects.Text | null = null;
  private fullText = "";
  private currentIndex = 0;
  private elapsedMs = 0;
  private speedMs = 24;
  private active = false;

  attach(textObject: Phaser.GameObjects.Text) {
    this.textObject = textObject;
    return this;
  }

  start(fullText: string, speedMs: number) {
    this.fullText = fullText;
    this.speedMs = Math.max(1, speedMs);
    this.currentIndex = 0;
    this.elapsedMs = 0;
    this.active = true;

    this.textObject?.setText("");
  }

  update(deltaMs: number) {
    if (!this.active || !this.textObject) {
      return;
    }

    this.elapsedMs += deltaMs;

    while (this.elapsedMs >= this.speedMs && this.currentIndex < this.fullText.length) {
      this.elapsedMs -= this.speedMs;
      this.currentIndex += 1;
      this.textObject.setText(this.fullText.slice(0, this.currentIndex));
    }

    if (this.currentIndex >= this.fullText.length) {
      this.active = false;
    }
  }

  skip() {
    if (!this.textObject) {
      return;
    }

    this.currentIndex = this.fullText.length;
    this.elapsedMs = 0;
    this.active = false;
    this.textObject.setText(this.fullText);
  }

  isComplete() {
    return !this.active && this.currentIndex >= this.fullText.length;
  }

  clear() {
    this.textObject = null;
    this.fullText = "";
    this.currentIndex = 0;
    this.elapsedMs = 0;
    this.active = false;
  }
}
