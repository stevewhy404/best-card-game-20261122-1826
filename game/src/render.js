// Ember Court — everything the eye sees.
// The table is plain DOM: a felt board, two life totals, two hands of big
// readable cards, and the log. Cards are coloured by suit and carry their
// cost, value and name in large type, so the game reads even at thumbnail
// size. No images are loaded; every pip is a glyph and a colour.

import { cardById, suitOf, describeCard, isPlayable } from './cards.js';

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function lifeBar(side) {
  const wrap = el('div', 'lifebar');
  const fill = el('div', 'lifebar-fill');
  fill.style.width = `${Math.max(0, Math.round((side.life / side.maxLife) * 100))}%`;
  if (side.life <= 10) fill.classList.add('low');
  wrap.appendChild(fill);
  return wrap;
}

export function heroPanel(side, isEnemy) {
  const panel = el('section', isEnemy ? 'hero enemy' : 'hero you');
  const name = el('h2', 'hero-name', side.name);
  const title = el('p', 'hero-title', side.title);
  const life = el('p', 'hero-life', `❤ ${side.life} / ${side.maxLife}`);
  const shield = el('p', 'hero-shield', side.shield > 0 ? `🛡 Shield ${side.shield}` : '🛡 Shield 0');
  const poison = el('p', 'hero-poison', side.poison > 0 ? `☠ Poison ${side.poison}` : '');
  const mana = el('p', 'hero-mana', `◆ Mana ${side.mana} / ${side.maxMana}`);
  panel.append(name, title, life, lifeBar(side), shield, poison, mana);
  return panel;
}

export function cardElement(card, options = {}) {
  const suit = suitOf(card);
  const node = el('article', 'card');
  node.style.setProperty('--suit', options.faceDown ? '#d4af37' : suit.color);
  node.style.setProperty('--suit-soft', options.faceDown ? '#ffe27a' : suit.soft);
  node.style.setProperty('--suit-dark', options.faceDown ? '#8a6d1f' : suit.dark);
  if (options.faceDown) node.classList.add('facedown');
  if (options.playable === false) node.classList.add('unplayable');
  if (options.selected) node.classList.add('selected');
  const cost = el('span', 'card-cost', String(card.cost));
  const glyph = el('span', 'card-glyph', options.faceDown ? '?' : suit.glyph);
  const name = el('h3', 'card-name', options.faceDown ? 'Ember Court' : card.name);
  const value = el('p', 'card-value', options.faceDown ? '' : describeCard(card));
  const suitName = el('p', 'card-suit', options.faceDown ? '' : `${suit.glyph} ${suit.name}`);
  const text = el('p', 'card-text', options.faceDown ? '' : card.text);
  node.append(cost, glyph, name, value, suitName, text);
  if (options.onPlay) {
    node.tabIndex = 0;
    node.setAttribute('role', 'button');
    node.setAttribute('aria-label', `${card.name}, cost ${card.cost}, ${describeCard(card)}`);
    node.addEventListener('click', options.onPlay);
    node.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        options.onPlay();
      }
    });
  }
  return node;
}

export function handRow(hand, options = {}) {
  const row = el('div', 'hand');
  hand.forEach((id, index) => {
    const card = cardById(id);
    if (!card) return;
    const faceDown = options.faceDown === true;
    const playable = options.playable ? isPlayable(card, options.playable) : true;
    row.appendChild(cardElement(card, {
      faceDown,
      playable,
      onPlay: options.onPlay ? () => options.onPlay(index) : undefined,
    }));
  });
  if (hand.length === 0) row.appendChild(el('p', 'hand-empty', 'No cards in hand.'));
  return row;
}

export function logPanel(entries) {
  const panel = el('aside', 'log');
  panel.appendChild(el('h2', 'log-title', 'Court Chronicle'));
  const list = el('ul', 'log-list');
  for (const entry of entries.slice(0, 6)) {
    list.appendChild(el('li', 'log-line', entry));
  }
  panel.appendChild(list);
  return panel;
}

export function renderTitle(root, onStart) {
  root.innerHTML = '';
  const screen = el('div', 'title-screen');
  const crown = el('p', 'title-crown', '♛');
  const heading = el('h1', 'title-heading', 'EMBER COURT');
  const sub = el('p', 'title-sub', 'A duel of living cards');
  const rules = el('div', 'title-rules');
  rules.appendChild(el('p', '', 'Both courtiers begin with 30 life. Spend mana to play cards:'));
  const list = el('ul', 'title-list');
  list.appendChild(el('li', '', '▲ Flame — strike your rival for damage'));
  list.appendChild(el('li', '', '◆ Frost — raise a shield that soaks damage'));
  list.appendChild(el('li', '', '● Leaf — mend your wounds and draw cards'));
  list.appendChild(el('li', '', '★ Storm — poison, gamble, and call the tempest'));
  rules.append(list);
  rules.appendChild(el('p', '', 'Reduce Queen Cinder to 0 life before she does the same to you.'));
  const button = el('button', 'big-button', '▶ Begin the Duel');
  button.addEventListener('click', onStart);
  const keys = el('p', 'title-keys', 'Mouse: click a card to play it · Keys 1–7 play a card · Enter ends your turn · R restarts');
  screen.append(crown, heading, sub, rules, button, keys);
  root.appendChild(screen);
}

export function renderEndOverlay(root, game, onRestart) {
  const won = game.winner === 'player';
  const overlay = el('div', won ? 'end-overlay win' : 'end-overlay loss');
  overlay.appendChild(el('p', 'end-glyph', won ? '♛' : '☠'));
  overlay.appendChild(el('h2', 'end-title', won ? 'VICTORY!' : 'DEFEAT'));
  overlay.appendChild(el('p', 'end-line', won
    ? 'Queen Cinder falls. The Ember Court is yours!'
    : 'Your ember fades. Queen Cinder keeps her throne.'));
  const stats = el('p', 'end-stats',
    `Turns: ${game.turn} · Cards played: ${game.player.cardsPlayed} · Damage dealt: ${game.player.damageDealt}`);
  overlay.appendChild(stats);
  const button = el('button', 'big-button', '↻ Play Again (R)');
  button.addEventListener('click', onRestart);
  overlay.appendChild(button);
  root.appendChild(overlay);
}

export function renderTable(root, game, handlers) {
  root.innerHTML = '';
  const table = el('div', 'table');
  const top = el('div', 'table-top');
  top.appendChild(heroPanel(game.enemy, true));
  const enemyHand = el('div', 'hand-zone enemy-hand');
  enemyHand.appendChild(el('h2', 'hand-label', `Queen Cinder's hand — ${game.enemy.hand.length} cards`));
  enemyHand.appendChild(handRow(game.enemy.hand, { faceDown: true }));
  top.appendChild(enemyHand);
  const middle = el('div', 'table-middle');
  const turn = el('p', 'turn-banner', `Turn ${game.turn} — ${game.lastAction}`);
  const endTurn = el('button', 'end-turn', 'End Turn ⏎');
  endTurn.addEventListener('click', handlers.onEndTurn);
  middle.append(turn, endTurn);
  const bottom = el('div', 'table-bottom');
  const yourHand = el('div', 'hand-zone your-hand');
  yourHand.appendChild(el('h2', 'hand-label', `Your hand — ${game.player.hand.length} cards · Mana ${game.player.mana}/${game.player.maxMana}`));
  yourHand.appendChild(handRow(game.player.hand, {
    playable: game.player.mana,
    onPlay: handlers.onPlayCard,
  }));
  bottom.append(heroPanel(game.player, false), yourHand);
  table.append(top, middle, bottom);
  root.appendChild(table);
  root.appendChild(logPanel(game.log));
  if (game.phase === 'over') renderEndOverlay(root, game, handlers.onRestart);
}
