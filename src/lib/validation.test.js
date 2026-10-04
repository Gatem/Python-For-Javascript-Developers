import { describe, it, expect } from "vitest";
import { stripPython, validateCode, has } from "./validation";

describe("stripPython", () => {
  it("removes comments but keeps strings", () => {
    expect(stripPython('x = "a # b"  # note')).toBe('x = "a # b"  ');
  });
  it("blanks string contents when asked", () => {
    expect(stripPython('print("null && true")', { strings: true })).toBe('print("' + " ".repeat(12) + '")');
  });
  it("handles triple-quoted strings", () => {
    expect(stripPython('s = """a\n# not comment\n"""\n# c', { strings: true })).toBe('s = """ \n             \n"""\n');
  });
});

describe("validateCode", () => {
  const checks = (code) => [has(code, /first_name\s*=/, "define first_name")];
  it("does not accept an answer written only in a comment", () => {
    const r = validateCode('# first_name = "John"\nprint(1)', checks);
    expect(r.pass).toBe(false);
  });
  it("flags JS habits outside strings only", () => {
    expect(validateCode('print("null")', checks).errors.map((e) => e.msg)).toEqual(["define first_name"]);
    expect(validateCode("first_name = null", checks).pass).toBe(false);
  });
  it("passes valid code", () => {
    expect(validateCode('first_name = "John"', checks).pass).toBe(true);
  });
  it("does not flag >= or <= as arrow functions", () => {
    expect(validateCode("first_name = 1\nif first_name >= 1: pass", checks).pass).toBe(true);
  });
});
