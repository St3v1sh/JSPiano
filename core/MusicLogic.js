export class MusicLogic {
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

    // Storage for special key re-mapping
    this.customBindings = {};
  }

  setBindings(bindingsObj) {
    this.customBindings = bindingsObj || {};
  }

  getMidi(input, isShift) {
    // Map shifted special characters back to their base keys for binding lookup
    const specialShiftToBase = {
      "{": "[",
      "}": "]",
      ":": ";",
      '"': "'",
      "<": ",",
      ">": ".",
      "?": "/",
    };

    // Determine if the input character itself implies a Shift press (e.g., '{')
    const isCharShifted = !!specialShiftToBase[input];
    // The key used to look up the binding (e.g., '{' becomes '[')
    const lookupKey = specialShiftToBase[input] || input;

    const binding = this.customBindings[lookupKey];

    let targetKey = input;
    let targetShift = isShift || isCharShifted;

    if (binding) {
      // Use the shift mapping if the physical Shift key is held OR if
      // the character typed is a shifted symbol (like '{')
      const mapping = isShift || isCharShifted ? binding.shift : binding.norm;

      if (mapping) {
        targetKey = mapping.toLowerCase();
        // If the mapped character is uppercase (e.g., 'S') or a symbol (e.g., '!'),
        // it forces the logic into Shift mode for that note.
        targetShift = /[A-Z]/.test(mapping) || !!this.shiftMap[mapping];
      }
    }

    // Standard logic continues with the translated targetKey and targetShift
    const char = this.shiftMap[targetKey] || targetKey.toLowerCase();
    const idx = this.keyMap.indexOf(char);
    if (idx === -1) return null;

    const name = this.whiteNames[idx % 7];
    const midi = (Math.floor(idx / 7) + 1) * 12 + this.whiteOffsets[name];

    const scale = this.scales[this.currentScale];
    if (scale.notes.includes(name)) {
      return targetShift ? midi : scale.sharps ? midi + 1 : midi - 1;
    }
    return targetShift ? midi + 1 : midi;
  }

  midiToName(m) {
    const notes = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B",
    ];
    return notes[m % 12];
  }

  setScale(scaleName) {
    if (this.scales[scaleName]) {
      this.currentScale = scaleName;
    }
  }
}
