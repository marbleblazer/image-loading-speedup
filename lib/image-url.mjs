/** Pre-generated width + format variants (see npm run images). */
export const IMAGE_WIDTHS = [400, 800, 1600];

export const SLOTS = {
  card: 400,
  hero: 1600,
  detail: 1600,
};

export function variantPath(filename, width, format = "jpg") {
  const base = filename.replace(/\.(jpe?g|webp|avif)$/i, "");
  const ext = format === "jpeg" ? "jpg" : format;
  return `${base}.${width}w.${ext}`;
}

/** CDN host for image files only. Empty means same origin as the HTML. */
export function imageBase() {
  return (process.env.IMAGE_BASE_URL || "").replace(/\/$/, "");
}

function imagePath(filename, width, format) {
  return `${imageBase()}/images/${variantPath(filename, width, format)}`;
}

export function imageUrl(filename, slot, format = "jpg") {
  const width = SLOTS[slot] ?? 800;
  return imagePath(filename, width, format);
}

export function imageSrcset(filename, format = "jpg") {
  return IMAGE_WIDTHS.map(
    (width) => `${imagePath(filename, width, format)} ${width}w`,
  ).join(", ");
}
