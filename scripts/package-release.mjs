/** Create a minimal, cross-platform Chrome extension archive for GitHub Releases. */
import { createWriteStream } from "node:fs";
import { mkdir, readFile, readdir, rm } from "node:fs/promises";
import { ZipArchive } from "archiver";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(
  await readFile(join(projectRoot, "package.json"), "utf8")
);
const manifest = JSON.parse(
  await readFile(join(projectRoot, "manifest.json"), "utf8")
);

if (packageJson.version !== manifest.version) {
  throw new Error("package.json and manifest.json versions do not match.");
}

const outputDirectory = join(projectRoot, "release");
const archivePath = join(
  outputDirectory,
  `tab-group-lazy-restore-v${packageJson.version}.zip`
);
const requiredFiles = [
  ["manifest.json", "manifest.json"],
  ["options.html", "options.html"],
  ["dist/background.js", "dist/background.js"],
  ["dist/options.js", "dist/options.js"]
];

for (const [relativePath] of requiredFiles) {
  try {
    await readFile(join(projectRoot, relativePath));
  } catch {
    throw new Error(`Required release file is missing: ${relativePath}`);
  }
}

const distFiles = await readdir(join(projectRoot, "dist"));
const forbiddenDistFiles = distFiles.filter(
  (file) => file.endsWith(".map") || file === "types.js"
);
if (forbiddenDistFiles.length > 0) {
  throw new Error(
    `Release build contains forbidden files: ${forbiddenDistFiles.join(", ")}`
  );
}

await mkdir(outputDirectory, { recursive: true });
await rm(archivePath, { force: true });

const output = createWriteStream(archivePath);
const archive = new ZipArchive({ zlib: { level: 9 } });
const completion = new Promise((resolveCompletion, rejectCompletion) => {
  output.on("close", resolveCompletion);
  output.on("error", rejectCompletion);
  archive.on("error", rejectCompletion);
});

archive.pipe(output);
for (const [relativePath, archivePathname] of requiredFiles) {
  archive.file(join(projectRoot, relativePath), { name: archivePathname });
}
archive.directory(join(projectRoot, "icons"), "icons");

await archive.finalize();
await completion;

console.log(`Created ${archivePath}`);
