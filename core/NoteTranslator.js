export class NoteTranslator {
  /**
   * Translates between Key Chars (e.g. 'q') and Note Names (e.g. '<c4>')
   * based on the provided logic engine's current scale context.
   */
  constructor(logicEngine) {
    this.logic = logicEngine;
  }

  // Converts a sheet string from Keys to Notes
  // Example: "q w [er]" -> "<c4> <d4> [<e4><f4>]"
  keysToNotes(sheetString) {
    if (!sheetString) return "";

    const lines = sheetString.split("\n");
    const translatedLines = lines.map((line) => {
      // If line starts with '-', treat as comment, do not translate
      if (line.trim().startsWith("-")) return line;
      return this.translateLineKeysToNotes(line);
    });

    return translatedLines.join("\n");
  }

  translateLineKeysToNotes(line) {
    let result = "";
    let i = 0;
    while (i < line.length) {
      const char = line[i];

      // Check for special syntax characters that should be preserved
      if ([" ", "[", "]", "{", "}", ".", "~", "|", "(", ")"].includes(char)) {
        result += char;
        i++;
        continue;
      }

      // Check if it is a valid key in the logic engine
      let isShift = false;
      let key = char;

      if (/[A-Z]/.test(char)) {
        isShift = true;
        key = char.toLowerCase();
      } else {
        const specialEntry = Object.entries(this.logic.shiftMap).find(
          ([sym, base]) => sym === char,
        );
        if (specialEntry) {
          isShift = true;
          key = specialEntry[1];
        }
      }

      const midi = this.logic.getMidi(key, isShift);

      if (midi !== null) {
        const noteName = this.logic.midiToName(midi);
        const octave = Math.floor(midi / 12) - 1;
        result += `<${noteName.toLowerCase()}${octave}>`;
      } else {
        // Unknown char, preserve it
        result += char;
      }
      i++;
    }
    return result;
  }

  // Converts a sheet string from Notes to Keys
  // Example: "<c4>" -> "q"
  notesToKeys(sheetString) {
    if (!sheetString) return "";

    // Regex to find patterns like <c#4> or <d4>
    // Note name: [a-g] followed by optional #, followed by number
    return sheetString.replace(/<([a-g][#]?)(-?\d+)>/gi, (match, note, oct) => {
      const midi = this.getMidiFromNoteName(note, parseInt(oct, 10));
      if (midi === null) return match; // Failed to parse, keep original

      // Find the key combination that produces this MIDI
      const keyCombo = this.findKeyForMidi(midi);
      return keyCombo || match; // Return key or original if not found
    });
  }

  getMidiFromNoteName(noteName, octave) {
    const offsets = {
      c: 0,
      "c#": 1,
      d: 2,
      "d#": 3,
      e: 4,
      f: 5,
      "f#": 6,
      g: 7,
      "g#": 8,
      a: 9,
      "a#": 10,
      b: 11,
    };
    const n = noteName.toLowerCase();
    if (offsets[n] === undefined) return null;
    return (octave + 1) * 12 + offsets[n];
  }

  findKeyForMidi(targetMidi) {
    // 1. Check Normal Keys
    for (let char of this.logic.keyMap) {
      if (this.logic.getMidi(char, false) === targetMidi) return char;
    }

    // 2. Check Shifted Keys
    for (let char of this.logic.keyMap) {
      if (this.logic.getMidi(char, true) === targetMidi) {
        const special = Object.keys(this.logic.shiftMap).find(
          (k) => this.logic.shiftMap[k] === char,
        );
        return special || char.toUpperCase();
      }
    }

    return null; // No mapping found in current scale
  }
}
