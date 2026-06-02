# Project Experience

This prototype was useful because it turned a simple Phaser world into a focused educational loop.

## What was learned

- A route-based game works best when NPCs are data-driven instead of hardcoded.
- Dialogue, audio, and route validation are easier to maintain when each NPC has its own definition.
- The world scene stays manageable only if music, dialogue UI, end-game flow, and failure flow are split into helpers.
- Reusable route stages made it possible to add many NPCs without duplicating the same logic.
- A clear success/failure state gives the player immediate feedback and makes the game feel instructional.
- Centralizing asset URLs made the project safer to deploy on GitHub Pages.

## What worked well

- One shared interaction system for all NPCs.
- Voice, text, and route challenge timing separated cleanly.
- A consistent visual language for alerts, portraits, and dialogue boxes.
- A final win and lose flow that closes the loop clearly.

## Why this version feels good

- It is small enough to test quickly.
- It already feels like a complete first educational version.
- It supports future expansion without forcing a rewrite.

## Next lessons to explore

- Better asset compression for web delivery.
- More compact HUD layouts for smaller screens.
- More NPC variations and challenge types.
- A cleaner progression system for the whole city.
