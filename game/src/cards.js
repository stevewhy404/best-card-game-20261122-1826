// Ember Court — the card library.
// Every card in the game lives here: its suit, its mana cost, what it does,
// and the words printed on the card. Suits are told apart by colour AND by
// shape, never by text alone: Flame is a red triangle, Frost a blue diamond,
// Leaf a green circle, Storm a violet star.

export const SUITS = {
  flame: { name: 'Flame', glyph: '▲', color: '#e2483d', soft: '#ff8a7a', dark: '#7d1d16' },
  frost: { name: 'Frost', glyph: '◆', color: '#3d9be2', soft: '#8ec8f5', dark: '#123f63' },
  leaf: { name: 'Leaf', glyph: '●', color: '#43b581', soft: '#8fe0b4', dark: '#124d33' },
  storm: { name: 'Storm', glyph: '★', color: '#9b59d0', soft: '#c99df0', dark: '#3f1d63' },
};

export const CARD_LIBRARY = [
  { id: 'cinder-spark', name: 'Cinder Spark', suit: 'flame', cost: 1, attack: 3, text: 'Deal 3 damage.' },
  { id: 'ember-slash', name: 'Ember Slash', suit: 'flame', cost: 2, attack: 5, text: 'Deal 5 damage.' },
  { id: 'dragon-breath', name: 'Dragon Breath', suit: 'flame', cost: 5, attack: 11, text: 'Deal 11 damage.' },
  { id: 'wildfire', name: 'Wildfire', suit: 'flame', cost: 3, attack: 7, text: 'Deal 7 damage.' },
  { id: 'snow-veil', name: 'Snow Veil', suit: 'frost', cost: 1, shield: 3, text: 'Gain 3 shield.' },
  { id: 'frost-wall', name: 'Frost Wall', suit: 'frost', cost: 2, shield: 6, text: 'Gain 6 shield.' },
  { id: 'ice-bastion', name: 'Ice Bastion', suit: 'frost', cost: 4, shield: 12, text: 'Gain 12 shield.' },
  { id: 'glacier-grip', name: 'Glacier Grip', suit: 'frost', cost: 3, shield: 5, attack: 3, text: 'Gain 5 shield. Deal 3 damage.' },
  { id: 'bloom-mend', name: 'Bloom Mend', suit: 'leaf', cost: 2, heal: 6, text: 'Restore 6 life.' },
  { id: 'ember-blossom', name: 'Ember Blossom', suit: 'leaf', cost: 3, heal: 9, draw: 1, text: 'Restore 9 life. Draw a card.' },
  { id: 'phoenix-rise', name: 'Phoenix Rise', suit: 'leaf', cost: 5, heal: 12, text: 'Restore 12 life.' },
  { id: 'thorn-vine', name: 'Thorn Vine', suit: 'storm', cost: 2, attack: 4, poison: 2, text: 'Deal 4 damage. Poison 2.' },
  { id: 'storm-call', name: 'Storm Call', suit: 'storm', cost: 4, attack: 8, text: 'Deal 8 damage.' },
  { id: 'wild-gamble', name: 'Wild Gamble', suit: 'storm', cost: 3, attack: 6, draw: 1, text: 'Deal 6 damage. Draw a card.' },
  { id: 'ember-pact', name: 'Ember Pact', suit: 'storm', cost: 1, attack: 2, draw: 1, text: 'Deal 2 damage. Draw a card.' },
  { id: 'court-decree', name: 'Court Decree', suit: 'flame', cost: 4, attack: 6, shield: 4, text: 'Deal 6 damage. Gain 4 shield.' },
];

export function cardsOfSuit(suit) {
  return CARD_LIBRARY.filter((card) => card.suit === suit);
}

export function cardById(id) {
  return CARD_LIBRARY.find((card) => card.id === id) ?? null;
}

export function suitOf(card) {
  return SUITS[card.suit];
}

export function describeCard(card) {
  const parts = [];
  if (card.attack) parts.push(`${card.attack} damage`);
  if (card.shield) parts.push(`${card.shield} shield`);
  if (card.heal) parts.push(`heal ${card.heal}`);
  if (card.poison) parts.push(`poison ${card.poison}`);
  if (card.draw) parts.push(`draw ${card.draw}`);
  return parts.join(' · ');
}

export function isPlayable(card, mana) {
  return card.cost <= mana;
}
