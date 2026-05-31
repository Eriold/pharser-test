# Phaser RPG Test Assets

Minimal kit to validate a 2D RPG in the style of Pokemon using Phaser, TypeScript, Vite, and Tiled.

## What this prototype covers

- Exterior world map with a small city/countryside layout, houses, roads, trees, collisions, and a door trigger.
- Interior house map with floor, walls, collisions, and an exit trigger.
- Basic player sprite with 4-direction movement.
- Scene transitions between world and house.
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
- Walk over the door trigger to enter or leave the house.

## Important files

- `public/assets/tilesets/minimal-rpg-tileset.png`
- `public/assets/sprites/player.png`
- `public/assets/maps/world.json`
- `public/assets/maps/house.json`
- `src/scenes/WorldScene.ts`
- `src/scenes/HouseScene.ts`

## Current status

- The project is set up for pnpm only.
- The TypeScript build now has a `tsconfig.json`.
- The exterior map is now a compact town-like area with a walkable route and an enterable house.
- The two scenes preserve their spawn points through transitions.
