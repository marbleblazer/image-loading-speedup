import express from "express";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const itemsPath = path.join(__dirname, "data", "items.json");

async function loadItems() {
  const raw = await readFile(itemsPath, "utf8");
  return JSON.parse(raw);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (_req, res, next) => {
  try {
    const items = await loadItems();
    res.render("index", {
      title: "Каталог — baseline",
      items,
      heroImage: items[0]?.image,
    });
  } catch (err) {
    next(err);
  }
});

app.get("/item/:id", async (req, res, next) => {
  try {
    const items = await loadItems();
    const item = items.find((entry) => entry.id === req.params.id);
    if (!item) {
      res.status(404).render("not-found", { title: "Не найдено" });
      return;
    }
    res.render("item", { title: item.title, item });
  } catch (err) {
    next(err);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
