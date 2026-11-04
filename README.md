# Image loading speedup (baseline)

Учебный мини-каталог для статьи: сначала «как обычно» (тяжёлые JPEG, простой `<img>`), дальше — рефакторинг (sharp, WebP/AVIF, адаптивная разметка, CDN).

## Быстрый старт

```bash
npm install
npm run seed    # тяжёлые исходники в public/images/
npm run images  # варианты 400w / 800w / 1600w (sharp)
npm start
```

`sharp` — в `dependencies`, используется `seed` и `npm run images`.

Каркас статьи, таблица метрик и порядок коммитов: [docs/article-structure.md](docs/article-structure.md).

После фиксации baseline на `main` можно повесить тег `v0-baseline` для скриншотов «до».

## Файлы

- `data/items.json` — каталог
- `server.js` — `/`, `/item/:id`
- `views/` — EJS
- `scripts/seed-baseline-images.mjs` — исходники
- `scripts/generate-images.mjs` — `npm run images`
- `lib/image-url.mjs` — путь к варианту по слоту (card / hero / detail)

## Лицензии фото

`npm run seed` качает фото с Wikimedia Commons (CC BY-SA) и перекодирует в тяжёлый JPEG. Атрибуция для статьи — `public/images/credits.json`. Без сети — синтетические заглушки; принудительно: `SEED_OFFLINE=1 npm run seed`.
