# Phaser RPG Test Assets

Minimal kit to validate a 2D RPG in the style of Pokemon using Phaser, TypeScript, Vite, and Tiled.

## What this prototype covers

- Exterior world built from `world-complete.png` with a Tiled collision layer.
- Interior house map with floor, walls, collisions, and an exit trigger.
- Basic player sprite with 4-direction movement.
- Camera follow with map bounds.

## How to run it

```bash
pnpm install
pnpm dev
```

## Build and checks

```bash
pnpm typecheck
pnpm build
```

## Controls

- WASD or arrow keys: move the player.
- Stay inside the world bounds; the outer border is blocked.

## Important files

- `public/assets/maps/world-complete.png`
- `public/assets/maps/world-complete.map.json`
- `public/assets/tilesets/collision-grid.png`
- `public/assets/tilesets/minimal-rpg-tileset.png`
- `public/assets/sprites/prota-sprite.png`
- `public/assets/maps/house.map.json`
- `src/scenes/WorldScene.ts`
- `src/scenes/HouseScene.ts`

## Current status

- The project is set up for pnpm only.
- The TypeScript build now has a `tsconfig.json`.
- The exterior map now uses a full-screen background image and a separate Tiled collision layer.
- The exterior scene currently contains only the player character.
