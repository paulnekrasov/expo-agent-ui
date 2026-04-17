import { describe, expect, it, jest } from "@jest/globals";
import fs from "node:fs";
import path from "node:path";

import { parseSwiftFile } from "../../src/parser";

const FIXTURE_DIR = path.resolve(
  __dirname,
  "..",
  "fixtures",
  "parser"
);

const FIXTURE_NAMES = [
  "stacks-content",
  "navigation",
  "lists",
  "forms",
  "scroll",
  "modifiers",
] as const;

function readFixture(fileName: string): string {
  return fs.readFileSync(path.join(FIXTURE_DIR, fileName), "utf8");
}

function normalizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeValue(entry));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== "id" && key !== "sourceRange")
        .map(([key, entry]) => [key, normalizeValue(entry)])
    );
  }

  return value;
}

describe("parser fixture regression coverage", () => {
  jest.setTimeout(30000);

  it.each(FIXTURE_NAMES)(
    "matches the expected IR fixture for %s.swift",
    async (fixtureName) => {
      const source = readFixture(`${fixtureName}.swift`);
      const expected = JSON.parse(
        readFixture(`${fixtureName}.json`)
      ) as unknown;

      const roots = await parseSwiftFile(source);

      expect(normalizeValue(roots)).toEqual(expected);
    }
  );
});
