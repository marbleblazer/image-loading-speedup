/**
 * Resize + export JPEG / WebP / AVIF variants (article: formats + <picture>).
 * Reads full-size *.jpg in public/images/ (from npm run seed).
 */
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { IMAGE_WIDTHS, variantPath } from "../lib/image-url.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, "..", "public", "images");

const JPEG_QUALITY = 82;
const WEBP_QUALITY = 80;
const AVIF_QUALITY = 50;

const VARIANT_RE = /\.\d+w\.(jpe?g|webp|avif)$/i;

const FORMATS = ["jpg", "webp", "avif"];

async function sourceFiles() {
  const names = await readdir(imagesDir);
  return names.filter(
    (name) =>
      /\.jpe?g$/i.test(name) &&
      !VARIANT_RE.test(name) &&
      name !== "credits.json",
  );
}

function encode(pipeline, format) {
  if (format === "webp") return pipeline.webp({ quality: WEBP_QUALITY });
  if (format === "avif") return pipeline.avif({ quality: AVIF_QUALITY });
  return pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
}

const sources = await sourceFiles();
if (sources.length === 0) {
  console.error("No source JPEGs in public/images/. Run: npm run seed");
  process.exit(1);
}

for (const file of sources) {
  const input = path.join(imagesDir, file);
  for (const width of IMAGE_WIDTHS) {
    for (const format of FORMATS) {
      const outName = variantPath(file, width, format);
      const info = await encode(
        sharp(input).resize(width, null, {
          withoutEnlargement: true,
          kernel: "lanczos3",
        }),
        format,
      ).toFile(path.join(imagesDir, outName));

      const kb = Math.round(info.size / 1024);
      console.log(`${outName}  ${info.width}×${info.height}  ~${kb} KiB`);
    }
  }
}

console.log("\nDone. Reload the site (variants served from public/images/).");
