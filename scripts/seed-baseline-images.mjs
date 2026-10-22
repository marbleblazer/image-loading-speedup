/**
 * One-time demo assets for the article baseline (devDependency sharp only).
 *
 * Downloads real photos from Wikimedia Commons (free licenses), re-encodes
 * them to oversized 4000x3000 JPEG q98 — intentionally heavy "as-is" sources.
 * Writes public/images/credits.json with attribution for the article.
 *
 * Offline / failed download fallback: synthetic gradient + noise image.
 * Force the fallback for every file with SEED_OFFLINE=1.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "images");

/** Wide master — cards only need ~800px but we ship ~4000px on purpose. */
const WIDTH = 4000;
const HEIGHT = 3000;
const JPEG_QUALITY = 98;

const OFFLINE = process.env.SEED_OFFLINE === "1";

const USER_AGENT =
  "image-loading-speedup-demo/0.1 (selectel blog article demo; contact: academy@selectel.ru)";

const PHOTOS = [
  {
    file: "aurora-lamp.jpg",
    title: "Peacock table lamp (Tiffany Studios), Cleveland Museum of Art",
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Peacock_table_lamp_interior_detail_-_Tiffany_Studios_%2849359190003%29.jpg",
    commonsPage:
      "https://commons.wikimedia.org/wiki/File:Peacock_table_lamp_interior_detail_-_Tiffany_Studios_(49359190003).jpg",
    author: "Tim Evanson (Flickr)",
    license: "CC BY-SA 2.0",
  },
  {
    file: "ceramic-vase.jpg",
    title: "A Ceramic Vase in Kanazawa",
    url: "https://upload.wikimedia.org/wikipedia/commons/1/1f/A_Ceramic_Vase_in_Kanazawa.jpg",
    commonsPage: "https://commons.wikimedia.org/wiki/File:A_Ceramic_Vase_in_Kanazawa.jpg",
    author: "Tbatb (Wikimedia Commons)",
    license: "CC BY-SA 4.0",
  },
  {
    file: "linen-throw.jpg",
    title: "Bed in Seattle hotel (linen bedding detail)",
    url: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Bed_in_Seattle_hotel.jpg",
    commonsPage: "https://commons.wikimedia.org/wiki/File:Bed_in_Seattle_hotel.jpg",
    author: "Liz Lawley (Flickr)",
    license: "CC BY-SA 2.0",
  },
  {
    file: "oak-shelf.jpg",
    title: "Part of a bookshelf containing books by Aristotle (1)",
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Part_of_a_bookshelf_containing_books_by_Aristotle_%281%29.jpg",
    commonsPage:
      "https://commons.wikimedia.org/wiki/File:Part_of_a_bookshelf_containing_books_by_Aristotle_(1).jpg",
    author: "Roman Eisele (Wikimedia Commons)",
    license: "CC BY-SA 4.0",
  },
  {
    file: "studio-chair.jpg",
    title: "Club chair, Jean-Michel Frank, 1939, Cooper-Hewitt Design Museum",
    url: "https://upload.wikimedia.org/wikipedia/commons/1/11/Club_chair_-_Jean-Michel_Frank_%2839609645132%29.jpg",
    commonsPage:
      "https://commons.wikimedia.org/wiki/File:Club_chair_-_Jean-Michel_Frank_(39609645132).jpg",
    author: "Tim Evanson (Flickr)",
    license: "CC BY-SA 2.0",
  },
  {
    file: "glass-teapot.jpg",
    title: "Teapot and cup at café Fly Fusion, Helsinki",
    url: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Teapot_and_cup_at_caf%C3%A9_Fly_Fusion.jpg",
    commonsPage:
      "https://commons.wikimedia.org/wiki/File:Teapot_and_cup_at_caf%C3%A9_Fly_Fusion.jpg",
    author: "JIP (Wikimedia Commons)",
    license: "CC BY-SA 4.0",
  },
];

async function download(url) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

function gradientSvg(hue) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:hsl(${hue}, 55%, 72%)"/>
        <stop offset="100%" style="stop-color:hsl(${(hue + 40) % 360}, 45%, 38%)"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
      font-family="system-ui,sans-serif" font-size="120" fill="rgba(255,255,255,0.35)">
      baseline JPEG
    </text>
  </svg>`;
}

/** Synthetic fallback so the demo works offline. */
async function syntheticImage(hue) {
  const noise = await sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 3,
      background: { r: 128, g: 128, b: 128 },
      noise: { type: "gaussian", mean: 128, sigma: 55 },
    },
  })
    .png()
    .toBuffer();

  return sharp(noise).composite([
    { input: Buffer.from(gradientSvg(hue)), blend: "overlay" },
  ]);
}

await mkdir(outDir, { recursive: true });

const credits = [];

let index = 0;
for (const photo of PHOTOS) {
  const hue = (index * 47) % 360;
  let pipeline = null;
  let source = null;

  if (OFFLINE) {
    console.warn(`WARN: ${photo.file}: SEED_OFFLINE=1 — using synthetic fallback`);
  } else {
    try {
      const buffer = await download(photo.url);
      pipeline = sharp(buffer);
      source = photo.commonsPage;
      console.log(`Downloaded ${photo.file} from Wikimedia Commons`);
    } catch (err) {
      console.warn(`WARN: ${photo.file}: ${err.message} — using synthetic fallback`);
    }
  }

  if (!pipeline) {
    pipeline = await syntheticImage(hue);
  }

  const buffer = await pipeline
    .resize(WIDTH, HEIGHT, { fit: "cover", kernel: "lanczos3" })
    .jpeg({ quality: JPEG_QUALITY, chromaSubsampling: "4:4:4" })
    .toBuffer();

  const dest = path.join(outDir, photo.file);
  await writeFile(dest, buffer);
  const kb = Math.round(buffer.length / 1024);
  console.log(`Wrote ${photo.file} (~${kb} KiB)`);

  credits.push({
    file: photo.file,
    title: photo.title,
    source,
    author: source ? photo.author : "synthetic fallback (not used in the article)",
    license: source ? photo.license : "n/a",
    note: "Re-encoded to 4000x3000 JPEG q98 for the demo",
  });
  index += 1;
}

await writeFile(
  path.join(outDir, "credits.json"),
  JSON.stringify(credits, null, 2) + "\n",
);

console.log("\nDone. Start the server with: npm start");
