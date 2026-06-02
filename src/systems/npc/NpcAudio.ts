import Phaser from "phaser";
import type { NpcEntry } from "./NpcTypes";

export function playNpcAudio(scene: Phaser.Scene, activeNpc: NpcEntry | null, onComplete?: () => void) {
  const audio = activeNpc?.definition.audio;
  if (audio) {
    const sound = scene.sound.add(audio.key);
    if (onComplete) {
      sound.once(Phaser.Sound.Events.COMPLETE, onComplete);
    }
    sound.play();
    return sound;
  }

  return null;
}

export function stopNpcAudio(scene: Phaser.Scene, activeNpc: NpcEntry | null) {
  const audio = activeNpc?.definition.audio;
  if (audio) {
    scene.sound.stopByKey(audio.key);
  }
}
