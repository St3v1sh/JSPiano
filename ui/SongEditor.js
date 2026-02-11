import { NoteTranslator } from "../core/NoteTranslator.js";

const EDITOR_DEFAULTS = {
  BPM: 200,
  ID_PREFIX: "usr_",
  UNTITLED: "Untitled Song",
  UNKNOWN_ARTIST: "Unknown",
};

export class SongEditor {
  constructor(logicEngine, callbacks) {
    this.logic = logicEngine;
    this.callbacks = callbacks || {}; // onSave, onCancel, onDelete, onScaleChange, getBindings
    this.translator = new NoteTranslator(logicEngine);

    this.dom = {
      inputs: {
        title: document.getElementById("editTitle"),
        artist: document.getElementById("editArtist"),
        bpm: document.getElementById("editBpm"),
        scale: document.getElementById("editScale"),
      },
      textareas: {
        left: document.getElementById("txtPageLeft"),
        right: document.getElementById("txtPageRight"),
      },
      labels: {
        left: document.getElementById("lblPageLeft"),
        right: document.getElementById("lblPageRight"),
      },
      buttons: {
        save: document.getElementById("btnEditorSave"),
        cancel: document.getElementById("btnEditorCancel"),
        export: document.getElementById("btnEditorExport"),
        delete: document.getElementById("btnEditorDelete"),
      },
      toggleNotation: document.getElementById("toggleEditorNotation"),
      prev: document.getElementById("btnPrev"),
      next: document.getElementById("btnNext"),
      pageIndicator: document.getElementById("pageIndicator"),
    };

    // Rename Cancel to Exit
    this.dom.buttons.cancel.innerText = "Exit";

    this.isActive = false;
    this.currentSongId = null;
    this.rawPages = [""]; // Array of strings, split by '~'
    this.pageIndex = 0; // Current spread start index (0, 2, 4...)
    this.isNotationMode = false;

    this.bindEvents();
    this.populateScales();
  }

  bindEvents() {
    this.dom.buttons.save.onclick = () => this.handleSave();
    this.dom.buttons.cancel.onclick = () => {
      // Confirm before exit
      if (confirm("Unsaved changes will be lost. Exit Editor?")) {
        if (this.callbacks.onCancel) this.callbacks.onCancel();
      }
    };
    this.dom.buttons.delete.onclick = () => {
      if (this.currentSongId && this.callbacks.onDelete) {
        this.callbacks.onDelete(this.currentSongId);
      }
    };
    this.dom.buttons.export.onclick = () => this.handleExport();

    this.dom.toggleNotation.onchange = (e) => {
      this.isNotationMode = e.target.checked;
      this.refreshTextareas();
    };

    // Scale sync logic inside Editor
    this.dom.inputs.scale.onchange = (e) => {
      const val = e.target.value;
      if (this.callbacks.onScaleChange) {
        this.callbacks.onScaleChange(val);
      }
      if (this.isNotationMode) {
        this.refreshTextareas();
      }
    };

    // Auto-save logic to memory model on input to prevent data loss on pagination
    const savePageState = () => {
      this.saveCurrentPagesToMemory();
    };
    this.dom.textareas.left.addEventListener("input", savePageState);
    this.dom.textareas.right.addEventListener("input", savePageState);
  }

  populateScales() {
    this.dom.inputs.scale.innerHTML = "";
    Object.keys(this.logic.scales).forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.innerText = s;
      this.dom.inputs.scale.appendChild(opt);
    });
  }

  load(songData) {
    // Reset State
    this.currentSongId = songData ? songData.id : null;
    this.dom.inputs.title.value = songData ? songData.title : "";
    this.dom.inputs.artist.value = songData ? songData.artist || "" : "";
    this.dom.inputs.bpm.value = songData
      ? songData.bpm || EDITOR_DEFAULTS.BPM
      : EDITOR_DEFAULTS.BPM;
    this.dom.inputs.scale.value = songData
      ? songData.scale
      : this.logic.currentScale;

    // Ensure logic engine matches editor scale immediately
    // If not, trigger the callback to sync global state
    if (this.logic.currentScale !== this.dom.inputs.scale.value) {
      if (this.callbacks.onScaleChange)
        this.callbacks.onScaleChange(this.dom.inputs.scale.value);
    }

    this.dom.buttons.delete.style.display = songData ? "inline-flex" : "none";
    this.dom.toggleNotation.checked = false;
    this.isNotationMode = false;

    // Parse Sheet into Pages
    if (songData && songData.sheet) {
      const fullText = songData.sheet.join("\n");
      this.rawPages = fullText.split(/^\s*~\s*$/m).map((p) => p.trim());
      if (this.rawPages.length === 0) this.rawPages = [""];
    } else {
      this.rawPages = [""];
    }

    this.pageIndex = 0;
    this.refreshTextareas();
    this.updatePaginationButtons();
  }

  refreshTextareas() {
    const p1 = this.rawPages[this.pageIndex] || "";
    const p2 = this.rawPages[this.pageIndex + 1] || "";

    if (this.isNotationMode) {
      this.dom.textareas.left.value = this.translator.keysToNotes(p1);
      this.dom.textareas.right.value = this.translator.keysToNotes(p2);
    } else {
      this.dom.textareas.left.value = p1;
      this.dom.textareas.right.value = p2;
    }

    this.dom.labels.left.innerText = this.pageIndex + 1;
    this.dom.labels.right.innerText = this.pageIndex + 2;

    // Update Global Indicator
    const dL = this.pageIndex + 1;
    const dR = this.pageIndex + 2;
    if (this.dom.pageIndicator)
      this.dom.pageIndicator.innerText = `Pg ${dL}-${dR}`;
  }

  saveCurrentPagesToMemory() {
    let t1 = this.dom.textareas.left.value;
    let t2 = this.dom.textareas.right.value;

    if (this.isNotationMode) {
      t1 = this.translator.notesToKeys(t1);
      t2 = this.translator.notesToKeys(t2);
    }

    // Ensure array is large enough
    while (this.rawPages.length <= this.pageIndex + 1) {
      this.rawPages.push("");
    }

    this.rawPages[this.pageIndex] = t1;
    this.rawPages[this.pageIndex + 1] = t2;
  }

  changePage(dir) {
    this.saveCurrentPagesToMemory();
    const newIndex = this.pageIndex + dir * 2;

    if (newIndex >= 0) {
      while (this.rawPages.length <= newIndex + 1) {
        this.rawPages.push("");
      }

      this.pageIndex = newIndex;
      this.refreshTextareas();
      this.updatePaginationButtons();
    }
  }

  updatePaginationButtons() {
    this.dom.prev.disabled = this.pageIndex <= 0;
    this.dom.next.disabled = false;
  }

  getSongData() {
    this.saveCurrentPagesToMemory();

    // Reconstruct sheet array
    let cleanPages = [...this.rawPages];
    while (cleanPages.length > 0 && !cleanPages[cleanPages.length - 1].trim()) {
      cleanPages.pop();
    }

    const sheetLines = [];
    cleanPages.forEach((page, idx) => {
      if (idx > 0) sheetLines.push("~");
      const lines = page.split("\n");
      sheetLines.push(...lines);
    });

    // Get current bindings from main app
    const bindings = this.callbacks.getBindings
      ? this.callbacks.getBindings()
      : {};

    return {
      id:
        this.currentSongId ||
        EDITOR_DEFAULTS.ID_PREFIX + Date.now().toString(36),
      title: this.dom.inputs.title.value || EDITOR_DEFAULTS.UNTITLED,
      artist: this.dom.inputs.artist.value || EDITOR_DEFAULTS.UNKNOWN_ARTIST,
      bpm: parseInt(this.dom.inputs.bpm.value, 10) || EDITOR_DEFAULTS.BPM,
      scale: this.dom.inputs.scale.value,
      bindings: bindings,
      sheet: sheetLines,
      isCustom: true,
    };
  }

  async handleSave() {
    if (!this.dom.inputs.title.value.trim()) {
      alert("Please enter a song title.");
      return;
    }
    const data = this.getSongData();
    if (this.callbacks.onSave) {
      await this.callbacks.onSave(data);
    }
  }

  handleExport() {
    const data = this.getSongData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  getSongDataForPlayback() {
    return this.getSongData();
  }

  getCursorLineIndex() {
    let activeText = this.dom.textareas.left;
    let pageOffset = this.pageIndex;

    if (document.activeElement === this.dom.textareas.right) {
      activeText = this.dom.textareas.right;
      pageOffset = this.pageIndex + 1;
    }

    let linesBefore = 0;
    for (let i = 0; i < pageOffset; i++) {
      const page = this.rawPages[i] || "";
      const lines = page.split("\n");
      linesBefore += lines.length;
      if (i > 0 || pageOffset > 0) linesBefore += 1;
    }

    const val = activeText.value;
    const cursor = activeText.selectionStart;
    const textBeforeCursor = val.substring(0, cursor);
    const linesInActive = textBeforeCursor.split("\n").length - 1;

    return linesBefore + linesInActive;
  }
}
