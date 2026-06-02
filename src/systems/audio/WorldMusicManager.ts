import type Phaser from "phaser";

const backgroundMusicKey = "background-music";
const challengeLoopKey = "challenge-loop";
const musicVolumeMultiplier = 0.4;
const backgroundMusicVolume = 0.25 * musicVolumeMultiplier;
const challengeLoopVolume = 0.25 * musicVolumeMultiplier;

export class WorldMusicManager {
  constructor(private readonly scene: Phaser.Scene) { }

  static preload(load: Phaser.Loader.LoaderPlugin) {
    load.audio(backgroundMusicKey, "/assets/sounds/background.mp3");
    load.audio(challengeLoopKey, "/assets/sounds/loop.m4a");
  }

  startCityMusic() {
    this.scene.sound.stopByKey(challengeLoopKey);
    this.scene.sound.play(backgroundMusicKey, { loop: true, volume: backgroundMusicVolume });
  }

  pauseCityMusic() {
    this.scene.sound.stopByKey(backgroundMusicKey);
  }

  startChallengeMusic() {
    this.scene.sound.stopByKey(backgroundMusicKey);
    this.scene.sound.play(challengeLoopKey, { loop: true, volume: challengeLoopVolume });
  }

  stopChallengeMusic() {
    this.scene.sound.stopByKey(challengeLoopKey);
  }

  stopAll() {
    this.scene.sound.stopByKey(backgroundMusicKey);
    this.scene.sound.stopByKey(challengeLoopKey);
  }
}
