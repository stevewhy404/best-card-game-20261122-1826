// Ember Court — deck building and drawing.
// A deck is a shuffled pile of card ids. The same seed always builds the
// same order, so a screenshot state can be reproduced exactly.

import { CARD_LIBRARY } from './cards.js';

export function seededRandom(seed) {
  let state = (seed >>> 0) || 1;
  return function nextRandom() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function buildDeck(seed) {
  const random = seededRandom(seed);
  const ids = [];
  for (const card of CARD_LIBRARY) {
    ids.push(card.id, card.id);
  }
  return shuffleDeck(ids, random);
}

export function shuffleDeck(ids, random) {
  const pile = [...ids];
  for (let i = pile.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [pile[i], pile[j]] = [pile[j], pile[i]];
  }
  return pile;
}

export function drawCards(hand, deck, count) {
  const drawn = [];
  for (let i = 0; i < count && deck.length > 0; i += 1) {
    const id = deck.shift();
    hand.push(id);
    drawn.push(id);
  }
  return drawn;
}

export function peekTopCard(deck) {
  return deck.length > 0 ? deck[0] : null;
}

export function countInDeck(deck, id) {
  return deck.filter((entry) => entry === id).length;
}
