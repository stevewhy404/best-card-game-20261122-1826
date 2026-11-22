// Ember Court — the front door.
// Reads ?shot=title | play | win | loss from the address bar and renders
// that exact state on load, so screenshots are deterministic: the title, a
// full mid-duel table, the victory screen, or the defeat screen. With no
// ?shot, the game opens on the title screen and plays for real: click a card
// to play it, End Turn to hand the table to Queen Cinder, keys 1-7 to play
// from your hand, Enter to end your turn, R to start a fresh duel.

import { createGame, beginDuel, buildDemoGame, playCard, endPlayerTurn } from './game.js';
import { renderTitle, renderTable } from './render.js';
import { sfxPlayCard, sfxHit, sfxHeal, sfxWin, sfxLose, ensureAudioContext } from './audio.js';

const app = document.getElementById('app');
const statusLine = document.getElementById('status');

let game = createGame();

export function announce(message) {
  if (statusLine) statusLine.textContent = message;
}

export function playCardFromHand(index) {
  ensureAudioContext();
  const result = playCard(game, 'player', index);
  if (!result.ok) {
    announce(result.reason === 'not enough mana' ? 'Not enough mana for that card.' : 'That card cannot be played now.');
    return;
  }
  const card = result.card;
  if (card.attack) sfxHit();
  else if (card.heal) sfxHeal();
  else sfxPlayCard();
  if (game.phase === 'over') {
    if (game.winner === 'player') sfxWin();
    else sfxLose();
  }
  announce(game.lastAction);
  draw();
}

export function endTurnClicked() {
  ensureAudioContext();
  const played = endPlayerTurn(game);
  if (played.length > 0) sfxHit();
  if (game.phase === 'over' && game.winner === 'enemy') sfxLose();
  announce(game.lastAction);
  draw();
}

export function restartDuel() {
  ensureAudioContext();
  game = createGame();
  beginDuel(game);
  announce('A fresh duel begins. Your turn.');
  draw();
}

export function startFromTitle() {
  ensureAudioContext();
  beginDuel(game);
  announce('The duel begins. Your turn.');
  draw();
}

export function draw() {
  document.title = game.phase === 'title'
    ? 'Ember Court — a duel of living cards'
    : game.phase === 'over'
      ? `Ember Court — ${game.winner === 'player' ? 'Victory!' : 'Defeat'}`
      : `Ember Court — Turn ${game.turn} · You ${game.player.life} ❤ vs Queen Cinder ${game.enemy.life} ❤`;
  if (game.phase === 'title') {
    renderTitle(app, startFromTitle);
  } else {
    renderTable(app, game, {
      onPlayCard: playCardFromHand,
      onEndTurn: endTurnClicked,
      onRestart: restartDuel,
    });
  }
}

export function shotMode() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot === 'title' || shot === 'play' || shot === 'win' || shot === 'loss') return shot;
  return null;
}

export function boot() {
  const shot = shotMode();
  if (shot === 'title') {
    game.phase = 'title';
  } else if (shot === 'play') {
    game = buildDemoGame('play');
  } else if (shot === 'win') {
    game = buildDemoGame('win');
  } else if (shot === 'loss') {
    game = buildDemoGame('loss');
  }
  draw();
  document.addEventListener('keydown', (event) => {
    if (game.phase !== 'play') {
      if (event.key === 'r' || event.key === 'R' || event.key === 'Enter') restartDuel();
      return;
    }
    if (event.key >= '1' && event.key <= '7') {
      playCardFromHand(Number(event.key) - 1);
    } else if (event.key === 'Enter') {
      endTurnClicked();
    } else if (event.key === 'r' || event.key === 'R') {
      restartDuel();
    }
  });
}

boot();
