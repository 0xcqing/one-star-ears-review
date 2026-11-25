import { mkdirSync, writeFileSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "Ears: no off switch, no mute button, and a lifetime subscription to every conversation I did not want.";
const MAX_CHARS = 160;
const MAX_BYTES = 160;

function fail(reason: string): never {
  console.error(`main.ts: ${reason}`);
  process.exit(1);
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const entryPath = join(outputDir, "entry.txt");

const charCount = [...LINE].length;
const byteCount = Buffer.byteLength(LINE, "utf8");

if (LINE.trim().length === 0) fail("the review line is empty after trim");
if (/[\r\n]/.test(LINE)) fail("the review line contains a newline");
if (charCount < 1 || charCount > MAX_CHARS) {
  fail(`the review line has ${charCount} characters; expected 1..${MAX_CHARS}`);
}
if (byteCount < 1 || byteCount > MAX_BYTES) {
  fail(`the review line has ${byteCount} bytes; expected 1..${MAX_BYTES}`);
}

mkdirSync(outputDir, { recursive: true });

const payload = `${LINE}\n`;
const expected = Buffer.from(payload, "utf8");

writeFileSync(entryPath, expected, { mode: 0o644 });

const actual = readFileSync(entryPath);
const actualText = actual.toString("utf8");
if (actual.length !== expected.length) {
  fail(
    `${entryPath} is ${actual.length} bytes on disk; expected ${expected.length} (the ${byteCount}-byte line plus one LF)`,
  );
}
if (actualText !== payload) {
  fail(`${entryPath} does not read back as the exact review line plus one trailing LF`);
}
if (!actual.equals(expected)) {
  fail(`${entryPath} bytes differ from the UTF-8 encoding of the review line plus one LF`);
}
if (actual[actual.length - 1] !== 0x0a) {
  fail(`${entryPath} does not end with exactly one LF`);
}

console.log(`wrote ${entryPath}`);
console.log(`characters: ${charCount}`);
console.log(`bytes: ${byteCount}`);
console.log(`file size: ${statSync(entryPath).size}`);
console.log(LINE);
