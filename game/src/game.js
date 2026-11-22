// Ember Court — the rules engine.
// Two courtiers duel with living cards. Each has 30 life. Every turn the
// active side gains mana (1 more than the last turn, up to 10), draws a card,
// and may play as many cards as its mana allows. Shield soaks damage first.
// Poison bites at the start of the poisoned side's turn. The first side to
// reach 0 life loses the duel. Nothing here touches the screen; render.js
// draws whatever state this file produces.

import { cardById } from './cards.js';
import { buildDeck, drawCards } from './deck.js';
import { chooseAiPlays, aiBattleCry } from './ai.js';

export const STARTING_LIFE = 30;
export const MAX_MANA = 10;
export const HAND_LIMIT = 9;

export function createPlayer(name, title) {
  return {
    name,
    title,
    life: STARTING_LIFE,
    maxLife: STARTING_LIFE,
    shield: 0,
    poison: 0,
    mana: 0,
    maxMana: 0,
    hand: [],
    deck: [],
    damageDealt: 0,
    cardsPlayed: 0,
  };
}

export function createGame(seed = 20261123) {
  const game = {
    phase: 'title',
    turn: 1,
    seed,
    player: createPlayer('You', 'Ember Heir'),
    enemy: createPlayer('Queen Cinder', 'Ruler of the Ember Court'),
    log: ['The court is assembled. The duel begins.'],
    winner: null,
    lastAction: '',
  };
  game.player.deck = buildDeck(seed);
  game.enemy.deck = buildDeck(seed + 77);
  drawCards(game.player.hand, game.player.deck, 4);
  drawCards(game.enemy.hand, game.enemy.deck, 4);
  return game;
}

export function startTurn(game, side) {
  const actor = side === 'player' ? game.player : game.enemy;
  actor.maxMana = Math.min(MAX_MANA, actor.maxMana + 1);
  actor.mana = actor.maxMana;
  if (actor.poison > 0) {
    const bite = actor.poison;
    actor.life = Math.max(0, actor.life - bite);
    actor.poison = Math.max(0, actor.poison - 1);
    game.log.unshift(`${actor.name} suffers ${bite} poison.`);
  }
  drawCards(actor.hand, actor.deck, 1);
  if (actor.hand.length > HAND_LIMIT) actor.hand.length = HAND_LIMIT;
  game.lastAction = `${actor.name} begins turn ${game.turn}.`;
}

export function dealDamage(game, target, amount, sourceName) {
  let remaining = amount;
  if (target.shield > 0) {
    const absorbed = Math.min(target.shield, remaining);
    target.shield -= absorbed;
    remaining -= absorbed;
    game.log.unshift(`${target.name}'s shield absorbs ${absorbed}.`);
  }
  if (remaining > 0) {
    target.life = Math.max(0, target.life - remaining);
    game.log.unshift(`${sourceName} deals ${remaining} damage to ${target.name}.`);
  }
  return remaining;
}

export function applyCardEffect(game, actor, target, card) {
  if (card.attack) {
    dealDamage(game, target, card.attack, card.name);
    actor.damageDealt += card.attack;
  }
  if (card.shield) {
    actor.shield += card.shield;
    game.log.unshift(`${actor.name} gains ${card.shield} shield.`);
  }
  if (card.heal) {
    const healed = Math.min(card.heal, actor.maxLife - actor.life);
    actor.life += healed;
    game.log.unshift(`${actor.name} restores ${healed} life.`);
  }
  if (card.poison) {
    target.poison += card.poison;
    game.log.unshift(`${target.name} is poisoned (${target.poison}).`);
  }
  if (card.draw) drawCards(actor.hand, actor.deck, card.draw);
  actor.cardsPlayed += 1;
}

export function playCard(game, side, handIndex) {
  if (game.phase !== 'play') return { ok: false, reason: 'not playing' };
  const actor = side === 'player' ? game.player : game.enemy;
  const target = side === 'player' ? game.enemy : game.player;
  const card = cardById(actor.hand[handIndex]);
  if (!card) return { ok: false, reason: 'no such card' };
  if (card.cost > actor.mana) return { ok: false, reason: 'not enough mana' };
  actor.mana -= card.cost;
  actor.hand.splice(handIndex, 1);
  applyCardEffect(game, actor, target, card);
  game.lastAction = `${actor.name} plays ${card.name}.`;
  checkGameEnd(game);
  return { ok: true, card };
}

export function checkGameEnd(game) {
  if (game.phase !== 'play') return;
  if (game.enemy.life <= 0) {
    game.phase = 'over';
    game.winner = 'player';
    game.log.unshift('Queen Cinder falls. You take the Ember Court!');
  } else if (game.player.life <= 0) {
    game.phase = 'over';
    game.winner = 'enemy';
    game.log.unshift('Your ember fades. Queen Cinder keeps her throne.');
  }
}

export function runAiTurn(game) {
  if (game.phase !== 'play') return [];
  const played = [];
  startTurn(game, 'enemy');
  game.log.unshift(aiBattleCry(game.enemy, game.player));
  const choices = chooseAiPlays(game.enemy.hand, game.enemy.mana, game.enemy, game.player);
  for (const choice of choices) {
    const index = game.enemy.hand.indexOf(choice.id);
    if (index === -1) continue;
    const result = playCard(game, 'enemy', index);
    if (result.ok) played.push(result.card);
    if (game.phase !== 'play') break;
  }
  game.turn += 1;
  return played;
}

export function endPlayerTurn(game) {
  if (game.phase !== 'play') return [];
  const played = runAiTurn(game);
  if (game.phase === 'play') startTurn(game, 'player');
  return played;
}

export function beginDuel(game) {
  game.phase = 'play';
  game.turn = 1;
  startTurn(game, 'player');
  game.log.unshift('Your turn. Play a card, then end your turn.');
  return game;
}

export function buildDemoGame(mode) {
  const game = createGame(20261123);
  game.phase = 'play';
  game.player.maxMana = 5;
  game.player.mana = 3;
  game.enemy.maxMana = 5;
  game.enemy.mana = 5;
  game.turn = 3;
  game.player.hand = ['ember-slash', 'frost-wall', 'bloom-mend', 'thorn-vine', 'dragon-breath', 'storm-call'];
  game.enemy.hand = ['cinder-spark', 'ice-bastion', 'wildfire', 'ember-slash', 'glacier-grip'];
  game.player.life = 24;
  game.player.shield = 6;
  game.enemy.life = 19;
  game.enemy.shield = 4;
  game.enemy.poison = 2;
  game.player.damageDealt = 11;
  game.player.cardsPlayed = 4;
  game.enemy.damageDealt = 6;
  game.lastAction = 'Your move — play a card, then end your turn.';
  game.log = [
    'Queen Cinder plays Wildfire for 7 damage.',
    'You play Frost Wall and gain 6 shield.',
    'You play Ember Slash for 5 damage.',
    'Turn 3 — your move, Ember Heir.',
  ];
  if (mode === 'win') {
    game.enemy.life = 0;
    game.phase = 'over';
    game.winner = 'player';
    game.log.unshift('Dragon Breath lands. Queen Cinder falls!');
  } else if (mode === 'loss') {
    game.player.life = 0;
    game.phase = 'over';
    game.winner = 'enemy';
    game.log.unshift('Storm Call lands. Your ember fades.');
  }
  return game;
}
