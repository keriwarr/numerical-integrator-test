export type Vec2D = { x: number; y: number };
export const makeVec2D = (x: number, y: number): Vec2D => ({ x, y });

export const add = (v1: Vec2D, v2: Vec2D): Vec2D => ({
  x: v1.x + v2.x,
  y: v1.y + v2.y,
});
export const sub = (v1: Vec2D, v2: Vec2D): Vec2D => ({
  x: v1.x - v2.x,
  y: v1.y - v2.y,
});
export const scale = (v: Vec2D, scalar: number) => ({
  x: v.x * scalar,
  y: v.y * scalar,
});
const dotProduct = (v1: Vec2D, v2: Vec2D) => v1.x * v2.x + v1.y * v2.y;
// const projection = (v: Vec2D, onto: Vec2D) =>
//   scale(onto, dotProduct(v, onto) / dotProduct(onto, onto));
// const perpendicular = (v: Vec2D, onto: Vec2D) => sub(v, projection(v, onto));
export const length = (v: Vec2D) => Math.sqrt(dotProduct(v, v));
export const rescale = (v: Vec2D, magnitude: number) =>
  scale(v, magnitude / length(v));
// const angle = (v1: Vec2D, v2: Vec2D) =>
//   Math.acos(dotProduct(v1, v2) / (length(v1) * length(v2)));
// const rotate = (v: Vec2D, theta: number) => ({
//   x: v.x * Math.cos(theta) - v.y * Math.sin(theta),
//   y: v.x * Math.sin(theta) + v.y * Math.cos(theta),
// });
export const printVec = (v: Vec2D) =>
  `(${v.x.toExponential(3)}, ${v.y.toExponential(3)})`;
export const toExponential = (v: Vec2D) => ({
  x: v.x.toExponential(3),
  y: v.y.toExponential(3),
});
export const copy = (v: Vec2D) => ({ x: v.x, y: v.y });
