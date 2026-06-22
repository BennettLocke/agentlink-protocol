#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`${relativePath}: file is missing`);
  }
  return fs.readFileSync(filePath, "utf8");
}

function requireIncludes(label, content, values) {
  const missing = values.filter((value) => !content.includes(value));
  if (missing.length > 0) {
    throw new Error(`${label}: missing required content\n${missing.map((value) => `  - ${value}`).join("\n")}`);
  }
}

try {
  const readme = read("README.md");
  const quickstart = read("docs/developer-quickstart.md");
  const compatibilityMatrix = read("docs/compatibility-matrix.md");
  const connectorBoundary = read("docs/connector-boundary.md");

  requireIncludes("README.md", readme, [
    "docs/developer-quickstart.md",
    "docs/compatibility-matrix.md",
    "docs/connector-boundary.md",
    "3 minutes",
    "5 minutes",
    "10 minutes"
  ]);

  requireIncludes("docs/developer-quickstart.md", quickstart, [
    "# AgentLink Developer Quickstart",
    "3 minutes",
    "5 minutes",
    "10 minutes",
    "npm test",
    "npm run example:js",
    "npm run example:openclaw",
    "Compatible with AgentLink Protocol v0.2 Level 2",
    "Implements AgentLink security/key-system v0.3 Level 4",
    "docs/compatibility-matrix.md",
    "AgentLink Cloud",
    "private product code",
    "docs/connector-boundary.md"
  ]);

  requireIncludes("docs/compatibility-matrix.md", compatibilityMatrix, [
    "# AgentLink Compatibility Matrix",
    "Client or desktop app",
    "Relay server",
    "Agent connector",
    "SDK or library",
    "Level 0",
    "Level 1",
    "Level 2",
    "Level 3",
    "Level 4",
    "Level 5",
    "Evidence required",
    "Must not claim",
    "docs/compatibility-checklist.md",
    "docs/connector-boundary.md"
  ]);

  requireIncludes("docs/connector-boundary.md", connectorBoundary, [
    "# AgentLink Connector Boundary",
    "Allowed in public connector examples",
    "Not allowed in public connector examples",
    "local-only mock",
    "production tokens",
    "private endpoints",
    "database credentials",
    "commercial connector internals",
    "OpenClaw",
    "AgentLink Cloud",
    "private product code"
  ]);

  console.log("AgentLink protocol docs validated: developer quickstart, compatibility matrix, and connector boundary are linked and complete.");
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
