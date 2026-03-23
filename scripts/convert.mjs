#!/usr/bin/env node
/**
 * Local ICO → JPEG/PNG converter.
 *
 * Usage:
 *   node scripts/convert.mjs <input.ico> [output.png|output.jpg]
 *   node scripts/convert.mjs file1.ico file2.ico ...   (batch – PNG saved next to each source)
 *
 * Or via npm:
 *   npm run convert -- icon.ico
 *   npm run convert -- icon.ico output.jpg
 */

import { existsSync } from "fs";
import { extname, basename, dirname, join } from "path";

let sharp;
try {
  ({ default: sharp } = await import("sharp"));
} catch {
  console.error("Error: 'sharp' module not found. Run `npm install` first.");
  process.exit(1);
}

const SUPPORTED_INPUT = new Set([".ico"]);
const SUPPORTED_OUTPUT = new Set([".png", ".jpg", ".jpeg"]);

function toOutputPath(inputPath, ext = ".png") {
  const dir = dirname(inputPath);
  const name = basename(inputPath, extname(inputPath));
  return join(dir, `${name}${ext}`);
}

async function convertFile(inputPath, outputPath) {
  if (!existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }
  const ext = extname(inputPath).toLowerCase();
  if (!SUPPORTED_INPUT.has(ext)) {
    throw new Error(`Unsupported input file type "${ext}". Only .ico is accepted.`);
  }

  let dest = outputPath ?? toOutputPath(inputPath, ".png");
  const outExt = extname(dest).toLowerCase();
  if (!SUPPORTED_OUTPUT.has(outExt)) {
    throw new Error(`Unsupported output file type "${outExt}". Use .png, .jpg, or .jpeg.`);
  }

  const s = sharp(inputPath);
  if (outExt === ".png") {
    await s.png().toFile(dest);
  } else {
    await s.jpeg({ quality: 92 }).toFile(dest);
  }
  return dest;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(
      [
        "Usage:",
        "  node scripts/convert.mjs <input.ico> [output.png|output.jpg]",
        "  node scripts/convert.mjs file1.ico file2.ico ...",
        "",
        "If the output path is omitted the PNG is saved alongside the source file.",
        "Specify a .jpg/.jpeg extension to convert to JPEG instead.",
      ].join("\n")
    );
    process.exit(0);
  }

  // Two-argument form: node convert.mjs input.ico output.png|jpg
  if (
    args.length === 2 &&
    SUPPORTED_INPUT.has(extname(args[0]).toLowerCase()) &&
    SUPPORTED_OUTPUT.has(extname(args[1]).toLowerCase())
  ) {
    try {
      const dest = await convertFile(args[0], args[1]);
      console.log(`✓  ${args[0]}  →  ${dest}`);
    } catch (err) {
      console.error(`✗  ${err.message}`);
      process.exit(1);
    }
    return;
  }

  // Batch form: one or more input files, output PNG next to each
  let hasError = false;
  for (const inputPath of args) {
    try {
      const dest = await convertFile(inputPath);
      console.log(`✓  ${inputPath}  →  ${dest}`);
    } catch (err) {
      console.error(`✗  ${inputPath}: ${err.message}`);
      hasError = true;
    }
  }
  if (hasError) process.exit(1);
}

main();
