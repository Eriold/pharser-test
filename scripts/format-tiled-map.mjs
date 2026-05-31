import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const workspaceRoot = process.cwd();
const indentUnit = "  ";

async function collectTargetFiles(inputArgs) {
  if (inputArgs.length > 0) {
    return inputArgs.map(file => path.resolve(workspaceRoot, file));
  }

  return collectMapFiles(workspaceRoot);
}

async function collectMapFiles(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      const nestedFiles = await collectMapFiles(fullPath);
      files.push(...nestedFiles);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".map.json")) {
      files.push(fullPath);
    }
  }

  return files;
}

function indent(level) {
  return indentUnit.repeat(level);
}

function formatValue(value, level = 0, key = "", parent = null) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return formatArray(value, level, key, parent);
  }

  return formatObject(value, level);
}

function formatArray(items, level, key, parent) {
  if (items.length === 0) {
    return "[]";
  }

  if (key === "data" && parent && Number.isInteger(parent.width)) {
    return formatTileData(items, level, parent.width);
  }

  const lines = items.map(item => `${indent(level + 1)}${formatValue(item, level + 1)}`);
  return `[\n${lines.join(",\n")}\n${indent(level)}]`;
}

function formatTileData(items, level, rowWidth) {
  const rows = [];

  for (let index = 0; index < items.length; index += rowWidth) {
    const row = items.slice(index, index + rowWidth);
    rows.push(`${indent(level + 1)}${row.map(item => JSON.stringify(item)).join(", ")}`);
  }

  return `[\n${rows.join(",\n")}\n${indent(level)}]`;
}

function formatObject(object, level) {
  const entries = Object.entries(object);

  if (entries.length === 0) {
    return "{}";
  }

  const lines = entries.map(([entryKey, entryValue]) => {
    return `${indent(level + 1)}${JSON.stringify(entryKey)}: ${formatValue(entryValue, level + 1, entryKey, object)}`;
  });

  return `{\n${lines.join(",\n")}\n${indent(level)}}`;
}

async function formatFile(filePath) {
  const fileStats = await stat(filePath);

  if (!fileStats.isFile()) {
    return;
  }

  const rawContent = await readFile(filePath, "utf8");
  const parsed = JSON.parse(rawContent);
  const formatted = `${formatValue(parsed)}\n`;

  if (formatted !== rawContent) {
    await writeFile(filePath, formatted, "utf8");
  }
}

const targetFiles = await collectTargetFiles(process.argv.slice(2));

for (const filePath of targetFiles) {
  await formatFile(filePath);
  process.stdout.write(`formatted ${path.relative(workspaceRoot, filePath)}\n`);
}
