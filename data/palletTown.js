export const palletTown = {
  id: "palletTown",
  title: "Pallet Town",
  artist: "Junichi Masuda",
  bpm: 384,
  scale: "G Major",
  bindings: {},
  noteLength: 1.0,
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
    .map((line) => line.trim()),
};
