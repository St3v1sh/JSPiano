import { musicLibrary } from "./data/musicLibrary.js";
import { AudioEngine } from "./core/AudioEngine.js";
import { MusicLogic } from "./core/MusicLogic.js";
import { AutoPlayer } from "./core/AutoPlayer.js";
import { StorageManager } from "./core/StorageManager.js";
import { PianoKeyboard } from "./ui/PianoKeyboard.js";
import { SheetDisplay } from "./ui/SheetDisplay.js";
import { SongEditor, LIMITS } from "./ui/SongEditor.js";

// --- Constants ---
const CONSTANTS = {
  DEFAULT_VOL: 80,
  EDITOR_MODE_LABEL: "EDITOR_MODE",
  ID_PREFIX: "usr_",
  ICONS: {
    PLAY: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`,
    PAUSE: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
  },
};

// --- Initialize Core ---
const audio = new AudioEngine();
audio.setVolume(CONSTANTS.DEFAULT_VOL / 100);

const logic = new MusicLogic();
const storage = new StorageManager();

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
  // Callback when user clicks a line in the sheet (Read Mode)
  player.seek(lineIndex);
});

// --- Initialize Player ---
const player = new AutoPlayer(audio, logic, {
  onVisualEvent: (event) => {
    // If running in editor mode, sync visual page
    if (editorUI.isActive) {
      if (event.lineIdx !== undefined) {
        editorUI.syncPageWithLineIndex(event.lineIdx);
      }
    } else {
      // Normal Read Mode
      if (event.lineIdx !== undefined) sheetUI.highlightLine(event.lineIdx);
    }

    if (event.midi) pianoUI.flashKey(event.midi);
  },
  onStop: () => {
    sheetUI.clearHighlight();
    updatePlayButtons(false);
  },
});

// --- Helper for Bindings ---
function getBindingsFromUI() {
  const newBindings = {};
  bindInputs.forEach((input) => {
    const key = input.dataset.key;
    const type = input.dataset.type; // 'norm' or 'shift'
    const val = input.value;

    if (!newBindings[key]) newBindings[key] = { norm: "", shift: "" };
    newBindings[key][type] = val;
  });
  return newBindings;
}

// --- Initialize Editor ---
const editorUI = new SongEditor(logic, {
  onSave: async (songData) => {
    // Save to DB
    await storage.saveSong(songData);
    // Refresh library in memory
    await refreshSongLibrary();
    // Select the saved song
    updateSongSelects(songData.id);
    player.load(songData);
    sheetUI.load(songData);
    syncBindingUI(songData.bindings);
    exitEditorMode();
  },
  onCancel: () => {
    exitEditorMode();
  },
  onDelete: async (id) => {
    if (confirm("Are you sure you want to delete this song?")) {
      await storage.deleteSong(id);
      await refreshSongLibrary();
      // Reset to first song
      updateSongSelects(musicLibrary[0].id);
      player.load(musicLibrary[0]);
      sheetUI.load(musicLibrary[0]);
      syncBindingUI(musicLibrary[0].bindings);
      exitEditorMode();
    }
  },
  onScaleChange: (newScale) => {
    // Sync global dropdowns and piano when editor changes scale
    scaleSelects.forEach((s) => (s.value = newScale));
    logic.setScale(newScale);
    pianoUI.updateLabels();
  },
  getBindings: () => {
    // Allow editor to grab current bindings for saving
    return getBindingsFromUI();
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
const scrollToggles = [
  document.getElementById("toggleScroll"),
  document.getElementById("sideToggleScroll"),
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

// Editor & Import Bindings
const btnCreateSong = document.getElementById("btnCreateSong");
const btnEditSong = document.getElementById("btnEditSong");
const btnImportSong = document.getElementById("btnImportSong");
const fileInput = document.getElementById("fileInput");

// --- Global Pagination Buttons (Shared) ---
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");

// Centralized Pagination Logic
btnPrev.onclick = () => {
  if (editorUI.isActive) editorUI.changePage(-1);
  else sheetUI.changePage(-1);
};
btnNext.onclick = () => {
  if (editorUI.isActive) editorUI.changePage(1);
  else sheetUI.changePage(1);
};

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
    // Reset to default on click
    volumeSliders.forEach((s) => (s.value = CONSTANTS.DEFAULT_VOL));
    volumeLabels.forEach((l) => (l.innerText = CONSTANTS.DEFAULT_VOL + "%"));
    audio.setVolume(CONSTANTS.DEFAULT_VOL / 100);
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
  const newBindings = getBindingsFromUI();
  logic.setBindings(newBindings);
  // Ensure visual sync happens during typing
  updateSideBindingsDisplay(newBindings);
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

  // Update sidebar visually on input change (e.g. backspace)
  input.addEventListener("input", () => {
    updateLogicBindings();
  });
});

// --- Song Library Management ---
async function refreshSongLibrary() {
  await storage.init();
  const userSongs = await storage.getAllSongs();

  // Reset library to base, then append user songs
  // Dynamically calculate base length to avoid magic number "5"
  const baseLength = musicLibrary.filter((s) => !s.isCustom).length;
  musicLibrary.splice(baseLength);

  musicLibrary.push(...userSongs);

  // Re-populate selects
  songSelects.forEach((sel) => {
    // Preserve old value if possible, or reset
    const oldVal = sel.value;
    sel.innerHTML = '<option value="" disabled>Select Song...</option>';
    musicLibrary.forEach((song, index) => {
      const opt = document.createElement("option");
      opt.value = song.id; // Use ID instead of index
      const displayName = song.title + (song.isCustom ? " *" : "");
      opt.innerText = displayName;
      opt.title = displayName;
      sel.appendChild(opt);
    });
    // Restore if valid
    if (musicLibrary.find((s) => s.id === oldVal)) {
      sel.value = oldVal;
      sel.title = sel.options[sel.selectedIndex].text;
    }
  });
}

// Initial Load
await refreshSongLibrary();

Object.keys(logic.scales).forEach((s) => {
  scaleSelects.forEach((sel) => {
    const o = document.createElement("option");
    o.value = s;
    o.innerText = s;
    sel.appendChild(o);
  });
});

// --- Consolidated Synchronized Song Selection ---
const handleSongSelection = (id) => {
  const song = musicLibrary.find((s) => s.id === id);
  if (!song) return;

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

  // Handle Edit Button Visibility
  btnEditSong.style.display = song.isCustom ? "inline-flex" : "none";
  if (song.isCustom) {
    btnEditSong.onclick = () => enterEditorMode(song);
  }
};

songSelects.forEach((sel) => {
  sel.onchange = (e) => {
    const id = e.target.value;
    updateSongSelects(id);
    handleSongSelection(id);
  };
});

function updateSongSelects(id) {
  songSelects.forEach((s) => {
    s.value = id;
    const selectedOption = s.options[s.selectedIndex];
    if (selectedOption) {
      s.title = selectedOption.text;
    } else {
      s.title = "";
    }
  });
}

// Initialize First Song if available
let previousSongId = null;

if (musicLibrary.length > 0) {
  const initialSong = musicLibrary[0];
  updateSongSelects(initialSong.id);
  handleSongSelection(initialSong.id);
  previousSongId = initialSong.id;
  // Default binding sync
  syncBindingUI(initialSong.bindings || {});
} else {
  syncBindingUI({});
}

// --- Synchronized Scale Selection ---
scaleSelects.forEach((sel) => {
  sel.onchange = (e) => {
    const val = e.target.value;
    scaleSelects.forEach((s) => (s.value = val));
    logic.setScale(val);
    pianoUI.updateLabels();
  };
});

// --- Playback Controls Sync ---
function updatePlayButtons(isPlaying) {
  playBtns.forEach((btn) => {
    const icon = isPlaying ? CONSTANTS.ICONS.PAUSE : CONSTANTS.ICONS.PLAY;
    btn.innerHTML = icon;
  });

  stopBtns.forEach((btn) => {
    // If in editor, stop is always enabled if playing
    if (editorUI.isActive) {
      btn.disabled = !isPlaying;
    } else {
      btn.disabled = !isPlaying && player.currentLineIdx === 0;
    }
  });
}

playBtns.forEach((btn) => {
  btn.onclick = () => {
    if (editorUI.isActive) {
      // Editor Play Logic
      if (player.isPlaying) {
        player.pause();
        updatePlayButtons(false);
      } else {
        const tempSong = editorUI.getSongDataForPlayback();
        const startLine = editorUI.getCursorLineIndex();
        player.load(tempSong);
        player.seek(startLine);
        player.play();
        updatePlayButtons(true);
      }
    } else {
      // Normal Play Logic
      const isPlaying = player.togglePlay();
      updatePlayButtons(isPlaying);
    }
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

// --- Toggle Sync Logic ---
const handleToggles = (e) => {
  const newState = e.target.checked;
  const targetId = e.target.id.toLowerCase();

  if (targetId.includes("scroll")) {
    scrollToggles.forEach((t) => (t.checked = newState));
    sheetUI.toggleAutoScroll(newState);
  } else if (targetId.includes("note")) {
    noteToggles.forEach((t) => (t.checked = newState));
    pianoUI.toggleLabels(newState, hintToggles[0].checked);
  } else {
    hintToggles.forEach((t) => (t.checked = newState));
    pianoUI.toggleLabels(noteToggles[0].checked, newState);
  }
};

[...scrollToggles, ...noteToggles, ...hintToggles].forEach(
  (t) => (t.onchange = handleToggles),
);

// --- Editor Mode Logic ---
const appContainer = document.getElementById("appContainer");
const sheetReadContent = document.getElementById("sheetReadContent");
const sheetEditorContent = document.getElementById("sheetEditorContent");
const sheetTitle = document.getElementById("sheetTitle");
const sheetMeta = document.getElementById("sheetMeta");

function enterEditorMode(songData) {
  if (editorUI.isActive && !songData) return;
  if (editorUI.isActive && songData && songData.id === editorUI.currentSongId)
    return;

  player.stop();
  updatePlayButtons(false);

  editorUI.isActive = true;
  appContainer.classList.add("editor-mode");
  sheetReadContent.style.display = "none";
  sheetEditorContent.style.display = "flex";

  // Hide edit button while in editor
  btnEditSong.style.display = "none";

  sheetTitle.innerHTML = "EDITOR MODE";
  sheetMeta.innerText = "You are editing a song";

  songSelects.forEach((s) => {
    s.disabled = true;
    let dummy = s.querySelector(
      `option[value="${CONSTANTS.EDITOR_MODE_LABEL}"]`,
    );
    if (!dummy) {
      dummy = document.createElement("option");
      dummy.value = CONSTANTS.EDITOR_MODE_LABEL;
      dummy.innerText = "EDITOR MODE";
      s.appendChild(dummy);
    }
    s.value = CONSTANTS.EDITOR_MODE_LABEL;
  });

  // Reset bindings for new song, or load existing bindings
  if (songData) {
    syncBindingUI(songData.bindings || {});
  } else {
    syncBindingUI({});
  }

  editorUI.load(songData || null);
}

function exitEditorMode() {
  player.stop();
  updatePlayButtons(false);

  editorUI.isActive = false;
  appContainer.classList.remove("editor-mode");
  sheetReadContent.style.display = "flex";
  sheetEditorContent.style.display = "none";

  songSelects.forEach((s) => {
    s.disabled = false;
    let dummy = s.querySelector(
      `option[value="${CONSTANTS.EDITOR_MODE_LABEL}"]`,
    );
    if (dummy) dummy.remove();
  });

  if (
    songSelects[0].value !== CONSTANTS.EDITOR_MODE_LABEL &&
    songSelects[0].value
  ) {
    updateSongSelects(songSelects[0].value);
    handleSongSelection(songSelects[0].value);
  } else {
    updateSongSelects(previousSongId);
    handleSongSelection(previousSongId);
  }
}

btnCreateSong.onclick = () => {
  enterEditorMode();
};

// --- Import Logic ---
btnImportSong.onclick = () => {
  fileInput.click();
};

fileInput.onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const songObj = JSON.parse(text);

    if (!songObj.title || !Array.isArray(songObj.sheet)) {
      alert("Invalid song file format.");
      return;
    }

    const title = (songObj.title || "").toString();
    const artist = (songObj.artist || "").toString();
    const bpm = parseInt(songObj.bpm, 10);
    const totalLength = songObj.sheet.join("\n").length;

    if (title.length > LIMITS.TITLE_MAX || artist.length > LIMITS.ARTIST_MAX) {
      alert("Import failed: Title or Artist exceeds 256 characters.");
      return;
    }
    if (isNaN(bpm) || bpm < LIMITS.BPM_MIN || bpm > LIMITS.BPM_MAX) {
      alert("Import failed: BPM must be between 1 and 50,000.");
      return;
    }
    if (totalLength > LIMITS.SHEET_MAX_CHARS) {
      alert(
        `Import failed: Song sheet exceeds 150,000 characters. Character count: ${totalLength}.`,
      );
      return;
    }

    songObj.isCustom = true;
    // Ensure unique ID with valid prefix
    songObj.id =
      CONSTANTS.ID_PREFIX +
      (songObj.id || Date.now().toString(36)).replace(
        new RegExp("^" + CONSTANTS.ID_PREFIX),
        "",
      );

    await storage.saveSong(songObj);
    await refreshSongLibrary();

    updateSongSelects(songObj.id);
    handleSongSelection(songObj.id);
    previousSongId = songObj.id;
  } catch (err) {
    console.error(err);
    alert("Failed to import song. Check console for details.");
  } finally {
    fileInput.value = "";
  }
};

// --- Scroll Visibility Logic ---
const updateSidePanelVisibility = () => {
  const isDashboardHidden = window.scrollY >= 1;
  const isWideEnough = window.innerWidth >= 1510;

  if (isDashboardHidden && isWideEnough) {
    sidePanel.classList.add("visible");
  } else {
    sidePanel.classList.remove("visible");
  }
};

window.addEventListener("scroll", updateSidePanelVisibility);
window.addEventListener("resize", updateSidePanelVisibility);

// --- Keyboard Interactions ---
window.addEventListener("keydown", (e) => {
  if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;

  const tag = e.target.tagName;
  const isInput =
    tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable;
  if (isInput) return;

  if (e.key === "-" || e.key === "_") {
    if (editorUI.isActive) editorUI.changePage(-1);
    else sheetUI.changePage(-1);
    return;
  }
  if (e.key === "=" || e.key === "+") {
    if (editorUI.isActive) editorUI.changePage(1);
    else sheetUI.changePage(1);
    return;
  }

  // Play Note
  const m = logic.getMidi(e.key, e.shiftKey);
  if (m !== null) {
    audio.play(m);
    pianoUI.flashKey(m);
  }
});

// --- Focus Management ---
const interactive = document.querySelectorAll(
  "button, select, input, [type='checkbox'], [type='range']",
);
interactive.forEach((el) => {
  if (el.type === "text" || el.type === "number") return;

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
