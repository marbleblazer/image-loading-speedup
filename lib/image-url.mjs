/** Article demo: pick a pre-generated width variant (see npm run images). */
export const IMAGE_WIDTHS = [400, 800, 1600];

export const SLOTS = {
  card: 400,
  hero: 1600,
  detail: 1600,
};

export function variantPath(filename, width) {
  const base = filename.replace(/\.jpe?g$/i, "");
  return `${base}.${width}w.jpg`;
}

export function imageUrl(filename, slot) {
  const width = SLOTS[slot] ?? 800;
  return `/images/${variantPath(filename, width)}`;
}
