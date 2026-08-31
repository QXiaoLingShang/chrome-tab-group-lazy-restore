/** Build the extension in either a debuggable development mode or a release mode. */
import { execFile } from "node:child_process";
import { build } from "esbuild";
import { mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = resolve(projectRoot, "dist");
const mode = process.argv[2] ?? "dev";

if (mode !== "dev" && mode !== "release") {
  throw new Error(`Unknown build mode: ${mode}`);
}

const isRelease = mode === "release";
const execFileAsync = promisify(execFile);

// Always start from a clean output directory so stale maps or type-only files cannot ship.
await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

if (!isRelease) {
  // Keep the source module layout intact so browser debugging maps to real files.
  await execFileAsync(process.execPath, [
    resolve(projectRoot, "node_modules/typescript/bin/tsc"),
    "--project",
    resolve(projectRoot, "tsconfig.dev.json")
  ], { cwd: projectRoot, stdio: "inherit" });
  process.exit(0);
}

await build({
  entryPoints: [
    resolve(projectRoot, "src/background.ts"),
    resolve(projectRoot, "src/options.ts")
  ],
  outdir: outputDirectory,
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  minify: true,
  sourcemap: false,
  sourcesContent: false,
  legalComments: "none",
  logLevel: "info"
});
