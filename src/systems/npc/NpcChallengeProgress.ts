import type Phaser from "phaser";

const failureKey = "npc-failure-count";

export function resetNpcFailureCount(scene: Phaser.Scene) {
  scene.registry.set(failureKey, 0);
}

export function registerNpcFailure(scene: Phaser.Scene, limit: number) {
  const current = (scene.registry.get(failureKey) as number | undefined) ?? 0;
  const next = current + 1;
  scene.registry.set(failureKey, next);
  return next >= limit;
}
