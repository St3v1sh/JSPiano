/**
 * AUTOPLAY ENGINE - Lookahead Implementation
 * decoupled from DOM.
 */
export class AutoPlayer {
  /**
   * @param {Object} audioEngine - AudioEngine instance
   * @param {Object} logicEngine - MusicLogic instance
   * @param {Function} callbacks - { onVisualEvent, onStop }
   */
  constructor(audioEngine, logicEngine, callbacks = {}) {
    this.audio = audioEngine;
    this.logic = logicEngine;
    this.callbacks = callbacks;
    this.isPlaying = false;

    // Data
    this.songData = null;
    this.rawLines = [];
    this.baseBPM = 150;
    this.tempoScale = 1.0;

    // Scheduling State
    this.nextNoteTime = 0.0;
    this.scheduleAheadTime = 0.1;
    this.lookahead = 25.0;
    this.timerID = null;

    // Playback Position
    this.currentLineIdx = 0;
    this.charIdx = 0;
    this.schedulingFinished = false;

    // Visual Synchronization
    this.visualQueue = [];
    this.animationFrameId = null;
  }

  load(songData) {
    this.stop();
    this.songData = songData;
    const bpmRaw = songData[2] ? songData[2][0] : 200;
    this.baseBPM = parseInt(bpmRaw) || 200;
    this.rawLines = songData[1];
    this.reset();
  }

  reset() {
    this.currentLineIdx = 0;
    this.charIdx = 0;
    this.visualQueue = [];
    this.schedulingFinished = false;
  }

  setTempo(percent) {
    this.tempoScale = percent / 100;
  }

  togglePlay() {
    this.isPlaying ? this.pause() : this.play();
    return this.isPlaying;
  }

  play() {
    if (!this.songData) return;
    this.audio.init();

    this.isPlaying = true;
    this.nextNoteTime = this.audio.getCurrentTime() + 0.05;

    this.scheduler();
    this.draw();
  }

  pause() {
    this.isPlaying = false;
    window.clearTimeout(this.timerID);
    window.cancelAnimationFrame(this.animationFrameId);
  }

  stop() {
    this.pause();
    this.reset();
    if (this.callbacks.onStop) this.callbacks.onStop();
  }

  seek(lineIndex) {
    if (!this.songData || lineIndex < 0 || lineIndex >= this.rawLines.length)
      return;

    const wasPlaying = this.isPlaying;
    if (wasPlaying) this.pause();

    this.currentLineIdx = lineIndex;
    this.charIdx = 0;
    this.visualQueue = [];
    this.schedulingFinished = false;

    // Immediate visual update
    this.queueVisual({
      time: 0, // 0 ensures it runs immediately in draw loop
      lineIdx: this.currentLineIdx,
    });
    this.draw(); // Force single draw

    if (wasPlaying) this.play();
  }

  // --- Scheduler ---
  scheduler() {
    while (
      this.isPlaying &&
      !this.schedulingFinished &&
      this.nextNoteTime < this.audio.getCurrentTime() + this.scheduleAheadTime
    ) {
      this.scheduleNextToken();
    }

    if (this.isPlaying) {
      this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
    }
  }

  scheduleNextToken() {
    if (this.schedulingFinished) return;

    if (this.currentLineIdx >= this.rawLines.length) {
      this.schedulingFinished = true;
      this.queueVisual({ time: this.nextNoteTime + 1, type: "stop_command" });
      return;
    }

    const line = this.rawLines[this.currentLineIdx];
    const trimmed = line.trim();

    // Skip empty lines or comments
    if (!trimmed || trimmed === "~" || trimmed.startsWith("-")) {
      this.queueVisual({
        time: this.nextNoteTime,
        lineIdx: this.currentLineIdx,
        isSkip: true,
      });
      this.currentLineIdx++;
      this.charIdx = 0;
      return;
    }

    if (this.charIdx >= line.length) {
      this.currentLineIdx++;
      this.charIdx = 0;
      return;
    }

    const token = this.getNextToken(line, this.charIdx);
    this.charIdx = token.nextIndex;

    const secondsPerBeat = 60 / this.baseBPM / this.tempoScale;

    if (!token.isRest) {
      this.scheduleNote(
        token.text,
        this.nextNoteTime,
        secondsPerBeat,
        token.isGrace,
      );
    }

    this.queueVisual({
      time: this.nextNoteTime,
      lineIdx: this.currentLineIdx,
      text: token.text,
      isRest: token.isRest,
    });

    this.nextNoteTime += secondsPerBeat;
  }

  scheduleNote(text, startTime, durationSec, isGrace) {
    if (!text || text === ".") return;

    const notes = [];
    let i = 0;
    while (i < text.length) {
      if (text[i] === "[") {
        const end = text.indexOf("]", i);
        if (end > -1) {
          notes.push(text.substring(i + 1, end));
          i = end + 1;
          continue;
        }
      }
      notes.push(text[i]);
      i++;
    }

    if (isGrace) {
      const stepTime = durationSec / (notes.length || 1);
      notes.forEach((char, idx) => {
        this.fireSound(char, startTime + idx * stepTime);
      });
    } else {
      notes.forEach((char) => {
        this.fireSound(char, startTime);
      });
    }
  }

  fireSound(charString, time) {
    for (let char of charString) {
      let key = char;
      let shift = false;

      if (/[A-Z]/.test(char)) {
        key = char.toLowerCase();
        shift = true;
      }
      const special = Object.entries(this.logic.shiftMap).find(
        ([sym]) => sym === char,
      );
      if (special) {
        key = special[1];
        shift = true;
      }

      const midi = this.logic.getMidi(key, shift);
      if (midi !== null) {
        this.audio.play(midi, time);
        this.queueVisual({ time, midi });
      }
    }
  }

  // --- Visuals ---
  draw() {
    const currentTime = this.audio.getCurrentTime();

    while (
      this.visualQueue.length &&
      (this.visualQueue[0].time <= currentTime || !this.isPlaying)
    ) {
      const event = this.visualQueue.shift();

      if (event.type === "stop_command") {
        this.stop();
        return;
      }

      // Delegate visual update to Main/UI
      if (this.callbacks.onVisualEvent) {
        this.callbacks.onVisualEvent(event);
      }

      // If we are just seeking (not playing), break after one event processing
      if (!this.isPlaying) break;
    }

    if (this.isPlaying) {
      this.animationFrameId = window.requestAnimationFrame(() => this.draw());
    }
  }

  queueVisual(data) {
    this.visualQueue.push(data);
  }

  getNextToken(line, startIndex) {
    const char = line[startIndex];
    if (char === "[") {
      const end = line.indexOf("]", startIndex);
      if (end === -1) return { text: "", nextIndex: startIndex + 1, ms: 0 };
      return { text: line.substring(startIndex + 1, end), nextIndex: end + 1 };
    }
    if (char === "{") {
      const end = line.indexOf("}", startIndex);
      if (end === -1) return { text: "", nextIndex: startIndex + 1, ms: 0 };
      return {
        text: line.substring(startIndex + 1, end),
        nextIndex: end + 1,
        isGrace: true,
      };
    }
    if (char === ".")
      return { text: ".", nextIndex: startIndex + 1, isRest: true };
    if (char === " ") return this.getNextToken(line, startIndex + 1);
    return { text: char, nextIndex: startIndex + 1 };
  }
}
