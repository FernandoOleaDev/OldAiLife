export type Params = Record<string, number | string>;
export type RGB = [number, number, number];
export interface Metric {
  label: string;
  value: number;
  color: string;
}
export interface Point {
  x: number;
  y: number;
  angle?: number;
  color: string;
  size?: number;
  shape?: "triangle" | "dot" | "ant";
}
export interface Frame {
  id: string;
  tick: number;
  width: number;
  height: number;
  pixels?: Uint8ClampedArray;
  points?: Point[];
  segments?: Segment[];
  metrics: Metric[];
  note?: string;
  originX?: number;
  originY?: number;
  scale?: number;
}
export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  depth: number;
}
export interface Snapshot {
  format: "oldailife";
  version: 1;
  id: string;
  params: Params;
  seed: number;
  tick: number;
  randomState: number;
  data: unknown;
}
export interface Param {
  key: string;
  label: string;
  type?: "range" | "select" | "text";
  min?: number;
  max?: number;
  step?: number;
  options?: [string, string][];
  rebuild?: boolean;
  hint?: string;
}
export interface Preset {
  name: string;
  params: Params;
  seed?: number;
}
export interface Definition {
  id: string;
  name: string;
  short: string;
  category: string;
  year: string;
  author: string;
  accent: string;
  symbol: string;
  description: string;
  rule: string;
  variant: string;
  sources: [string, string][];
  defaults: Params;
  controls: Param[];
  presets: Preset[];
  tools: [string, string][];
  rate: number;
  legend: [string, string][];
}
export interface Paint {
  x: number;
  y: number;
  tool: string;
  radius: number;
}
