import { build } from "esbuild";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = fileURLToPath(new URL(".", import.meta.url));
const distDir = path.join(appDir, "dist");
await mkdir(distDir, { recursive: true });
await build({
  entryPoints: [path.join(appDir, "src/main.ts")],
  bundle: true,
  outfile: path.join(distDir, "main.js"),
  platform: "browser",
  format: "cjs",
  target: "es2022",
  external: ["obsidian", "electron", "node:*", "@codemirror/*"],
  jsx: "automatic",
  sourcemap: false,
  logLevel: "info"
});
await copyFile(path.join(appDir, "manifest.json"), path.join(distDir, "manifest.json"));
await copyFile(path.join(appDir, "styles.css"), path.join(distDir, "styles.css"));
