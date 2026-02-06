export class PianoKeyboard {
  constructor(containerId, logicEngine, audioRequestCallback, audioProvider) {
    this.container = document.getElementById(containerId);
    this.logic = logicEngine;
    this.triggerNoteCallback = audioRequestCallback;
    this.audioProvider = audioProvider;
    this.midiToEl = new Map();
  }

  build() {
    const pattern = [true, true, false, true, true, true, false];
    const whiteKeyCount = 36;
    const whiteKeyWidth = 100 / whiteKeyCount;
    const blackKeyWidth = whiteKeyWidth * 0.65;

    // Real-world offsets for black keys relative to the divider line
    // (Fraction of a white key width)
    const blackKeyOffsets = {
      0: -0.1, // C# shifted left
      1: 0.1, // D# shifted right
      3: -0.14, // F# shifted left
      4: 0, // G# centered
      5: 0.14, // A# shifted right
    };

    this.container.innerHTML = "";
    this.midiToEl.clear();

    for (let i = 0; i < whiteKeyCount; i++) {
      const name = this.logic.whiteNames[i % 7];
      const midi = (Math.floor(i / 7) + 1) * 12 + this.logic.whiteOffsets[name];

      // White Key
      const wk = document.createElement("div");
      wk.className = "key white-key";
      // Use precise percentage to prevent drift
      wk.style.left = i * whiteKeyWidth + "%";
      this.container.appendChild(wk);
      this.midiToEl.set(midi, wk);

      if (this.audioProvider) this.audioProvider.preload(midi);

      // Black Key
      if (pattern[i % 7] && i < 35) {
        const bk = document.createElement("div");
        bk.className = "key black-key";

        // Calculate offset based on position in octave
        const shift = (blackKeyOffsets[i % 7] || 0) * whiteKeyWidth;
        const leftPos = (i + 1) * whiteKeyWidth - blackKeyWidth / 2 + shift;

        bk.style.left = leftPos + "%";
        bk.style.width = blackKeyWidth + "%";
        this.container.appendChild(bk);
        this.midiToEl.set(midi + 1, bk);

        if (this.audioProvider) this.audioProvider.preload(midi + 1);
      }
    }
    this.updateLabels();
  }

  updateLabels() {
    this.midiToEl.forEach((el) => {
      el.innerHTML = "";
      el.onmousedown = null;
    });

    const registry = new Map();

    this.logic.keyMap.forEach((char) => {
      const mNorm = this.logic.getMidi(char, false);
      const mShift = this.logic.getMidi(char, true);
      const isScale = this.logic.scales[this.logic.currentScale].notes.includes(
        this.logic.whiteNames[this.logic.keyMap.indexOf(char) % 7],
      );

      let normLabel = char;
      let shiftLabel = char.toUpperCase();

      const specialChar = Object.keys(this.logic.shiftMap).find(
        (key) => this.logic.shiftMap[key] === char,
      );
      if (specialChar) shiftLabel = specialChar;

      const reg = (m, h, p, s) => {
        if (!registry.has(m) || registry.get(m).p < p)
          registry.set(m, { n: this.logic.midiToName(m), h, p, c: char, s });
      };

      if (mNorm) reg(mNorm, normLabel, isScale ? 3 : 2, false);
      if (mShift) reg(mShift, shiftLabel, 1, true);
    });

    registry.forEach((d, m) => {
      const el = this.midiToEl.get(m);
      if (el) {
        el.innerHTML = `<span class="note-name">${d.n}</span><span class="key-hint">${d.h}</span>`;
        el.onmousedown = (e) => {
          if (d.s) e.stopPropagation();
          this.triggerNoteCallback(d.c, d.s);
        };
      }
    });
  }

  flashKey(midi) {
    const el = this.midiToEl.get(midi);
    if (el) {
      el.classList.remove("active");
      void el.offsetWidth;
      el.classList.add("active");
      setTimeout(() => el.classList.remove("active"), 150);
    }
  }

  toggleLabels(notesOn, hintsOn) {
    this.container.classList.toggle("hide-notes", !notesOn);
    this.container.classList.toggle("hide-hints", !hintsOn);
  }
}
