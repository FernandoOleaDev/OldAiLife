import type { Frame, Metric } from "./core/types";
export class Renderer {
  ctx: CanvasRenderingContext2D;
  off = document.createElement("canvas");
  offCtx: CanvasRenderingContext2D;
  frame?: Frame;
  zoom = 1;
  panX = 0;
  panY = 0;
  grid = false;
  transform = { x: 0, y: 0, unit: 1 };
  constructor(public canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
    this.offCtx = this.off.getContext("2d")!;
    new ResizeObserver(() => this.draw()).observe(canvas);
  }
  fit() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.draw();
  }
  set(f: Frame) {
    this.frame = f;
    if (f.pixels) {
      this.off.width = f.width;
      this.off.height = f.height;
      const image = this.offCtx.createImageData(f.width, f.height);
      image.data.set(f.pixels);
      this.offCtx.putImageData(image, 0, 0);
    }
    this.draw();
  }
  draw() {
    const c = this.canvas,
      rect = c.getBoundingClientRect(),
      dpr = Math.min(devicePixelRatio, 2);
    if (!rect.width || !rect.height) return;
    if (
      c.width !== Math.round(rect.width * dpr) ||
      c.height !== Math.round(rect.height * dpr)
    ) {
      c.width = Math.round(rect.width * dpr);
      c.height = Math.round(rect.height * dpr);
    }
    const ctx = this.ctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = rect.width,
      h = rect.height;
    ctx.fillStyle = "#0b1112";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#293431";
    for (let x = 16; x < w; x += 24)
      for (let y = 16; y < h; y += 24) ctx.fillRect(x, y, 1, 1);
    if (!this.frame) return;
    const f = this.frame,
      unit = Math.min((w - 32) / f.width, (h - 32) / f.height) * this.zoom,
      x = (w - f.width * unit) / 2 + this.panX,
      y = (h - f.height * unit) / 2 + this.panY;
    this.transform = { x, y, unit };
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.clip();
    ctx.imageSmoothingEnabled = false;
    if (f.pixels)
      ctx.drawImage(this.off, x, y, f.width * unit, f.height * unit);
    else {
      ctx.fillStyle = "#0b1112";
      ctx.fillRect(x, y, f.width * unit, f.height * unit);
    }
    ctx.strokeStyle = "#2d3b33";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 0.5, y - 0.5, f.width * unit + 1, f.height * unit + 1);
    if (this.grid && unit > 4) {
      ctx.strokeStyle = "rgba(136,166,149,.15)";
      ctx.beginPath();
      for (let i = 0; i <= f.width; i++) {
        ctx.moveTo(x + i * unit, y);
        ctx.lineTo(x + i * unit, y + f.height * unit);
      }
      for (let i = 0; i <= f.height; i++) {
        ctx.moveTo(x, y + i * unit);
        ctx.lineTo(x + f.width * unit, y + i * unit);
      }
      ctx.stroke();
    }
    ctx.lineCap = "round";
    for (const s of f.segments || []) {
      ctx.strokeStyle = s.depth < 2 ? "#a68a62" : "#b6cf97";
      ctx.lineWidth = Math.max(0.65, (1.4 - s.depth * 0.13) * unit);
      ctx.beginPath();
      ctx.moveTo(x + s.x1 * unit, y + s.y1 * unit);
      ctx.lineTo(x + s.x2 * unit, y + s.y2 * unit);
      ctx.stroke();
    }
    for (const p of f.points || []) {
      const px = x + p.x * unit,
        py = y + p.y * unit,
        r = Math.max(1.2, (p.size || 1) * unit);
      ctx.fillStyle = p.color;
      ctx.save();
      ctx.translate(px, py);
      if (p.shape === "triangle") {
        ctx.rotate(p.angle || 0);
        ctx.beginPath();
        ctx.moveTo(r * 1.6, 0);
        ctx.lineTo(-r, r * 0.65);
        ctx.lineTo(-r * 0.55, 0);
        ctx.lineTo(-r, -r * 0.65);
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === "ant") {
        ctx.rotate(p.angle || 0);
        ctx.fillRect(-r, -r * 0.45, r * 2, r * 0.9);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }
  position(clientX: number, clientY: number) {
    if (!this.frame) return null;
    const rect = this.canvas.getBoundingClientRect(),
      t = this.transform,
      x = (clientX - rect.left - t.x) / t.unit,
      y = (clientY - rect.top - t.y) / t.unit;
    if (x < 0 || y < 0 || x >= this.frame.width || y >= this.frame.height)
      return null;
    return {
      x: x * (this.frame.scale || 1) + (this.frame.originX || 0),
      y: y * (this.frame.scale || 1) + (this.frame.originY || 0),
    };
  }
}
export interface Sample {
  tick: number;
  metrics: Metric[];
}
export function drawChart(canvas: HTMLCanvasElement, samples: Sample[]) {
  const r = canvas.getBoundingClientRect(),
    dpr = Math.min(devicePixelRatio, 2);
  canvas.width = Math.max(1, Math.round(r.width * dpr));
  canvas.height = Math.max(1, Math.round(r.height * dpr));
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  const w = r.width,
    h = r.height;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "#30352e";
  ctx.lineWidth = 1;
  for (let y = 12; y < h - 12; y += (h - 24) / 3) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  if (samples.length < 2) return;
  const max = Math.max(
      1,
      ...samples.flatMap((s) => s.metrics.slice(0, 2).map((m) => m.value)),
    ),
    start = samples[0].tick,
    end = samples.at(-1)!.tick;
  for (let j = 0; j < Math.min(2, samples[0].metrics.length); j++) {
    ctx.strokeStyle = samples.at(-1)!.metrics[j]?.color || "#adc";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    samples.forEach((s, i) => {
      const x = ((s.tick - start) / (end - start || 1)) * (w - 2) + 1,
        y = h - 12 - ((s.metrics[j]?.value || 0) / max) * (h - 26);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
  ctx.fillStyle = "#839080";
  ctx.font = "10px monospace";
  ctx.fillText(String(Math.round(max)), 4, 10);
  ctx.fillText(String(start), 4, h - 1);
  ctx.textAlign = "right";
  ctx.fillText(String(end), w - 3, h - 1);
}
