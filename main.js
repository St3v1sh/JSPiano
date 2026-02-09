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
audio.setVolume(0.8);

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
const volumeSliders = [
  document.getElementById("volumeSlider"),
  document.getElementById("sideVolumeSlider"),
];
const volumeLabels = [
  document.getElementById("volumeValue"),
  document.getElementById("sideVolumeValue"),
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
const btnSettings = document.getElementById("btnSettings");
const settingsDropdown = document.getElementById("settingsDropdown");
const sidePanel = document.getElementById("sidePanel");
const sideBindingsTrigger = document.getElementById("sideBindingsTrigger");

// --- Modal Logic ---
const dashboardBindings = document.getElementById("dashboardBindings");
const bindingsModal = document.getElementById("bindingsModal");
const btnCloseBindings = document.getElementById("btnCloseBindings");

dashboardBindings.onclick = () => {
  bindingsModal.classList.add("open");
};

sideBindingsTrigger.onclick = () => {
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

// --- Settings Dropdown Logic ---
btnSettings.onclick = (e) => {
  e.stopPropagation(); // Prevent immediate close
  settingsDropdown.classList.toggle("active");
};

// Close settings when clicking outside
window.addEventListener("click", (e) => {
  if (
    !settingsDropdown.contains(e.target) &&
    e.target !== btnSettings &&
    !btnSettings.contains(e.target)
  ) {
    settingsDropdown.classList.remove("active");
  }
});

// --- Volume Logic ---
volumeSliders.forEach((slider) => {
  slider.oninput = (e) => {
    const val = e.target.value;
    // Sync UI
    volumeSliders.forEach((s) => (s.value = val));
    volumeLabels.forEach((l) => (l.innerText = val + "%"));
    // Update Engine
    audio.setVolume(val / 100);
  };
});

volumeLabels.forEach((label) => {
  label.onclick = () => {
    // Reset to 80% on click
    const resetVal = 80;
    volumeSliders.forEach((s) => (s.value = resetVal));
    volumeLabels.forEach((l) => (l.innerText = resetVal + "%"));
    audio.setVolume(resetVal / 100);
  };
});

// --- Re-binder Logic ---
const bindInputs = Array.from(document.querySelectorAll(".bind-input"));
const miniKeys = Array.from(document.querySelectorAll(".mini-key.dynamic"));

const defaultSpecialBindKeyMap = {
  "[": { n: "[", s: "{" },
  "]": { n: "]", s: "}" },
  ";": { n: ";", s: ":" },
  "'": { n: "'", s: '"' },
  ",": { n: ",", s: "<" },
  ".": { n: ".", s: ">" },
  "/": { n: "/", s: "?" },
};

function updateLogicBindings() {
  const newBindings = {};
  bindInputs.forEach((input) => {
    const key = input.dataset.key;
    const type = input.dataset.type; // 'norm' or 'shift'
    const val = input.value;

    if (!newBindings[key]) newBindings[key] = { norm: "", shift: "" };
    newBindings[key][type] = val;
  });
  logic.setBindings(newBindings);
}

function updateSideBindingsDisplay(bindings) {
  miniKeys.forEach((el) => {
    const key = el.dataset.key;
    const normSpan = el.querySelector(".lbl-norm");
    const shiftSpan = el.querySelector(".lbl-shift");

    const def = defaultSpecialBindKeyMap[key];
    const bind = bindings[key] || {};

    // Norm Logic
    const normVal = bind.norm || def.n;
    normSpan.innerText = normVal;
    // If it's bound (exists and not empty), use accent color. Otherwise muted.
    normSpan.className =
      "lbl-norm " + (bind.norm ? "color-active" : "color-muted");

    // Shift Logic
    const shiftVal = bind.shift || def.s;
    shiftSpan.innerText = shiftVal;
    shiftSpan.className =
      "lbl-shift " + (bind.shift ? "color-active" : "color-muted");
  });
}

function syncBindingUI(bindings) {
  bindInputs.forEach((input) => {
    const key = input.dataset.key;
    const type = input.dataset.type;
    input.value = (bindings && bindings[key] && bindings[key][type]) || "";
  });

  updateSideBindingsDisplay(bindings || {});
  updateLogicBindings();
}

bindInputs.forEach((input, index) => {
  const numInputs = bindInputs.length;
  const lastInput = bindInputs[(index + numInputs - 1) % numInputs];
  const nextInput = bindInputs[(index + 1) % numInputs];
  const functionalKeyMaps = {
    Tab: (shift) => {
      if (shift) lastInput.focus();
      else nextInput.focus();
    },
    Backspace: () => {
      input.value = "";
      updateLogicBindings();
    },
    Delete: () => {
      input.value = "";
      updateLogicBindings();
    },
    ArrowLeft: () => lastInput.focus(),
    ArrowRight: () => nextInput.focus(),
  };

  input.addEventListener("keydown", (e) => {
    // Allow functional keys (Backspace to clear, Tab to navigate, etc.)
    e.preventDefault();
    if (functionalKeyMaps[e.key]) {
      functionalKeyMaps[e.key](e.shiftKey);
      return;
    }

    // Intercept character typing
    const char = e.key;

    // Test if valid piano input
    if (logic.isValidPianoChar(char)) {
      input.value = char;
      updateLogicBindings();

      // Automatically focus the next input
      nextInput.focus();
      nextInput.select();
    }
  });

  input.addEventListener("focus", () => input.select());
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

// --- Load Initial Song State ---
syncBindingUI({});

// 2. Consolidated Synchronized Song Selection
songSelects.forEach((sel) => {
  sel.onchange = (e) => {
    const idx = e.target.value;
    const song = musicLibrary[idx];

    // Sync all song dropdowns (Main and Side Panel)
    songSelects.forEach((s) => (s.value = idx));

    // Load music into engines
    player.load(song);
    sheetUI.load(song);

    // Load the bindings from the song object
    syncBindingUI(song.bindings);

    // Load scale if song defines one
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
    const icon = isPlaying ? ICON_PAUSE : ICON_PLAY;
    btn.innerHTML = icon;
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

  // Check if we are typing in the modal inputs
  if (e.target.classList.contains("bind-input")) return;

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
