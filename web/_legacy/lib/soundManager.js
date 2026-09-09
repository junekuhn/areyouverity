/**
 * Sound Manager for "Are You Verity?"
 * Generates subtle procedural sounds using Web Audio API
 */

class SoundManager {
  constructor() {
    this.enabled = false;
    this.audioContext = null;
    this.masterGain = null;
    this.volume = 0.3;

    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('verity_sounds_enabled');
      this.enabled = savedState === 'true';
    }
  }

  init() {
    if (typeof window === 'undefined' || this.audioContext) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.audioContext.destination);
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('verity_sounds_enabled', this.enabled);
    }
    if (this.enabled) {
      this.init();
    }
    return this.enabled;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  playTone(frequency, duration = 0.1, type = 'sine') {
    if (!this.enabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  playChord(frequencies, duration = 0.2) {
    frequencies.forEach(freq => this.playTone(freq, duration));
  }

  // Event-specific sounds
  playMint() {
    // Ascending arpeggio - creation
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, index) => {
      setTimeout(() => this.playTone(freq, 0.15), index * 50);
    });
  }

  playChallenge() {
    // Dramatic low tone - confrontation
    this.playTone(130.81, 0.3, 'sawtooth'); // C3
    setTimeout(() => this.playTone(164.81, 0.3, 'sawtooth'), 150); // E3
  }

  playVictory() {
    // Triumphant chord - success
    this.playChord([523.25, 659.25, 783.99], 0.4); // C5, E5, G5
  }

  playDefeat() {
    // Descending tones - failure
    setTimeout(() => this.playTone(392.00, 0.2), 0); // G4
    setTimeout(() => this.playTone(329.63, 0.2), 100); // E4
    setTimeout(() => this.playTone(261.63, 0.3), 200); // C4
  }

  playContradiction() {
    // Dissonant cluster - chaos
    this.playChord([300, 310, 320, 330], 0.5);
  }

  playRecognition() {
    // Gentle ascending tone - acknowledgment
    this.playTone(440.00, 0.15); // A4
    setTimeout(() => this.playTone(554.37, 0.15), 80); // C#5
  }

  playWitness() {
    // Single clear tone - observation
    this.playTone(659.25, 0.2); // E5
  }

  playHover() {
    // Subtle click - interaction
    this.playTone(880.00, 0.05, 'square');
  }

  playClick() {
    // Sharp click - button press
    this.playTone(1046.50, 0.03, 'square');
  }

  playError() {
    // Low buzz - error
    this.playTone(110.00, 0.2, 'sawtooth');
  }

  playTransition() {
    // Sweep - page transition
    if (!this.enabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.frequency.setValueAtTime(200, now);
    oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.3);

    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(now);
    oscillator.stop(now + 0.3);
  }
}

// Singleton instance
const soundManager = new SoundManager();

export default soundManager;
