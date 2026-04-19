export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;

export type Point2 = { x: number; z: number };

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function snap(n: number, step: number): number {
  return Math.round(n / step) * step;
}

export function normalizeAngle(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

// Rotation convention matches Three.js mesh.rotation.y:
// a point at local (0, 1) with angle θ maps to world (sin θ, cos θ).
// i.e. positive angle rotates local +z toward world +x (viewed from +y down).
export function rotatePoint(p: Point2, angleDeg: number): Point2 {
  const r = angleDeg * DEG2RAD;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return { x: p.x * c + p.z * s, z: -p.x * s + p.z * c };
}

export function localToWorld(
  local: Point2,
  origin: Point2,
  angleDeg: number,
): Point2 {
  const r = rotatePoint(local, angleDeg);
  return { x: r.x + origin.x, z: r.z + origin.z };
}

export function worldToLocal(
  world: Point2,
  origin: Point2,
  angleDeg: number,
): Point2 {
  const dx = world.x - origin.x;
  const dz = world.z - origin.z;
  return rotatePoint({ x: dx, z: dz }, -angleDeg);
}

export type OrientedRect = {
  x: number;
  z: number;
  width: number;
  length: number;
  rotation: number;
};

export function rectCorners(r: OrientedRect): Point2[] {
  const hw = r.width / 2;
  const hl = r.length / 2;
  const locals: Point2[] = [
    { x: -hw, z: -hl },
    { x: hw, z: -hl },
    { x: hw, z: hl },
    { x: -hw, z: hl },
  ];
  return locals.map((p) => localToWorld(p, { x: r.x, z: r.z }, r.rotation));
}

function projectOnto(corners: Point2[], axis: Point2): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const p of corners) {
    const proj = p.x * axis.x + p.z * axis.z;
    if (proj < min) min = proj;
    if (proj > max) max = proj;
  }
  return { min, max };
}

function rectAxes(r: OrientedRect): [Point2, Point2] {
  const rad = r.rotation * DEG2RAD;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [
    { x: c, z: -s },
    { x: s, z: c },
  ];
}

export function rectsOverlap(a: OrientedRect, b: OrientedRect): boolean {
  const ca = rectCorners(a);
  const cb = rectCorners(b);
  const axes: Point2[] = [...rectAxes(a), ...rectAxes(b)];
  for (const axis of axes) {
    const pa = projectOnto(ca, axis);
    const pb = projectOnto(cb, axis);
    if (pa.max < pb.min || pb.max < pa.min) return false;
  }
  return true;
}

export function pointInRect(p: Point2, r: OrientedRect): boolean {
  const local = worldToLocal(p, { x: r.x, z: r.z }, r.rotation);
  return (
    Math.abs(local.x) <= r.width / 2 + 1e-6 &&
    Math.abs(local.z) <= r.length / 2 + 1e-6
  );
}

export function lineLocal(
  world: Point2,
  line: { x: number; z: number; rotation: number },
): Point2 {
  return worldToLocal(world, { x: line.x, z: line.z }, line.rotation);
}
