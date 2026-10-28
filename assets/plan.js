// Original Tanit Hub floor-plan animation, retained on the new home page.
/* Hero: a floor plan drafted line by line on a structural grid. */
(() => {
  const cv = document.getElementById("plan");
  const ctx = cv.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let items = [], start = 0, W = 0, H = 0, raf = 0;

  function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

  function build() {
    const r = rng(1989 + 7);
    items = [];
    const g = Math.max(70, Math.min(W, H) / 7);         // grid spacing
    const ox = W * 0.34, oy = g * 0.9;                   // plan origin, pushed right
    const cols = Math.ceil((W - ox) / g) + 1, rows = Math.ceil((H - oy) / g) + 1;
    // structural grid with bubbles
    for (let i = 0; i <= cols; i++) items.push({ t: "axis", x1: ox + i * g, y1: oy - g * .55, x2: ox + i * g, y2: H + 10, lab: String.fromCharCode(65 + (i % 26)), bx: ox + i * g, by: oy - g * .55 - 13 });
    for (let j = 0; j <= rows; j++) items.push({ t: "axis", x1: ox - g * .55, y1: oy + j * g, x2: W + 10, y2: oy + j * g, lab: String(j + 1), bx: ox - g * .55 - 13, by: oy + j * g });
    // rooms by recursive splitting on the grid
    const rooms = [];
    (function split(x, y, w, h, d) {
      if (d > 3 || (w <= 2 && h <= 2) || (d > 1 && r() < .22)) { rooms.push({ x, y, w, h }); return; }
      if ((w >= h && w > 1) || h <= 1) { const c = 1 + Math.floor(r() * (w - 1)); split(x, y, c, h, d + 1); split(x + c, y, w - c, h, d + 1); }
      else { const c = 1 + Math.floor(r() * (h - 1)); split(x, y, w, c, d + 1); split(x, y + c, w, h - c, d + 1); }
    })(0, 0, cols, rows, 0);
    const T = 5;
    rooms.forEach(rm => {
      const x = ox + rm.x * g, y = oy + rm.y * g, w = rm.w * g, h = rm.h * g;
      // walls: outer line + inner line
      items.push({ t: "rect", x, y, w, h });
      items.push({ t: "rect", x: x + T, y: y + T, w: w - 2 * T, h: h - 2 * T, faint: true });
      // a door on the bottom wall with its swing
      if (r() < .8 && w > g * .9) {
        const dw = Math.min(g * .62, 46), dx = x + T + (w - 2 * T - dw) * (.15 + r() * .7);
        items.push({ t: "gap", x: dx, y: y + h - T - 1, w: dw, h: T + 2 });
        items.push({ t: "arc", cx: dx, cy: y + h - T, rad: dw, a0: -Math.PI / 2, a1: 0 });
        items.push({ t: "line", x1: dx, y1: y + h - T, x2: dx, y2: y + h - T - dw });
      }
      // dimension on the top edge of larger rooms
      if (w >= g * 2 && r() < .55) items.push({ t: "dim", x1: x, x2: x + w, y: y + g * .28, txt: (rm.w * 5).toFixed(2).replace(".", ",") });
      // room tag
      if (w >= g && h >= g) items.push({ t: "tag", x: x + w / 2, y: y + h / 2, txt: String(rooms.indexOf(rm) + 1).padStart(2, "0") });
    });
  }

  function drawItem(it, k) {        // k in 0..1 = how much of it is drawn
    ctx.beginPath();
    if (it.t === "axis") {
      ctx.strokeStyle = "rgba(255,255,255,.07)"; ctx.setLineDash([10, 5, 2, 5]); ctx.lineWidth = 1;
      ctx.moveTo(it.x1, it.y1); ctx.lineTo(it.x1 + (it.x2 - it.x1) * k, it.y1 + (it.y2 - it.y1) * k); ctx.stroke(); ctx.setLineDash([]);
      if (k > .2) { ctx.beginPath(); ctx.strokeStyle = "rgba(255,255,255,.22)"; ctx.arc(it.bx, it.by, 11, 0, 7); ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,.4)"; ctx.font = "500 10px IBM Plex Mono, monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(it.lab, it.bx, it.by + .5); }
      return;
    }
    ctx.setLineDash([]); ctx.lineWidth = 1.2;
    if (it.t === "rect") {
      ctx.strokeStyle = it.faint ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.55)";
      const P = 2 * (it.w + it.h), L = P * k, pts = [[it.x, it.y], [it.x + it.w, it.y], [it.x + it.w, it.y + it.h], [it.x, it.y + it.h], [it.x, it.y]];
      ctx.moveTo(it.x, it.y); let acc = 0;
      for (let i = 1; i < pts.length; i++) {
        const [ax, ay] = pts[i - 1], [bx, by] = pts[i], s = Math.hypot(bx - ax, by - ay);
        if (acc + s <= L) { ctx.lineTo(bx, by); acc += s; } else { const f = (L - acc) / s; ctx.lineTo(ax + (bx - ax) * f, ay + (by - ay) * f); break; }
      }
      ctx.stroke();
    } else if (it.t === "gap") {
      if (k > .5) { ctx.fillStyle = "#0A0A0B"; ctx.fillRect(it.x, it.y, it.w, it.h); }
    } else if (it.t === "arc") {
      ctx.strokeStyle = "rgba(255,255,255,.26)"; ctx.arc(it.cx, it.cy, it.rad, it.a0, it.a0 + (it.a1 - it.a0) * k); ctx.stroke();
    } else if (it.t === "line") {
      ctx.strokeStyle = "rgba(255,255,255,.42)"; ctx.moveTo(it.x1, it.y1); ctx.lineTo(it.x1 + (it.x2 - it.x1) * k, it.y1 + (it.y2 - it.y1) * k); ctx.stroke();
    } else if (it.t === "dim") {
      ctx.strokeStyle = "rgba(255,255,255,.28)"; ctx.lineWidth = 1;
      const xe = it.x1 + (it.x2 - it.x1) * k; ctx.moveTo(it.x1, it.y); ctx.lineTo(xe, it.y);
      [it.x1, xe].forEach(x => { ctx.moveTo(x - 4, it.y + 4); ctx.lineTo(x + 4, it.y - 4); }); ctx.stroke();
      if (k === 1) { ctx.fillStyle = "rgba(255,255,255,.38)"; ctx.font = "10px IBM Plex Mono, monospace"; ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.fillText(it.txt, (it.x1 + it.x2) / 2, it.y - 4); }
    } else if (it.t === "tag") {
      if (k === 1) { ctx.fillStyle = "rgba(255,255,255,.3)"; ctx.font = "10px IBM Plex Mono, monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(it.txt, it.x, it.y); }
    }
  }

  function frame(now) {
    const DUR = 4200, n = items.length, p = reduce ? 1 : Math.min(1, (now - start) / DUR);
    ctx.clearRect(0, 0, W, H);
    const done = p * n;
    for (let i = 0; i < n; i++) { if (i > done) break; drawItem(items[i], Math.min(1, done - i)); }
    if (p < 1) raf = requestAnimationFrame(frame);
  }

  function size(animate) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build(); cancelAnimationFrame(raf);
    start = animate ? performance.now() : -1e9; raf = requestAnimationFrame(frame);
  }
  let t; addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => size(false), 150); });
  size(true);
})();
