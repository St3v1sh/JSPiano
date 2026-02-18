export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.samples = new Map();
    this.masterVolume = 0.8;
    this.noteDuration = 2.0;
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.AudioContext)();
  }

  setVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
  }

  setNoteDuration(val) {
    this.noteDuration = Math.max(0.2, parseFloat(val));
  }

  getFileName(midi) {
    const names = [
      "c",
      "c#",
      "d",
      "d#",
      "e",
      "f",
      "f#",
      "g",
      "g#",
      "a",
      "a#",
      "b",
    ];
    const note = names[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `./notes/${encodeURIComponent(note)}${octave}.mp3`;
  }

  async preload(midi) {
    this.init();
    if (this.samples.has(midi)) return;

    const url = this.getFileName(midi);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.samples.set(midi, audioBuffer);
    } catch (e) {
      console.warn(`Missing note: ${midi} (${url})`);
    }
  }

  play(midi, time = 0) {
    // Only 72 notes on the keyboard.
    if (midi > 72) return;

    this.init();
    if (this.ctx.state === "suspended") this.ctx.resume();

    const buffer = this.samples.get(midi);
    if (!buffer) {
      this.preload(midi);
      return;
    }

    const playTime = time || this.ctx.currentTime;
    const source = this.ctx.createBufferSource();
    const gainNode = this.ctx.createGain();
    const vol = this.masterVolume;

    // Calculate playback duration based on slider setting vs sample length
    const duration = Math.min(buffer.duration, this.noteDuration);

    source.buffer = buffer;

    // ADSR Envelope
    gainNode.gain.setValueAtTime(0, playTime);
    gainNode.gain.linearRampToValueAtTime(1 * vol, playTime + 0.005);

    // Release / Cutoff logic
    // Fade out over last 0.1s or from start if duration is tiny
    const fadeOutTime = 0.1;
    const fadeStart = Math.max(
      playTime + 0.005,
      playTime + duration - fadeOutTime,
    );
    const fadeEnd = playTime + duration;

    // Anchor the gain at volume before fading
    gainNode.gain.setValueAtTime(1 * vol, fadeStart);
    gainNode.gain.linearRampToValueAtTime(0, fadeEnd);

    source.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    source.start(playTime);
    source.stop(fadeEnd + 0.1); // Cleanup slightly after fade out
  }

  getCurrentTime() {
    return this.ctx ? this.ctx.currentTime : 0;
  }
}
