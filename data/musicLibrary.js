/**
 * Data Schema:
 * {
 *   id: string (unique identifier)
 *   title: string (display name)
 *   artist: string (optional)
 *   bpm: number (characters per minute / engine speed)
 *   scale: string (Must match a key in MusicLogic.scales)
 *   sheet: string[] (The actual lines of music)
 * }
 */

export const musicLibrary = [
  {
    id: "marble_machine",
    title: "Marble Machine",
    artist: "Wintergatan",
    bpm: 500,
    scale: "G Major",
    bindings: {},
    sheet: `
      -0 ---
      [0f]... [wr].a. .... [wr].p.
      [0o].p. [wr].a. ..o. [wrp].d.
      w... [ry].a. .... [ry].p.
      [wo].p. [ry].i. ..o. [ryp].d.
      -5 ---
      q... [ry].a. .... [ry].d.
      [qs].a. [ry].p. ..o. [ryp].u.
      8... [0e].a. .... [0e].d.
      [9s].a. [qr].p. ..o. [qrp].f.
      -9 ---
      0... [wr].a. .... [wr].p.
      [0o].p. [wr].a. ..o. [wrp].d.
      w... [ry].a. .... [ry].d.
      [ws].a. [ry].p. ..o. [ryp].d.
      -13---
      7... [9q].a. .... [9qp].f.
      7.a. [9q].p. ..o. [9qi].u.
      6.r. t.i. [0et].u. o.[7y].
      i.p. u.a. [9qi].o. p.f.
      -17---
      [18]... [wr].a. .... [wr].p.
      [8o].p. [wr].a. ..o. [wrp].d.
      [29]... [qr].a. .... [qr].p.
      [9o].p. [qr].i. ..o. [qrp].d.

      ~

      -21---
      [30]... [wr].a. .... [wr].d.
      [0s].a. [wr].p. ..o. [wrp].u.
      6... [et].a. .... [et].d.
      [7s].a. [qry].p. ..o. [qryp].f.
      -25---
      [18]... [wr].a. .... [wr].p.
      [8o].p. [wr].a. ..o. [wrp].d.
      [29]... [qr].a. .... [qr].d.
      [9s].a. [qr].p. ..o. [qrp].d.
      -29---
      [30]... [wr].a. .... [wrp].f.
      7.a. [qr].p. ..o. [qri].u.
      0... [wr]... .... [wr]...
      0... .... .... ..f.
      -33---
      [0u].[wa]. [rf].[tu]. [ra].[wf]. [0u].[wa].
      [rf].[tu]. [ra].[wf]. [0u].[wa]. [ru].[wd].
      [9y].[wo]. [ed].[ry]. [eo].[wd]. [9y].[wo].
      [ed].[ry]. [eo].[wd]. [9y].[wa]. [ry].[wd].
      -37---
      [9y].[qi]. [ed].[ry]. [ei].[qd]. [9y].[qi].
      [ed].[ry]. [ei].[qd]. [9y].[qa]. [ry].[qo].
      [8u].[wi]. [ro].[tu]. [ri].[wo]. [0u].p.
      9.y. u.i. [qr].o. p.f.

      ~

      -41---
      [0u].[wa]. [rf].[tu]. [ra].[wf]. [0u].[wa].
      [rf].[tu]. [ra].[wf]. [0u].[wf]. [ru].[wd].
      [9y].[wo]. [ed].[ry]. [eo].[wd]. [9y].[wo].
      [ed].[ry]. [eo].[wd]. [9y].[wa]. [ro].[wg].
      -45---
      [7i].[9a]. [qg].[wi]. [qa].[9g]. [7i].[9a].
      [qg].[wi]. [qa].[9g]. [7i].[9g]. [qi].[wf].
      [ep].[rs]. [tf].[up]. [ts].[rf]. [ep].g.
      r.a. s.h. [yi].d. f.k.
      -49---
      [8a].[wf]. [rk].[ta]. [rf].[wk]. [8a].[wf].
      [rk].[ta]. [rf].[wk]. [8a].[wk]. [ra].[wg].
      [9i].[wa]. [eg].[ri]. [ea].[wg]. [9i].[wa].
      [eg].[ri]. [ea].[wg]. [9i].[wg]. [ri].[wh].
      -53---
      [0o].[wa]. [rh].[to]. [ra].[wh]. [0o].[wa].
      [rh].[to]. [ra].[wh]. [0o].[wh]. [ro].[qd].
      [wo].[ra]. [td].[yo]. [ta].[rd]. [wo].[ra].
      [td].[yo]. [ta].[rd]. [wo].[ra]. [yo].[rf].
      -57---
      [8u].[wa]. [rf].[tu]. [ra].[wf]. [8u].[wa].
      [rf].[tu]. [ra].[wf]. [8u].[wf]. [ru].[wg].
      [9i].[wa]. [eg].[ri]. [ea].[wg]. [9i].[wa].
      [eg].[ri]. [ea].[wg]. [9i].[wg]. [ri].[wg].

      ~

      -61---,
      [0i].[wa]. [rg].[ti]. [ra].[wg]. [0i].[wa].
      [rg].[ti]. [ra].[wg]. [0i].[wg]. [ri].[wf].
      e.a. s.g. [tus].f. h.[rd].
      g.j. f.k. [iag].h. j.x.
      -65---
      8.w. [rf].[tk]. r.w. [8f].[wj].
      [rh].[tj]. [rf].[wk]. 8.[wh]. [rfj].[wz].
      9.w. [eg].[rk]. e.w. [9g].[wj].
      [eh].[rj]. [ed].[wg]. 9.[wh]. [rdj].[wz].
      -69---
      0.w. [rf].[tk]. r.w. [0f].[wz].
      [rl].[tk]. [rf].[wj]. 0.[wh]. [tj].[wf].
      e.r. [ts].[ok]. t.r. [es].[tz].
      [rl].[yk]. [id].[pj]. i.[yh]. [rdj].[yx].
      -73---
      t.o. [af].[sk]. a.o. [tf].[oj].
      [ah].[sj]. [af].[ok]. t.[oh]. [afj].[oz].
      y.o. [pg].[ak]. p.o. [yg].[oz].
      [pl].[ak]. [pg].[oj]. y.[oh]. [agj].[oz].
      -77---
      u.o. [ah].[sk]. a.o. [ugj].[ox].
      r.[yk]. [ig].[oj]. i.[yh]. [dg].[rf].
      u.o. a.s. .a.. o.i.
      .... .u.. .... ....
      `
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  },
  {
    id: "pallet_town",
    title: "Pallet Town",
    artist: "Junichi Masuda",
    bpm: 384,
    scale: "G Major",
    bindings: {},
    sheet: `
      -1 ---
      [wd]. [rs]. [ya]. [rp]. [0h]. [rf]. [qg]. [rf].
      [wd].r.y. [ra]. [qo]. [ro]. [0p]. [ra].
      {[8u]os}.w.t.w. 9. [ei]. [yo]. [ep].
      [5ya].9.w. [9s] a [2p].6.9.q.
      -5 ---
      [wd]. [rs]. [ya]. [rd]. [0h]. [rg]. [qg]. [rh].
      [wf].r.y. [rd]. [qd].r.0.r.
      [8us]. [wya]. [tp]. [wro]. [9id]. [eus]. [ya]. [etp].
      [5ro].9.w.9. 5. o. [9p]. a.
      -9 ---
      {[8u]os}.w. [tus]. w. [9id].e.y. [eus].
      [5ya].9.w.e. r. o. [wp]. a.
      [8us].w. [tus]. w. [9id].e.y. [es] d
      [5ya].9.w.e. r. a. [wp]. o.
      -13---
      [6tp].0.e.t. [tu].0. [ya].e.
      [6tp].0.e.t. [to].0. [tu].0.
      [2ei].6.9. [6e]. [3ro].7. [0ya].7.
      [2ya].6.9. s a [2p].6.9.q.

      e. y. i. p.

      ~

      -17---
      [oz]. [al]. [dk]. [aj]. [uv]. [ax]. [ic]. [ax].
      [oz].a.d. [ak]. [ih]. [ah]. [uj]. [ak].
      {[tf]hl}.o.s.o. y. [pg]. [dh]. [pj].
      [wdk].y.o. [yl] k [9j].e.y.i.
      [oz]. [al]. [dk]. [az]. [uv]. [ac]. [ic]. [av].
      -22---
      [ox].a.d. [az]. [iz].a.u.a.
      [tfl]. [odk]. [sj]. [oah]. [ygz]. [pfl]. [dk]. [psj].
      [wah].y.o.y. w. h. [yj]. k.
      {[tf]hl}. [of]. [sh]. [ol]. [yz]. [pd]. [dg]. [pl].
      [wk].y.o.p. a. h. [oj]. k.
      -27---
      [tl]. [of]. [sh]. [ol]. [yz]. [pd]. [dg]. [pl] z
      [wk].y.o.p. a. k. [oj]. h.
      [ej]. [us]. [pf]. [us]. [pf]. [us]. [pk]. [us].
      [ej]. [us]. [pf]. [us]. [ph]. [us]. [pf]. [us].
      [9g]. [ep]. [yd]. [ep]. [0h]. [ra]. [uk]. [ra].
      -32---
      [9k].e.y. l k [9j].e.y.e.
      w.y.o.p.a.d.h.j.
      [wkv]...............
      `
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  },
  {
    id: "living_mice",
    title: "Living Mice",
    artist: "C418",
    bpm: 296,
    scale: "C Major",
    bindings: {
      "[": { norm: "$" },
    },
    sheet: `
      -1 ---
      [wu]. e. u. t... u.....
      w. e. u. t. ........
      [wu]. e. u. t... u.....
      w. e. u. t. ........
      -5 ---
      [6p]. e. u. t... [us]. a...
      [3o]. [ep]. u. [td]....... t.
      [6p]. e. u. t... [uf]. d...
      [6p]. [ef]. u. [ts]....... t.
      [9s]. [ed]. [uf]. t... u. s. d.
      -10---
      [9p]. e. u. t..... u...
      [9h]. e. [uf]. [ts]... u. h...
      [9d]. [ep]. u. t..... u...
      [6wps]. eau. [tu]. o.. p.. 8.
      [6woa]. epu. [td]. ...... t.
      -15---
      [6wps]. efu. [tp]... fpd. [f0].
      [6wpd]. [ef]. u. [tps]. ........
      [6wps]. eau. [tu]. o.. p.. 8.
      [6woa]. epu. [td]. ...... t.
      [6wps]. efu. [tp]... fpd. [f0].

      ~

      -20---
      [6wpd]. [ef]. u. [tps]. ........
      [4wys]. [eu]. [ua]. [to]... [af]. d.8.
      [3wy]. [eu]. [ua]. [tod]. ...... t.
      [5wo]. [ep]. [uf]. [ts]... [uf]. d. 9.
      -24---
      [$wyo]. [ep]. [uf]. [ts]. ........
      [4wpd]. [ef]. [uk]. [th]... [ufk]. s. 8.
      [3ad]. [ef]. [uk]. [tdh]. ...... t.
      [5wyo]. [ep]. [uf]. [ts]... [uf]. d. 9.
      -28---
      [$wyo]. [ep]. [uf]. [ts]. l... z...
      [6wfhlx]. e[sl]u. [tak].. [oh]u. [tuf]. 0.
      [5wfx]. e[sl]u. [tak]. ........
      [6wfjlx]. e[dz]u. [tpj].. [IG].. [eyd].[ra].
      -32---
      [8wfx]. e[dz]u. [tsj]. ........
      [6wfhlx]. e[sl]u. [tak].. [oh]u. [tuf]. 0.
      [5wfx]. e[sl]u. [tdz]. ........
      [6wfjlx]. e[dz]u. [tsj].. [IG].. [eyd].[ra].
      -36---
      [8wfx]. e[dz]u. [tpj]. ........
      [5p]. e. u. t... [uf]. d...
      [4p]. e. u. t... u... o.
      [5p]. e. u. t... [uf]. d...
      [1p]. e. u. t... u.....
      `
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  },
  {
    id: "wet_hands",
    title: "Wet Hands",
    artist: "C418",
    bpm: 150,
    scale: "A Major",
    bindings: {},
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
      .map((line) => line.trim())
      .filter(Boolean),
  },
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
      .map((line) => line.trim())
      .filter(Boolean),
  },
];
