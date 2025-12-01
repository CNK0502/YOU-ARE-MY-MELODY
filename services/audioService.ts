class AudioService {
  private context: AudioContext | null = null;
  private gainNode: GainNode | null = null;

  private init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.context.createGain();
      this.gainNode.connect(this.context.destination);
      this.gainNode.gain.value = 0.3; // Master volume
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  public playTone(frequency: number, type: OscillatorType = 'sine', duration: number = 0.5) {
    this.init();
    if (!this.context || !this.gainNode) return;

    const osc = this.context.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.context.currentTime);
    
    const envelope = this.context.createGain();
    envelope.connect(this.gainNode);
    
    osc.connect(envelope);

    // ADSR-ish envelope
    const now = this.context.currentTime;
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(1, now + 0.05); // Attack
    envelope.gain.exponentialRampToValueAtTime(0.001, now + duration); // Release

    osc.start(now);
    osc.stop(now + duration);
  }

  public playCorrect() {
    this.playTone(880, 'sine', 0.1); // High beep
    setTimeout(() => this.playTone(1100, 'sine', 0.2), 100);
  }

  public playIncorrect() {
    this.playTone(150, 'sawtooth', 0.3); // Low buzz
  }
}

export const audioService = new AudioService();