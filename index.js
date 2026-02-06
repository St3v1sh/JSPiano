/**
 * AUDIO ENGINE - Sample Based with Accurate Scheduling
 */
class PianoAudio {
  constructor() {
    this.ctx = null;
    this.samples = new Map();
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  getFileName(midi) {
    const names = [
      "c",
      "c~",
      "d",
      "d~",
      "e",
      "f",
      "f~",
      "g",
      "g~",
      "a",
      "a~",
      "b",
    ];
    const note = names[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `./notes/${note}${octave}.mp3`;
  }

  async preload(midi) {
    this.init();
    if (this.samples.has(midi)) return;

    const url = this.getFileName(midi);
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.samples.set(midi, audioBuffer);
    } catch (e) {
      console.warn(`Missing note: ${midi}`);
    }
  }

  play(midi, time = 0) {
    this.init();
    if (this.ctx.state === "suspended") this.ctx.resume();

    const buffer = this.samples.get(midi);
    if (!buffer) {
      this.preload(midi);
      return;
    }

    // If time is 0 or not provided, play immediately (for keyboard clicks)
    const playTime = time || this.ctx.currentTime;

    const source = this.ctx.createBufferSource();
    const gainNode = this.ctx.createGain();
    source.buffer = buffer;

    // Envelope
    gainNode.gain.setValueAtTime(0, playTime);
    gainNode.gain.linearRampToValueAtTime(1, playTime + 0.005);
    gainNode.gain.setValueAtTime(1, playTime + buffer.duration - 0.1);
    gainNode.gain.linearRampToValueAtTime(0, playTime + buffer.duration);

    source.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    source.start(playTime);
  }

  getCurrentTime() {
    return this.ctx ? this.ctx.currentTime : 0;
  }
}

/**
 * LOGIC ENGINE
 */
class PianoLogic {
  constructor() {
    this.keyMap = "1234567890qwertyuiopasdfghjklzxcvbnm".split("");
    this.shiftMap = {
      "!": "1",
      "@": "2",
      "#": "3",
      $: "4",
      "%": "5",
      "^": "6",
      "&": "7",
      "*": "8",
      "(": "9",
      ")": "0",
    };
    this.whiteNames = ["C", "D", "E", "F", "G", "A", "B"];
    this.whiteOffsets = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    this.scales = {
      "C Major": { notes: [], sharps: true },
      "C# Major": { notes: ["C", "D", "E", "F", "G", "A", "B"], sharps: true },
      "D Major": { notes: ["F", "C"], sharps: true },
      "D♭ Major": { notes: ["D", "E", "G", "A", "B"], sharps: false },
      "E Major": { notes: ["F", "G", "C", "D"], sharps: true },
      "E♭ Major": { notes: ["E", "A", "B"], sharps: false },
      "F Major": { notes: ["B"], sharps: false },
      "F# Major": { notes: ["F", "G", "A", "C", "D", "E"], sharps: true },
      "G Major": { notes: ["F"], sharps: true },
      "G♭ Major": { notes: ["G", "A", "B", "C", "D", "E"], sharps: false },
      "A Major": { notes: ["C", "F", "G"], sharps: true },
      "A♭ Major": { notes: ["A", "B", "D", "E"], sharps: false },
      "B Major": { notes: ["C", "D", "F", "G", "A"], sharps: true },
      "B♭ Major": { notes: ["B", "E"], sharps: false },
    };
    this.currentScale = "C Major";
  }

  getMidi(input, isShift) {
    const char = this.shiftMap[input] || input.toLowerCase();
    const idx = this.keyMap.indexOf(char);
    if (idx === -1) return null;

    const name = this.whiteNames[idx % 7];
    const midi = (Math.floor(idx / 7) + 1) * 12 + this.whiteOffsets[name];

    const scale = this.scales[this.currentScale];
    if (scale.notes.includes(name)) {
      return isShift ? midi : scale.sharps ? midi + 1 : midi - 1;
    }
    return isShift ? midi + 1 : midi;
  }

  midiToName(m) {
    return ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][
      m % 12
    ];
  }
}

/**
 * AUTOPLAY ENGINE - Lookahead Implementation
 */
class AutoPlayer {
  constructor(audioEngine, logicEngine) {
    this.audio = audioEngine;
    this.logic = logicEngine;
    this.isPlaying = false;

    // Data
    this.songData = null;
    this.rawLines = [];
    this.baseBPM = 150;
    this.tempoScale = 1.0;

    // Scheduling State
    this.nextNoteTime = 0.0;
    this.scheduleAheadTime = 0.1; // How far ahead to schedule audio (seconds)
    this.lookahead = 25.0; // How frequently to call scheduler (ms)
    this.timerID = null;

    // Playback Position
    this.currentLineIdx = 0;
    this.charIdx = 0;

    // Visual Synchronization
    this.visualQueue = []; // Array of { time: number, lineIdx: number, notes: [] }
    this.animationFrameId = null;

    // UI references
    this.btnPlay = document.getElementById("btnPlay");
    this.btnStop = document.getElementById("btnStop");
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
    this.updateUI();
  }

  setTempo(percent) {
    this.tempoScale = percent / 100;
  }

  togglePlay() {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  play() {
    if (!this.songData) return;
    this.audio.init();

    this.isPlaying = true;

    // Important: When resuming, align nextNoteTime to current context time + latency
    this.nextNoteTime = this.audio.getCurrentTime() + 0.05;

    this.updateUI();
    this.scheduler();
    this.draw();
  }

  pause() {
    this.isPlaying = false;
    window.clearTimeout(this.timerID);
    window.cancelAnimationFrame(this.animationFrameId);
    this.updateUI();
  }

  stop() {
    this.pause();
    this.reset();
    this.clearHighlight();
  }

  seek(lineIndex) {
    if (!this.songData || lineIndex < 0 || lineIndex >= this.rawLines.length)
      return;

    // Stop current scheduling
    const wasPlaying = this.isPlaying;
    if (wasPlaying) this.pause();

    // Reset state
    this.currentLineIdx = lineIndex;
    this.charIdx = 0;
    this.visualQueue = [];

    // Visual update immediate
    this.highlightLine(this.currentLineIdx);
    ensurePageVisible(this.currentLineIdx);
    this.updateUI();

    // Resume if needed
    if (wasPlaying) {
      this.play();
    }
  }

  updateUI() {
    this.btnPlay.innerText = this.isPlaying ? "II Pause" : "▶ Play";
    this.btnStop.disabled = !this.isPlaying && this.currentLineIdx === 0;
  }

  // --- Core Scheduler Loop (Audio) ---
  scheduler() {
    // While there are notes that will need to play before the next interval
    while (
      this.isPlaying &&
      this.nextNoteTime < this.audio.getCurrentTime() + this.scheduleAheadTime
    ) {
      this.scheduleNextToken();
    }

    if (this.isPlaying) {
      this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
    }
  }

  scheduleNextToken() {
    // 1. Validate Boundaries
    if (this.currentLineIdx >= this.rawLines.length) {
      this.pause(); // Done
      return;
    }

    const line = this.rawLines[this.currentLineIdx];
    const trimmed = line.trim();

    // 2. Handle Line Breaks / Comments (Instant skip)
    // We use a small loop here to advance past multiple empty/comment lines instantly
    // without advancing time.
    if (!trimmed || trimmed === "~" || trimmed.startsWith("-")) {
      // Queue visual update even for skipped lines to ensure pagination happens
      this.queueVisual({
        time: this.nextNoteTime,
        lineIdx: this.currentLineIdx,
        isSkip: true,
      });
      this.currentLineIdx++;
      this.charIdx = 0;
      return;
    }

    // 3. Check End of Line
    if (this.charIdx >= line.length) {
      this.currentLineIdx++;
      this.charIdx = 0;
      return;
    }

    // 4. Parse Token
    const token = this.getNextToken(line, this.charIdx);
    this.charIdx = token.nextIndex;

    // 5. Calculate Duration
    const secondsPerBeat = 60 / this.baseBPM / this.tempoScale; // 60 / BPM = seconds per beat

    // 6. Schedule Audio & Visuals
    if (!token.isRest) {
      this.scheduleNote(
        token.text,
        this.nextNoteTime,
        secondsPerBeat,
        token.isGrace,
      );
    }

    // Queue visual highlight for this line at this time
    this.queueVisual({
      time: this.nextNoteTime,
      lineIdx: this.currentLineIdx,
      text: token.text,
      isRest: token.isRest,
    });

    // 7. Advance Time
    // The delay is applied AFTER the note starts
    this.nextNoteTime += secondsPerBeat;
  }

  scheduleNote(text, startTime, durationSec, isGrace) {
    if (!text || text === ".") return;

    const notes = [];
    let i = 0;

    // Parse inner text (simple parser)
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
      // Serial Playback (Arpeggio style) within the single beat duration
      const stepTime = durationSec / (notes.length || 1);
      notes.forEach((char, idx) => {
        this.fireSound(char, startTime + idx * stepTime);
      });
    } else {
      // Parallel Playback (Chord)
      notes.forEach((char) => {
        this.fireSound(char, startTime);
      });
    }
  }

  fireSound(charString, time) {
    // Handle chords inside brackets e.g. [ceg] vs single 'c'
    for (let char of charString) {
      let key = char;
      let shift = false;

      if (/[A-Z]/.test(char)) {
        key = char.toLowerCase();
        shift = true;
      }

      const special = Object.entries(this.logic.shiftMap).find(
        ([sym, mapKey]) => sym === char,
      );
      if (special) {
        key = special[1];
        shift = true;
      }

      const midi = this.logic.getMidi(key, shift);
      if (midi !== null) {
        this.audio.play(midi, time);

        // Add to visual queue specifically for key lighting
        // We add a tiny buffer so visual triggers exactly when sound plays
        this.queueKeyVisual(time, midi);
      }
    }
  }

  // --- Visual Synchronization Loop ---
  // Uses requestAnimationFrame to update DOM exactly when audio time matches
  draw() {
    const currentTime = this.audio.getCurrentTime();

    while (this.visualQueue.length && this.visualQueue[0].time <= currentTime) {
      const event = this.visualQueue.shift();

      // 1. Highlight Sheet Line
      if (event.lineIdx !== undefined) {
        this.highlightLine(event.lineIdx);
        ensurePageVisible(event.lineIdx);
      }

      // 2. Flash Keys
      if (event.midi) {
        this.flashKey(event.midi);
      }
    }

    if (this.isPlaying) {
      this.animationFrameId = window.requestAnimationFrame(() => this.draw());
    }
  }

  queueVisual(data) {
    // Keep queue sorted by time (usually push is fine, but safety checks help)
    this.visualQueue.push(data);
  }

  queueKeyVisual(time, midi) {
    this.visualQueue.push({ time: time, midi: midi });
  }

  // --- Helpers ---

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

    if (char === ".") {
      return { text: ".", nextIndex: startIndex + 1, isRest: true };
    }

    if (char === " ") {
      return this.getNextToken(line, startIndex + 1);
    }

    return { text: char, nextIndex: startIndex + 1 };
  }

  highlightLine(globalIndex) {
    const currentActive = document.querySelector(".active-line");
    if (currentActive && currentActive.id === `line-${globalIndex}`) return;

    this.clearHighlight();
    const el = document.getElementById(`line-${globalIndex}`);
    if (el) {
      el.classList.add("active-line");
    }
  }

  clearHighlight() {
    const active = document.querySelectorAll(".active-line");
    active.forEach((el) => el.classList.remove("active-line"));
  }

  flashKey(midi) {
    const el = midiToEl.get(midi);
    if (el) {
      el.classList.remove("active");
      void el.offsetWidth; // Trigger reflow
      el.classList.add("active");
      setTimeout(() => el.classList.remove("active"), 150);
    }
  }
}

// --- Initialization ---

const audio = new PianoAudio();
const logic = new PianoLogic();
const player = new AutoPlayer(audio, logic);

const pianoDiv = document.getElementById("piano");
const midiToEl = new Map();

// --- Build Piano UI ---
function build() {
  const pattern = [true, true, false, true, true, true, false]; // Pattern of black keys for C D E F G A B

  const whiteKeyCount = 36;
  const whiteKeyWidth = 100 / whiteKeyCount;
  const blackKeyWidth = whiteKeyWidth * 0.65;

  for (let i = 0; i < whiteKeyCount; i++) {
    const name = logic.whiteNames[i % 7];
    const midi = (Math.floor(i / 7) + 1) * 12 + logic.whiteOffsets[name];

    // White Key
    const wk = document.createElement("div");
    wk.className = "key white-key";
    wk.style.left = `${i * whiteKeyWidth}%`;
    pianoDiv.appendChild(wk);
    midiToEl.set(midi, wk);
    audio.preload(midi);

    // Black Key Logic
    if (pattern[i % 7] && i < 35) {
      const bk = document.createElement("div");
      bk.className = "key black-key";
      const leftPos = (i + 1) * whiteKeyWidth - blackKeyWidth / 2;
      bk.style.left = `${leftPos}%`;
      bk.style.width = `${blackKeyWidth}%`;

      pianoDiv.appendChild(bk);
      midiToEl.set(midi + 1, bk);
      audio.preload(midi + 1);
    }
  }
  updateLabels();
}

function updateLabels() {
  midiToEl.forEach((el) => {
    el.innerHTML = "";
    el.onmousedown = null;
  });

  const registry = new Map();

  logic.keyMap.forEach((char) => {
    const mNorm = logic.getMidi(char, false);
    const mShift = logic.getMidi(char, true);
    const isScale = logic.scales[logic.currentScale].notes.includes(
      logic.whiteNames[logic.keyMap.indexOf(char) % 7],
    );

    let normLabel = char;
    let shiftLabel = char.toUpperCase();

    const specialChar = Object.keys(logic.shiftMap).find(
      (key) => logic.shiftMap[key] === char,
    );
    if (specialChar) shiftLabel = specialChar;

    const reg = (m, h, p, s) => {
      if (!registry.has(m) || registry.get(m).p < p)
        registry.set(m, { n: logic.midiToName(m), h, p, c: char, s });
    };

    reg(mNorm, normLabel, isScale ? 3 : 2, false);
    reg(mShift, shiftLabel, 1, true);
  });

  registry.forEach((d, m) => {
    const el = midiToEl.get(m);
    if (el) {
      el.innerHTML = `<span class="note-name">${d.n}</span><span class="key-hint">${d.h}</span>`;
      el.onmousedown = (e) => {
        if (d.s) e.stopPropagation();
        triggerNote(d.c, d.s);
      };
    }
  });
}

function triggerNote(keyChar, isShift) {
  const m = logic.getMidi(keyChar, isShift);
  if (m !== null) {
    audio.play(m);
    const el = midiToEl.get(m);
    if (el) {
      el.classList.remove("active");
      void el.offsetWidth;
      el.classList.add("active");
      setTimeout(() => el.classList.remove("active"), 150);
    }
  }
}

// --- Event Listeners ---

window.addEventListener("keydown", (e) => {
  if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;

  // Pagination shortcuts
  if (e.key === "-" || e.key === "_") {
    changePage(-1);
    return;
  }
  if (e.key === "=" || e.key === "+") {
    changePage(1);
    return;
  }

  triggerNote(e.key, e.shiftKey);
});

const scaleSel = document.getElementById("scaleSelect");
Object.keys(logic.scales).forEach((s) => {
  const o = document.createElement("option");
  o.value = s;
  o.innerText = s;
  scaleSel.appendChild(o);
});
scaleSel.onchange = (e) => {
  logic.currentScale = e.target.value;
  updateLabels();
};

const toggleNotes = document.getElementById("toggleNotes");
const toggleHints = document.getElementById("toggleHints");
const keysWrapper = document.querySelector(".keys-wrapper");

toggleNotes.onchange = () =>
  keysWrapper.classList.toggle("hide-notes", !toggleNotes.checked);
toggleHints.onchange = () =>
  keysWrapper.classList.toggle("hide-hints", !toggleHints.checked);

// --- Song Picker & Pagination Logic ---

const songSel = document.getElementById("songSelect");
const sheetTitle = document.getElementById("sheetTitle");
const sheetMeta = document.getElementById("sheetMeta");
const sheetLeft = document.getElementById("sheetLeft");
const sheetRight = document.getElementById("sheetRight");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const pageIndicator = document.getElementById("pageIndicator");
const btnPlay = document.getElementById("btnPlay");
const btnStop = document.getElementById("btnStop");
const tempoSlider = document.getElementById("tempoSlider");
const tempoValue = document.getElementById("tempoValue");

// Global Data for Song & Pagination
let lineToPageMap = []; // Index = global line ID, Value = Page Index
let sheetPagesHTML = []; // Stores the rendered HTML for each page
let pageIndex = 0; // Index of the left page (0, 2, 4...)

if (typeof presetSheets !== "undefined") {
  presetSheets.forEach((song, index) => {
    const name = song[4] || song[0];
    const opt = document.createElement("option");
    opt.value = index;
    opt.innerText = name;
    songSel.appendChild(opt);
  });
}

songSel.onchange = (e) => {
  const idx = e.target.value;
  loadSong(presetSheets[idx]);
};

function loadSong(songData) {
  if (!songData) return;

  player.load(songData);

  const [name, sheetLines, bpm, scaleShort, customName] = songData;

  sheetTitle.innerText = customName || name;
  sheetMeta.innerText = `BPM: ${bpm} | Scale: ${scaleShort}`;

  // Auto-set Scale
  let normalizedScale = scaleShort.replace("b", "♭");
  let targetScale = normalizedScale + " Major";
  if (logic.scales[targetScale]) {
    scaleSel.value = targetScale;
    logic.currentScale = targetScale;
    updateLabels();
  }

  // Process Pages for DOM
  sheetPagesHTML = [];
  lineToPageMap = [];

  let currentPageHTML = "";
  let currentPageIndex = 0;

  sheetLines.forEach((line, globalIdx) => {
    if (line.trim() === "~") {
      // End of page
      sheetPagesHTML.push(currentPageHTML);
      currentPageHTML = "";
      currentPageIndex++;
      lineToPageMap[globalIdx] = currentPageIndex;
    } else {
      // Generate clickable lines with ID
      const safeContent =
        line
          .replace(/ /g, "&nbsp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;") || "&nbsp;";
      currentPageHTML += `<div class="sheet-line" id="line-${globalIdx}">${safeContent}</div>`;
      lineToPageMap[globalIdx] = currentPageIndex;
    }
  });

  // Add final page
  if (currentPageHTML) {
    sheetPagesHTML.push(currentPageHTML);
  }

  pageIndex = 0;
  renderPages();
}

function renderPages() {
  if (sheetPagesHTML.length === 0) {
    sheetLeft.innerHTML = "No sheet selected.";
    sheetRight.innerHTML = "";
    pageIndicator.innerText = "--";
    btnPrev.disabled = true;
    btnNext.disabled = true;
    return;
  }

  sheetLeft.innerHTML = sheetPagesHTML[pageIndex] || "";
  sheetRight.innerHTML = sheetPagesHTML[pageIndex + 1] || "";

  // Update Controls
  const displayNumLeft = pageIndex + 1;
  const displayNumRight = pageIndex + 2;
  pageIndicator.innerText = `Pg ${displayNumLeft}-${displayNumRight}`;

  btnPrev.disabled = pageIndex <= 0;
  btnNext.disabled = pageIndex + 2 >= sheetPagesHTML.length;
}

function changePage(direction) {
  const newIndex = pageIndex + direction * 2;
  if (newIndex >= 0 && newIndex < sheetPagesHTML.length) {
    pageIndex = newIndex;
    renderPages();
  }
}

// Ensure proper page is open when Autoplay or Seeking moves lines
function ensurePageVisible(lineIndex) {
  if (lineIndex >= lineToPageMap.length) return;

  const targetPage = lineToPageMap[lineIndex];
  const requiredStartIndex = Math.floor(targetPage / 2) * 2;

  if (requiredStartIndex !== pageIndex) {
    pageIndex = requiredStartIndex;
    renderPages();
  }
}

// --- Click Interaction for Seeking ---
// Event delegation on the parent containers
const handleLineClick = (e) => {
  const lineEl = e.target.closest(".sheet-line");
  if (lineEl) {
    const id = lineEl.id;
    const index = parseInt(id.replace("line-", ""), 10);
    if (!isNaN(index)) {
      player.seek(index);
    }
  }
};

sheetLeft.addEventListener("click", handleLineClick);
sheetRight.addEventListener("click", handleLineClick);

// --- Button Listeners ---
btnPrev.onclick = () => changePage(-1);
btnNext.onclick = () => changePage(1);

btnPlay.onclick = () => player.togglePlay();
btnStop.onclick = () => player.stop();

tempoSlider.oninput = (e) => {
  const val = e.target.value;
  tempoValue.innerText = val + "%";
  player.setTempo(val);
};

// Reset Tempo feature
tempoValue.onclick = () => {
  tempoSlider.value = 100;
  tempoValue.innerText = "100%";
  player.setTempo(100);
};

// --- Start ---
build();
