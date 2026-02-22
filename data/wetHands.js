export const wetHands = {
  id: "wetHands",
  title: "Wet Hands",
  artist: "C418",
  bpm: 150,
  scale: "A Major",
  bindings: {
    "[": { norm: "%" },
    "]": { norm: "W" },
  },
  noteLength: 2.0,
  sheet: `
      -0 ---
      60 er tr e0
      9 q t u t e ..
      6 0 e r t r e 0
      9 q t u t e ..
      -5 ---
      [6o] 0 e r t r [ep] 0
      [9i] q t u t e u i
      [6o] 0 e r t r [ea] [0s]
      9 [qi] t u t e s f
      [%H] 7 9 [qg] [ed] q [9p] [7a]
      -10---
      % 7 9 q e ...
      [%H] 7 [9g] q [ed] q [9p] [7a]
      % 7 9 q e . p .
      [6u] 8 e r t r e 0
      6 8 e r t u p s ...
      -15---
      {[7i]ad...} 9 q [es] [tp] . [uf] [ig]
      7 [9d] q e t . a s
      [%d] 7 [9s] [Wd] e g ..
      [60eus] ..... a p
      [3a] 5 7 0 w 0 7 5
      ~
      -20---
      3 5 7 0 w 0 6 .
      [%H] [7g] [9f] [qd] [ef] [qd] [9f] [7g]
      6 [8f] 0 e [tj] e 0 8
      [3h] [5f] [7a] [0o] [wu] ...
      [3a] [5o] [7u] [0r] w ...
      -25---
      3 5 7 0 [0w] ...
      3 5 7 0 [0w] ...
      `
    .trim()
    .split("\n")
    .map((line) => line.trim()),
};
