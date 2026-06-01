import Phaser from "phaser";

type CollidableTileLayer = {
  getTileAt(tileX: number, tileY: number): Phaser.Tilemaps.Tile | null;
};

type BlockedPosition = {
  x: number;
  y: number;
};

export function findRandomOpenNpcPosition(
  collision: Phaser.Tilemaps.TilemapLayer | Phaser.Tilemaps.TilemapGPULayer,
  worldWidth: number,
  worldHeight: number,
  tileSize: number,
  spawnX: number,
  spawnY: number,
  blockedPositions: BlockedPosition[] = []
) {
  const layer = collision as unknown as CollidableTileLayer;
  const maxTileX = Math.floor(worldWidth / tileSize);
  const maxTileY = Math.floor(worldHeight / tileSize);
  const candidates: Array<{ x: number; y: number }> = [];

  for (let tileY = 1; tileY < maxTileY - 1; tileY += 1) {
    for (let tileX = 1; tileX < maxTileX - 1; tileX += 1) {
      const tile = layer.getTileAt(tileX, tileY);
      if (tile && tile.index !== -1) {
        continue;
      }

      const x = tileX * tileSize;
      const y = tileY * tileSize;
      if (Phaser.Math.Distance.Between(x, y, spawnX, spawnY) < 96) {
        continue;
      }

      if (blockedPositions.some(entry => Phaser.Math.Distance.Between(x, y, entry.x, entry.y) < 96)) {
        continue;
      }

      candidates.push({ x, y });
    }
  }

  if (candidates.length === 0) {
    return { x: spawnX + tileSize * 2, y: spawnY };
  }

  return candidates[Phaser.Math.Between(0, candidates.length - 1)];
}
