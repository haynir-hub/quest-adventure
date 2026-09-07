import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { VitePWA } from "vite-plugin-pwa";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const mapLibreDist = join(dirname(require.resolve("maplibre-gl/package.json")), "dist");

const mapLibreWorkerAssets = () => ({
  name: "maplibre-worker-assets",
  generateBundle(this: { emitFile: (asset: { type: "asset"; fileName: string; source: string }) => void }) {
    const shared = readFileSync(join(mapLibreDist, "maplibre-gl-shared.mjs"), "utf8");
    const worker = readFileSync(join(mapLibreDist, "maplibre-gl-worker.mjs"), "utf8")
      .replace("./maplibre-gl-shared.mjs", "./maplibre-gl-shared.js");
    this.emitFile({ type: "asset", fileName: "assets/maplibre-gl-shared.js", source: shared });
    this.emitFile({ type: "asset", fileName: "assets/maplibre-gl-worker.js", source: worker });
  },
});

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // **ברירת המחדל היא הכתובת שבה האתר באמת מוגש: /quest/.**
  //
  // עד 29.8 ברירת המחדל בבילד הייתה "/quest-adventure/" - שם התיקייה על
  // השרת, לא הנתיב הציבורי. nginx עושה alias מ-/quest/ לתיקייה הזאת, ולכן
  // `npm run build` נקי ייצר index.html שמצביע ל-/quest-adventure/assets/,
  // וכל האתר החזיר דף לבן. DEPLOY.md כבר אמר במפורש "base חייב להיות
  // /quest/", אבל הקוד אמר אחרת - וההוראה שנמצאת רק בתיעוד היא הוראה
  // שמישהו ידלג עליה. **קרה בפועל ב-29.8** בדיוק ככה, בדיפלוי של שבעת
  // הסרטונים החדשים. עכשיו הפעולה הבטוחה היא ברירת המחדל.
  base:
    process.env.VITE_BASE_PATH ??
    (command === "build" ? "/quest/" : "/"),
  plugins: [
    react(),
    basicSsl(),
    mapLibreWorkerAssets(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
        type: "module",
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Quest Adventure",
        short_name: "Quest",
        theme_color: "#1E3A5F",
        background_color: "#0F172A",
        display: "standalone",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024, // 20 MiB — accommodates very large untracked character PNGs (poppy-playtime)
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.pathname.includes("/src/worlds/") ||
              url.pathname.includes("assets/"),
            handler: "CacheFirst",
            options: {
              cacheName: "worlds-assets-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
}));
