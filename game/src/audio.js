// Ember Court — sound, made of nothing but the Web Audio API.
// No audio files are loaded: every effect is a short oscillator tone, so the
// game stays fully offline. Sound starts only after a first click or key,
// as browsers require, and silence is always a valid fallback.

let audioContext = null;
let muted = false;

export function ensureAudioContext() {
  if (!audioContext) {
    try {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (AudioCtor) audioContext = new AudioCtor();
    } catch {
      audioContext = null;
    }
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

export function playTone(frequency, durationMs, type = 'sine', volume = 0.08) {
  if (muted) return;
  const context = ensureAudioContext();
  if (!context) return;
  try {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + durationMs / 1000);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + durationMs / 1000);
  } catch {
    // A failed tone never breaks the game.
  }
}

export function sfxPlayCard() {
  playTone(520, 90, 'triangle', 0.07);
  setTimeout(() => playTone(780, 110, 'triangle', 0.06), 70);
}

export function sfxHit() {
  playTone(160, 140, 'sawtooth', 0.06);
}

export function sfxHeal() {
  playTone(660, 120, 'sine', 0.06);
  setTimeout(() => playTone(880, 160, 'sine', 0.05), 90);
}

export function sfxTurn() {
  playTone(392, 100, 'sine', 0.05);
  setTimeout(() => playTone(523, 120, 'sine', 0.05), 90);
}

export function sfxDraw() {
  playTone(440, 60, 'sine', 0.04);
}

export function sfxWin() {
  [523, 659, 784, 1047].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 220, 'triangle', 0.08), i * 130);
  });
}

export function sfxLose() {
  [392, 330, 262, 196].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 260, 'sine', 0.07), i * 160);
  });
}
