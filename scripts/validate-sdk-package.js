#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const sdkDir = path.join(root, "sdk", "javascript");
const packagePath = path.join(sdkDir, "package.json");
const readmePath = path.join(sdkDir, "README.md");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
  });

  return {
    status: result.status,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    error: result.error,
  };
}

function runNpm(args) {
  if (process.platform === "win32") {
    return run("cmd.exe", ["/d", "/s", "/c", "npm", ...args]);
  }
  return run("npm", args);
}

try {
  assert(fs.existsSync(packagePath), "sdk/javascript/package.json is missing");
  assert(fs.existsSync(readmePath), "sdk/javascript/README.md is missing");

  const pkg = readJson(packagePath);
  assert(pkg.name === "@agentlink/protocol-sdk", "SDK package name must be @agentlink/protocol-sdk");
  assert(pkg.version === "0.3.0-draft.0", "SDK package version must be 0.3.0-draft.0");
  assert(pkg.license === "Apache-2.0", "SDK package must use Apache-2.0");
  assert(pkg.type === "commonjs", "SDK package must declare commonjs");
  assert(pkg.main === "./agentlink.js", "SDK package main must point to ./agentlink.js");
  assert(pkg.exports && pkg.exports["."] === "./agentlink.js", "SDK package must export ./agentlink.js");
  assert(Array.isArray(pkg.files), "SDK package must use an explicit files whitelist");
  for (const requiredFile of ["agentlink.js", "README.md", "examples/"]) {
    assert(pkg.files.includes(requiredFile), `SDK package files must include ${requiredFile}`);
  }
  assert(pkg.private !== true, "SDK package must not be private so dry-run packaging mirrors publish shape");
  assert(!pkg.dependencies, "SDK package must stay dependency-free");
  assert(!pkg.devDependencies, "SDK package must not publish devDependencies");

  const readme = fs.readFileSync(readmePath, "utf8");
  for (const snippet of [
    "@agentlink/protocol-sdk",
    "npm run pack:sdk:js",
    "not published to npm yet",
    "dependency-free",
  ]) {
    assert(readme.includes(snippet), `sdk/javascript/README.md must mention ${snippet}`);
  }

  const pack = runNpm(["pack", "--dry-run", "--json", "./sdk/javascript"]);
  if (pack.status !== 0) {
    throw new Error([
      "npm pack dry-run failed",
      pack.error ? pack.error.message : "",
      pack.stdout,
      pack.stderr,
    ].filter(Boolean).join("\n"));
  }

  const payload = JSON.parse(pack.stdout);
  const manifest = Array.isArray(payload) ? payload[0] : payload;
  assert(manifest && manifest.name === "@agentlink/protocol-sdk", "dry-run pack must report SDK package name");
  assert(manifest.version === "0.3.0-draft.0", "dry-run pack must report SDK package version");
  const files = (manifest.files || []).map((file) => file.path).sort();
  for (const expected of [
    "agentlink.js",
    "README.md",
    "package.json",
    "examples/send-message.js",
    "examples/openclaw-connector.js",
  ]) {
    assert(files.includes(expected), `dry-run package is missing ${expected}`);
  }
  assert(!files.some((file) => file.includes("agentlink.test.js")), "dry-run package must not include SDK tests");

  console.log(JSON.stringify({
    ok: true,
    message: "AgentLink JavaScript SDK package dry-run ok",
    package: {
      name: manifest.name,
      version: manifest.version,
      files: files.length,
      unpackedSize: manifest.unpackedSize,
    },
  }, null, 2));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
