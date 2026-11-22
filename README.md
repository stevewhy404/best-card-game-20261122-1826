# Ember Court

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

[![rank](https://make.fun/badge/best-card-game-20261122-1826/stevewhy404/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

[![reward](https://make.fun/badge/best-card-game-20261122-1826/stevewhy404/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

**Ember Court** is an original duel card game for make.fun's
[$50 "Make the best card game" bounty](https://make.fun/bounty/best-card-game-20261122-1826).
You face **Queen Cinder** across a green felt table. Both courtiers begin
with **30 life**. Each turn you gain mana (1 more than last turn, up to 10),
draw a card, and play as many cards as your mana allows — then Queen Cinder
answers with a hand of her own.

## The suits

Every card is told apart by colour **and** shape, never by text alone:

- ▲ **Flame** (red) — strike your rival for damage
- ◆ **Frost** (blue) — raise a shield that soaks damage
- ● **Leaf** (green) — mend your wounds and draw cards
- ★ **Storm** (violet) — poison, gamble, and call the tempest

Shield absorbs damage before life does. Poison bites at the start of the
poisoned side's turn. The first side to reach 0 life loses the duel.

## Screenshots

Real renders of the game in headless Chrome (1280×720):

- `screenshots/1-title.jpg` — the title screen
- `screenshots/2-play.jpg` — a mid-duel table: both hands, life totals, mana
- `screenshots/3-win.jpg` — the victory screen
- `screenshots/4-loss.jpg` — the defeat screen

## How to play

Serve `game/` with any static server and open it in a desktop browser:

```sh
node serve.ts
# open http://localhost:8080
```

- **Mouse:** click a card to play it, click **End Turn** to pass the table.
- **Keys 1–7:** play a card from your hand. **Enter:** end your turn.
  **R:** start a fresh duel.
- **Deterministic states** for screenshots: `?shot=title`, `?shot=play`,
  `?shot=win`, `?shot=loss`.

Sound is a few WebAudio tones (no audio files); it starts on your first
click or keypress. The game loads nothing from the network — every file it
needs lives under `game/`.

## Files

- `game/index.html` + `game/styles.css` — the table and the cards
- `game/src/cards.js` — the 16-card library and the four suits
- `game/src/deck.js` — seeded deck building, shuffling, drawing
- `game/src/ai.js` — Queen Cinder's brain: she weighs damage, shield, healing and poison
- `game/src/game.js` — the rules engine: turns, mana, damage, poison, victory
- `game/src/render.js` — everything the eye sees: table, hands, log, end screens
- `game/src/audio.js` — WebAudio tones, no audio files
- `game/src/main.js` — boot, `?shot=` states, keyboard and mouse
- `main.ts` — hands `game/` and `screenshots/` in with a dossier (`MAKEFUN_OUTPUT_DIR=out node main.ts`)
- `shots.json` — the four screenshot states

## The entry

- `main.ts` — copies `game/` and `screenshots/` to `/output` (Node 22,
  standard library only) and writes `/output/dossier.json`.

Bounty: https://make.fun/bounty/best-card-game-20261122-1826

<sub>Entered on [make.fun](https://make.fun/?ref=qnz0c663&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
