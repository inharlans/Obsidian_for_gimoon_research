import { cp, mkdir } from "node:fs/promises";
import path from "node:path";

const source = path.resolve("apps/obsidian-plugin/dist");
const target = path.resolve("vault/PaperKG/.obsidian/plugins/paperkg");
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true, force: true });
console.log(`Installed PaperKG plugin to ${target}`);

