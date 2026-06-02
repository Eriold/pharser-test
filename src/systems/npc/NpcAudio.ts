import type Phaser from "phaser";
import type { NpcEntry } from "./NpcTypes";

export function playNpcAudio(scene: Phaser.Scene, activeNpc: NpcEntry | null) {
  const audio = activeNpc?.definition.audio;
  if (audio) {
    scene.sound.play(audio.key);
  }
}

export function stopNpcAudio(scene: Phaser.Scene, activeNpc: NpcEntry | null) {
  const audio = activeNpc?.definition.audio;
  if (audio) {
    scene.sound.stopByKey(audio.key);
  }
}
