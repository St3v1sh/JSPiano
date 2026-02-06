import { musicLibrary } from "./data/musicLibrary.js";
import { AudioEngine } from "./core/AudioEngine.js";
import { MusicLogic } from "./core/MusicLogic.js";
import { AutoPlayer } from "./core/AutoPlayer.js";
import { PianoKeyboard } from "./ui/PianoKeyboard.js";
import { SheetDisplay } from "./ui/SheetDisplay.js";

// --- Initialize Core ---
const audio = new AudioEngine();
const logic = new MusicLogic();

// --- Initialize UI ---
const pianoUI = new PianoKeyboard(
  "piano",
  logic,
  (key, shift) => {
    // Callback when a user clicks a key on the UI
    const m = logic.getMidi(key, shift);
    if (m !== null) {
      audio.play(m);
      pianoUI.flashKey(m);
    }
  },
  audio,
);

const sheetUI = new SheetDisplay((lineIndex) => {
  // Callback when user clicks a line in the sheet
  player.seek(lineIndex);
});

// --- Initialize Player ---
const player = new AutoPlayer(audio, logic, {
  onVisualEvent: (event) => {
    if (event.lineIdx !== undefined) {
      sheetUI.highlightLine(event.lineIdx);
    }
    if (event.midi) {
      pianoUI.flashKey(event.midi);
    }
  },
  onStop: () => {
    sheetUI.clearHighlight();
    updatePlayButton(false);
  },
});

// --- Bootstrapping ---
pianoUI.build();

// --- DOM Bindings for Global Controls ---

const songSel = document.getElementById("songSelect");
const scaleSel = document.getElementById("scaleSelect");
const btnPlay = document.getElementById("btnPlay");
const btnStop = document.getElementById("btnStop");
const tempoSlider = document.getElementById("tempoSlider");
const tempoValue = document.getElementById("tempoValue");

// 1. Populate Song Select
musicLibrary.forEach((song, index) => {
  const opt = document.createElement("option");
  opt.value = index;
  opt.innerText = song.title;
  songSel.appendChild(opt);
});

songSel.onchange = (e) => {
  const idx = e.target.value;
  const song = musicLibrary[idx];

  player.load(song);
  sheetUI.load(song);

  // Auto-set Scale
  const targetScale = song.scale;
  if (logic.scales[targetScale]) {
    scaleSel.value = targetScale;
    logic.setScale(targetScale);
    pianoUI.updateLabels();
  }
};

// 2. Populate Scale Select
Object.keys(logic.scales).forEach((s) => {
  const o = document.createElement("option");
  o.value = s;
  o.innerText = s;
  scaleSel.appendChild(o);
});

scaleSel.onchange = (e) => {
  logic.setScale(e.target.value);
  pianoUI.updateLabels();
};

// 3. Playback Controls
function updatePlayButton(isPlaying) {
  btnPlay.innerText = isPlaying ? "II Pause" : "▶ Play";
  // Only enable stop if we are playing or somewhere inside the song
  btnStop.disabled = !isPlaying && player.currentLineIdx === 0;
}

btnPlay.onclick = () => {
  const isPlaying = player.togglePlay();
  updatePlayButton(isPlaying);
};

btnStop.onclick = () => {
  player.stop();
  updatePlayButton(false);
};

tempoSlider.oninput = (e) => {
  const val = e.target.value;
  tempoValue.innerText = val + "%";
  player.setTempo(val);
};

tempoValue.onclick = () => {
  tempoSlider.value = 100;
  tempoValue.innerText = "100%";
  player.setTempo(100);
};

// 4. Keyboard Interactions
window.addEventListener("keydown", (e) => {
  if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;

  // Pagination shortcuts
  if (e.key === "-" || e.key === "_") {
    sheetUI.changePage(-1);
    return;
  }
  if (e.key === "=" || e.key === "+") {
    sheetUI.changePage(1);
    return;
  }

  // Play Note
  const m = logic.getMidi(e.key, e.shiftKey);
  if (m !== null) {
    audio.play(m);
    pianoUI.flashKey(m);
  }
});

// 5. Toggles
const toggleNotes = document.getElementById("toggleNotes");
const toggleHints = document.getElementById("toggleHints");

const handleToggle = () =>
  pianoUI.toggleLabels(toggleNotes.checked, toggleHints.checked);
toggleNotes.onchange = handleToggle;
toggleHints.onchange = handleToggle;

// 6. Focus Management (Prevent Spacebar from scrolling/triggering buttons)
const interactive = document.querySelectorAll(
  "button, select, input, [type='checkbox'], [type='range']",
);
interactive.forEach((el) => {
  el.setAttribute("tabindex", "-1");
  if (el.tagName === "BUTTON" || el.type === "checkbox") {
    el.addEventListener("mousedown", (e) => e.preventDefault());
  } else if (el.tagName === "SELECT" || el.type === "range") {
    el.addEventListener("change", function () {
      this.blur();
    });
  }
  if (el.type === "range") {
    el.addEventListener("mouseup", function () {
      this.blur();
    });
  }
});
