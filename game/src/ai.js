// Ember Court — the rival's brain.
// Queen Cinder is not random: she weighs every card in her hand against the
// table, plays her strongest line, and saves nothing for later. The weights
// below are the whole of her personality: hurt you when you are open, shield
// up when you are about to hit her, mend when she is bleeding.

import { cardById } from './cards.js';

export function scoreCardForAi(card, me, foe) {
  let score = 0;
  if (card.attack) {
    score += card.attack * 2;
    if (foe.shield === 0) score += 3;
    if (foe.life <= card.attack) score += 50;
  }
  if (card.shield) {
    score += card.shield * 1.4;
    if (me.life <= 12) score += 4;
  }
  if (card.heal) {
    score += me.life <= 15 ? card.heal * 2.2 : card.heal * 0.4;
  }
  if (card.poison) score += card.poison * 4;
  if (card.draw) score += 2;
  score -= card.cost * 0.6;
  return score;
}

export function chooseAiPlays(hand, mana, me, foe) {
  const choices = hand
    .map((id, index) => ({ id, index, card: cardById(id) }))
    .filter((entry) => entry.card && entry.card.cost <= mana)
    .map((entry) => ({ ...entry, score: scoreCardForAi(entry.card, me, foe) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
  const plays = [];
  let remaining = mana;
  for (const entry of choices) {
    if (entry.card.cost <= remaining) {
      plays.push(entry);
      remaining -= entry.card.cost;
    }
  }
  return plays;
}

export function aiBattleCry(me, foe) {
  if (foe.life <= 6) return 'Queen Cinder smiles. "Your ember gutters, little heir."';
  if (me.life <= 10) return 'Queen Cinder steadies herself. "The court does not fall so easily."';
  if (me.shield >= 10) return 'Queen Cinder raises her frost. "Come, then. Break my wall."';
  return 'Queen Cinder plays her hand. "The court is watching."';
}

export function aiShouldEndTurn(hand, mana) {
  return !hand.some((id) => {
    const card = cardById(id);
    return card && card.cost <= mana;
  });
}
