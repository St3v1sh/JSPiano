export const marbleMachine = {
  id: "marbleMachine",
  title: "Marble Machine",
  artist: "Wintergatan",
  bpm: 500,
  scale: "G Major",
  bindings: {},
  noteLength: 1.5,
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
      .... .[0u].. .... ....
      `
    .trim()
    .split("\n")
    .map((line) => line.trim()),
};
