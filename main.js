import { musicLibrary } from "./data/musicLibrary.js";
import { AudioEngine } from "./core/AudioEngine.js";
import { MusicLogic } from "./core/MusicLogic.js";
import { AutoPlayer } from "./core/AutoPlayer.js";
import { PianoKeyboard } from "./ui/PianoKeyboard.js";
import { SheetDisplay } from "./ui/SheetDisplay.js";

// --- Initialize Core ---
const ICON_PLAY = `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
const ICON_PAUSE = `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

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
    if (event.lineIdx !== undefined) sheetUI.highlightLine(event.lineIdx);
    if (event.midi) pianoUI.flashKey(event.midi);
  },
  onStop: () => {
    sheetUI.clearHighlight();
    updatePlayButtons(false);
  },
});

// --- Bootstrapping ---
pianoUI.build();

// --- DOM Bindings ---
const songSelects = [
  document.getElementById("songSelect"),
  document.getElementById("sideSongSelect"),
];
const scaleSelects = [
  document.getElementById("scaleSelect"),
  document.getElementById("sideScaleSelect"),
];
const playBtns = [
  document.getElementById("btnPlay"),
  document.getElementById("sideBtnPlay"),
];
const stopBtns = [
  document.getElementById("btnStop"),
  document.getElementById("sideBtnStop"),
];
const tempoSliders = [
  document.getElementById("tempoSlider"),
  document.getElementById("sideTempoSlider"),
];
const tempoLabels = [
  document.getElementById("tempoValue"),
  document.getElementById("sideTempoValue"),
];
const noteToggles = [
  document.getElementById("toggleNotes"),
  document.getElementById("sideToggleNotes"),
];
const hintToggles = [
  document.getElementById("toggleHints"),
  document.getElementById("sideToggleHints"),
];
const sidePanel = document.getElementById("sidePanel");

// --- Modal Logic ---
const btnBindings = document.getElementById("btnBindings");
const bindingsModal = document.getElementById("bindingsModal");
const btnCloseBindings = document.getElementById("btnCloseBindings");

btnBindings.onclick = () => {
  bindingsModal.classList.add("open");
};

const closeBindings = () => {
  bindingsModal.classList.remove("open");
};

btnCloseBindings.onclick = closeBindings;

// Close when clicking outside the modal window
bindingsModal.onclick = (e) => {
  if (e.target === bindingsModal) closeBindings();
};

// Close on Escape key
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && bindingsModal.classList.contains("open")) {
    closeBindings();
  }
});

// 1. Initial Song/Scale Population
musicLibrary.forEach((song, index) => {
  songSelects.forEach((sel) => {
    const opt = document.createElement("option");
    opt.value = index;
    opt.innerText = song.title;
    sel.appendChild(opt);
  });
});

Object.keys(logic.scales).forEach((s) => {
  scaleSelects.forEach((sel) => {
    const o = document.createElement("option");
    o.value = s;
    o.innerText = s;
    sel.appendChild(o);
  });
});

// Force sync initial state
songSelects[1].value = songSelects[0].value;
scaleSelects[1].value = scaleSelects[0].value;

// 2. Synchronized Song Selection
songSelects.forEach((sel) => {
  sel.onchange = (e) => {
    const idx = e.target.value;
    const song = musicLibrary[idx];
    songSelects.forEach((s) => (s.value = idx));

    player.load(song);
    sheetUI.load(song);

    if (logic.scales[song.scale]) {
      scaleSelects.forEach((ss) => (ss.value = song.scale));
      logic.setScale(song.scale);
      pianoUI.updateLabels();
    }
  };
});

// 3. Synchronized Scale Selection
scaleSelects.forEach((sel) => {
  sel.onchange = (e) => {
    const val = e.target.value;
    scaleSelects.forEach((s) => (s.value = val));
    logic.setScale(val);
    pianoUI.updateLabels();
  };
});

// 4. Playback Controls Sync
function updatePlayButtons(isPlaying) {
  playBtns.forEach((btn) => {
    const isSide = btn.id.includes("side");
    const icon = isPlaying ? ICON_PAUSE : ICON_PLAY;

    if (isSide) {
      // Small side button: icon only
      btn.innerHTML = icon;
    } else {
      // Main dashboard button: icon + text
      const label = isPlaying ? "Pause" : "Play";
      btn.innerHTML = `${icon} <span>${label}</span>`;
    }
  });

  stopBtns.forEach((btn) => {
    btn.disabled = !isPlaying && player.currentLineIdx === 0;
  });
}

playBtns.forEach((btn) => {
  btn.onclick = () => {
    const isPlaying = player.togglePlay();
    updatePlayButtons(isPlaying);
  };
});

stopBtns.forEach((btn) => {
  btn.onclick = () => {
    player.stop();
    updatePlayButtons(false);
  };
});

tempoSliders.forEach((slider) => {
  slider.oninput = (e) => {
    const val = e.target.value;
    tempoSliders.forEach((s) => (s.value = val));
    tempoLabels.forEach((l) => (l.innerText = val + "%"));
    player.setTempo(val);
  };
});

tempoLabels.forEach((label) => {
  label.onclick = () => {
    tempoSliders.forEach((s) => (s.value = 100));
    tempoLabels.forEach((l) => (l.innerText = "100%"));
    player.setTempo(100);
  };
});

// 5. Toggle Sync Logic
const handleToggles = (e) => {
  const newState = e.target.checked;
  const isNoteToggle = e.target.id.toLowerCase().includes("note");

  if (isNoteToggle) {
    noteToggles.forEach((t) => (t.checked = newState));
  } else {
    hintToggles.forEach((t) => (t.checked = newState));
  }

  pianoUI.toggleLabels(noteToggles[0].checked, hintToggles[0].checked);
};

[...noteToggles, ...hintToggles].forEach((t) => (t.onchange = handleToggles));

// 6. Scroll Visibility Logic
const updateSidePanelVisibility = () => {
  const isDashboardHidden = window.scrollY > 60;
  const isWideEnough = window.innerWidth > 1420;

  if (isDashboardHidden && isWideEnough) {
    sidePanel.classList.add("visible");
  } else {
    sidePanel.classList.remove("visible");
  }
};

window.addEventListener("scroll", updateSidePanelVisibility);
window.addEventListener("resize", updateSidePanelVisibility);

// 7. Keyboard Interactions
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

// 8. Focus Management
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
