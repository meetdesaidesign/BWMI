#!/usr/bin/env node
/**
 * Reads platform-neutral JSON in /design-system/foundation and writes
 * CSS custom properties + a TypeScript token map.
 * Source of truth: the JSON files. Do not edit generated outputs by hand.
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const foundationDir = join(root, "design-system", "foundation");
const outDir = join(root, "design-system", "generated");

function flatten(value, prefix = "", out = {}) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      if (key === "version" || key === "note" || key === "scale") continue;
      flatten(child, prefix ? `${prefix}.${key}` : key, out);
    }
    return out;
  }
  if (typeof value === "string") out[prefix] = value;
  return out;
}

function kebab(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/\./g, "-")
    .toLowerCase();
}

function camel(key) {
  return kebab(key).replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

const raw = {};
for (const file of readdirSync(foundationDir).filter((name) => name.endsWith(".json")).sort()) {
  const json = JSON.parse(readFileSync(join(foundationDir, file), "utf8"));
  Object.assign(raw, flatten(json));
}

function resolve(value, seen = new Set()) {
  const match = typeof value === "string" && value.match(/^\{([^}]+)\}$/);
  if (!match) return value;
  if (seen.has(match[1])) throw new Error(`Circular token reference: ${match[1]}`);
  seen.add(match[1]);
  if (!(match[1] in raw)) throw new Error(`Missing token: ${match[1]}`);
  return resolve(raw[match[1]], seen);
}

const resolved = {};
for (const [key, value] of Object.entries(raw)) resolved[key] = resolve(value);

mkdirSync(outDir, { recursive: true });

const cssLines = Object.entries(resolved).map(([key, value]) => `  --${kebab(key)}: ${value};`);
const typeRoles = [
  "display-lg",
  "heading-lg",
  "heading-md",
  "heading-sm",
  "body-lg",
  "body-md",
  "label-md",
  "caption",
];
const typeCss = typeRoles.map((role) => {
  const base = `--type-${role}`;
  return `.type-${role} {
  font-family: var(--font-sans);
  font-size: var(${base}-size);
  line-height: var(${base}-line-height);
  font-weight: var(${base}-weight);
  letter-spacing: var(${base}-tracking);
}`;
});

const css = `/* Generated from /design-system/foundation — do not edit by hand. */
:root {
${cssLines.join("\n")}
}

${typeCss.join("\n\n")}
`;

writeFileSync(join(outDir, "tokens.css"), css);

const tsEntries = Object.entries(resolved).map(([key, value]) => `  ${camel(key)}: ${JSON.stringify(value)},`);
const ts = `/* Generated from /design-system/foundation — do not edit by hand. */
export const tokens = {
${tsEntries.join("\n")}
} as const;

export type TokenName = keyof typeof tokens;
`;
writeFileSync(join(outDir, "tokens.ts"), ts);

console.log(`Wrote ${Object.keys(resolved).length} tokens to design-system/generated/`);
