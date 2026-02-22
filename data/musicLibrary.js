/**
 * Data Schema:
 * {
 *   id: string (unique identifier)
 *   title: string (display name)
 *   artist: string (optional)
 *   bpm: number (characters per minute / engine speed)
 *   scale: string (Must match a key in MusicLogic.scales)
 *   noteLength: number (optional, defaults to 2.0s, range 0.2 - 2.0)
 *   sheet: string[] (The actual lines of music)
 * }
 */

import { fieldOfHopesAndDreams } from "./fieldOfHopesAndDreams.js";
import { livingMice } from "./livingMice.js";
import { marbleMachine } from "./marbleMachine.js";
import { neverGonnaGiveYouUp } from "./neverGonnaGiveYouUp.js";
import { palletTown } from "./palletTown.js";
import { wetHands } from "./wetHands.js";

export const musicLibrary = [
  wetHands,
  palletTown,
  livingMice,
  marbleMachine,
  neverGonnaGiveYouUp,
  fieldOfHopesAndDreams,
  {
    id: "test",
    title: "Test",
    artist: "Debug",
    bpm: 200,
    scale: "C Major",
    bindings: {
      "[": { norm: "t", shift: "y" },
      "]": { norm: "u", shift: "i" },
    },
    sheet: `
      . . . .
      t t t t
      [ts] [ts] [ts] [ts]
      [t.] [t.] [.s] [.s]
      {ts} {ts} {ts} {ts}
      {ts...} {ts...} {ts...} {ts...}
      t t t t
      {t..} {.t.} {..t} {...}
      {t.s} {.t.} {s.t} {.s.}
      `
      .trim()
      .split("\n")
      .map((line) => line.trim()),
  },
];
