#!/usr/bin/env node
const { spawnSync } = require("child_process");
const { familySync, MUSL } = require("detect-libc");

const { platform, arch } = process;

const packageMapping = {
  "darwin-x64": "@lampstand-labs/mobiterm-darwin-x64",
  "darwin-arm64": "@lampstand-labs/mobiterm-darwin-arm64",
  "linux-x64-gnu": "@lampstand-labs/mobiterm-linux-x64-gnu",
  "linux-x64-musl": "@lampstand-labs/mobiterm-linux-x64-musl",
  "linux-arm64-gnu": "@lampstand-labs/mobiterm-linux-arm64-gnu",
  "linux-arm64-musl": "@lampstand-labs/mobiterm-linux-arm64-musl",
};

const libc = familySync() === MUSL ? "musl" : "gnu";
const key =
  platform === "linux" ? `${platform}-${arch}-${libc}` : `${platform}-${arch}`;
const targetPackage = packageMapping[key];

if (!targetPackage) {
  console.error(`Error: Unsupported architecture combination: ${key}`);
  process.exit(1);
}

try {
  const binaryPath = require.resolve(`${targetPackage}/bin/mobiterm`);
  const result = spawnSync(binaryPath, process.argv.slice(2), {
    stdio: "inherit",
  });
  process.exit(result.status);
} catch {
  console.error(`Error: Failed to execute native binary for ${targetPackage}.`);
  process.exit(1);
}
