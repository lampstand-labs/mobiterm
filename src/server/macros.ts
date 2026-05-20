import { spawnSync } from "bun";
import { readFileSync } from "node:fs";

function buildEsmBundle(entrypoint: string, externals: string[] = []): string {
  const args = ["bun", "build", entrypoint, "--format=esm", "--target=browser"];
  for (const ext of externals) args.push("--external=" + ext);
  const result = spawnSync([...args, "--outfile=/dev/stdout"]);
  if (result.exitCode !== 0) throw new Error(result.stderr.toString());
  return result.stdout.toString();
}

function buildFrontendBundle(): { js: string; css: string } {
  const entry = new URL("../client/frontend.tsx", import.meta.url).pathname;
  const outdir =
    "/tmp/opencode/mobiterm-build/" + Math.random().toString(36).slice(2);
  const externals = [
    "react",
    "react-dom",
    "react-dom/client",
    "react/jsx-runtime",
    "react/jsx-dev-runtime",
  ];
  const result = spawnSync([
    "bun",
    "build",
    entry,
    "--format=esm",
    "--target=browser",
    "--outdir",
    outdir,
    ...externals.map((e) => "--external=" + e),
  ]);
  if (result.exitCode !== 0) throw new Error(result.stderr.toString());
  return {
    js: readFileSync(outdir + "/frontend.js", "utf-8"),
    css: readFileSync(outdir + "/frontend.css", "utf-8"),
  };
}

export function bundleVendorEsm(cjsEntrypoint: string): string {
  return buildEsmBundle(cjsEntrypoint);
}

let _frontend: { js: string; css: string } | null = null;

export function frontendJs(): string {
  if (!_frontend) _frontend = buildFrontendBundle();
  return _frontend.js;
}

export function frontendCss(): string {
  if (!_frontend) _frontend = buildFrontendBundle();
  return _frontend.css;
}

export function sharedUiBundle(): string {
  const entry = new URL("../client/shared-ui.ts", import.meta.url).pathname;
  return buildEsmBundle(entry, [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "react/jsx-dev-runtime",
  ]);
}
