"use client";

import { useEffect, useRef, useState } from "react";

const TENANTS = [
  { name: "Acme", projects: 12 },
  { name: "Halden", projects: 40 },
  { name: "Oru", projects: 7 },
  { name: "Vela", projects: 23 },
];

const CELL = 9;
const WALL = 2; // cells of empty space around each tenant
const LIME = "214, 244, 91";
const hash = (x: number, y: number) => {
  const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
type Dot = { x: number; y: number; size: number; tenant: number; alpha: number; delay: number };

/** Four tenant blocks in the free area of the panel, leaving the text clear. */
function blocks(w: number, h: number, stacked: boolean) {
  const left = stacked ? 0.06 * w : 0.54 * w;
  const top = stacked ? 0.56 * h : 0.14 * h;
  const width = stacked ? 0.88 * w : 0.4 * w;
  const height = stacked ? 0.26 * h : 0.56 * h;
  const gap = (WALL * 2 + 1) * CELL;
  const bw = (width - gap) / 2;
  const bh = (height - gap) / 2;
  return [0, 1, 2, 3].map((i) => {
    const x = left + (i % 2) * (bw + gap);
    const y = top + (i >> 1) * (bh + gap);
    return { x0: x, y0: y, x1: x + bw, y1: y + bh };
  });
}

function buildDots(w: number, h: number): Dot[] {
  const rects = blocks(w, h, w < 768);
  const dots: Dot[] = [];
  const reach = Math.max(w, h) * 0.16;
  for (let gx = 0; gx * CELL < w; gx++) {
    for (let gy = 0; gy * CELL < h; gy++) {
      const x = gx * CELL;
      const y = gy * CELL;
      const n = hash(gx, gy);
      const tenant = rects.findIndex((r) => x >= r.x0 && x < r.x1 && y >= r.y0 && y < r.y1);
      if (tenant >= 0) {
        if (n > 0.05) dots.push({ x, y, size: 6, tenant, alpha: 1, delay: n * 0.35 + 0.1 + tenant * 0.1 });
        continue;
      }
      const d = Math.min(...rects.map((r) => Math.hypot(Math.max(r.x0 - x, 0, x - r.x1), Math.max(r.y0 - y, 0, y - r.y1))));
      if (d < WALL * CELL) continue; // the wall stays empty
      if (w < 768 ? y < 0.5 * h : x < 0.48 * w) continue; // the text stays clear
      if (n < Math.exp(-d / reach) * 0.3) dots.push({ x, y, size: n < 0.1 ? 5 : 3, tenant: -1, alpha: 0.32, delay: n * 0.8 });
    }
  }
  return dots;
}

/**
 * The signature graphic: tenants as blocks of pixels with empty walls between them.
 * Pointing at one lights it and dims the rest, which is what isolation means.
 */
export function DotField({ caption = true }: { caption?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  useEffect(() => {
    const el = host.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    const lit: number[] = TENANTS.map((_, i) => (i === 0 ? 1 : 0));
    let dots: Dot[] = [];
    let w = 0;
    let h = 0;
    let frame = 0;

    const draw = (now: number) => {
      frame = 0;
      const t = still ? 2 : (now - start) / 1100;
      let moving = t < 1.2;
      lit.forEach((v, i) => {
        const goal = i === activeRef.current ? 1 : 0;
        lit[i] = still ? goal : v + (goal - v) * 0.16;
        if (Math.abs(lit[i] - goal) > 0.01) moving = true;
      });
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        const p = Math.min(1, Math.max(0, (t - d.delay) / 0.3));
        if (p === 0) continue;
        const s = d.size * p;
        if (d.tenant < 0) {
          ctx.fillStyle = `rgba(255,255,255,${d.alpha})`;
        } else {
          const l = lit[d.tenant];
          ctx.fillStyle = l > 0.5 ? `rgba(${LIME},${l})` : `rgba(255,255,255,${0.3 + (0.5 - l) * 0.5})`;
        }
        ctx.fillRect(d.x, d.y, s, s);
      }
      if (moving) frame = requestAnimationFrame(draw);
    };
    const redraw = () => { if (!frame) frame = requestAnimationFrame(draw); };

    const resize = () => {
      const r = el.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = buildDots(w, h);
      redraw();
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const hit = blocks(w, h, w < 768).findIndex((b) => x >= b.x0 && x < b.x1 && y >= b.y0 && y < b.y1);
      if (hit < 0 || hit === activeRef.current) return;
      activeRef.current = hit;
      setActive(hit);
      redraw();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(el);
    const panel = el.parentElement;
    panel?.addEventListener("pointermove", move);
    panel?.addEventListener("pointerdown", move);
    return () => {
      observer.disconnect();
      panel?.removeEventListener("pointermove", move);
      panel?.removeEventListener("pointerdown", move);
      cancelAnimationFrame(frame);
    };
  }, []);

  const t = TENANTS[active];
  return (
    <>
      <div ref={host} className="absolute inset-0" aria-hidden>
        <canvas ref={canvas} className="size-full" />
      </div>
      {caption && (
        <p className="absolute right-3 bottom-3 left-3 flex flex-wrap justify-between gap-x-4 rounded-2xl bg-white/15 px-4 py-3 text-sm text-white backdrop-blur-md sm:left-auto sm:min-w-80">
          <span className="font-semibold">{t.name} sees {t.projects} projects</span>
          <span className="opacity-85">and nobody else&apos;s</span>
        </p>
      )}
    </>
  );
}
