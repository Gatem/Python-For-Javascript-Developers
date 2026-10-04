import { describe, it, expect } from "vitest";
import { tokenize, highlightLines, guessLang } from "./highlight";
import { courseModules } from "../data";

const join = (tokens) => tokens.map((t) => t.text).join("");

describe("highlight", () => {
  it("never changes the text (round-trips every course snippet)", () => {
    for (const m of courseModules) {
      for (const l of m.lessons) {
        expect(join(tokenize(l.pyCode, "py"))).toBe(l.pyCode);
        expect(join(tokenize(l.jsCode, "js"))).toBe(l.jsCode);
        expect(join(tokenize(l.exercise.answer, "py"))).toBe(l.exercise.answer);
        const lines = highlightLines(l.pyCode, "py");
        expect(lines.length).toBe(l.pyCode.split("\n").length);
        expect(lines.map((ln) => ln.map((t) => t.text).join("")).join("\n")).toBe(l.pyCode);
      }
    }
  });

  it("classifies common Python tokens", () => {
    const types = Object.fromEntries(
      tokenize('@cache\ndef add(a, b):  # sum\n    return f"{a}" + 42', "py")
        .filter((t) => t.text.trim())
        .map((t) => [t.text.trim(), t.type]),
    );
    expect(types["@cache"]).toBe("dec");
    expect(types.def).toBe("kw");
    expect(types.add).toBe("fn");
    expect(types["# sum"]).toBe("com");
    expect(types['f"{a}"']).toBe("str");
    expect(types["42"]).toBe("num");
  });

  it("handles unterminated strings while typing", () => {
    expect(join(tokenize('x = "abc', "py"))).toBe('x = "abc');
    expect(join(tokenize('s = """\nline', "py"))).toBe('s = """\nline');
  });

  it("guesses prompt languages", () => {
    expect(guessLang("// JavaScript\nconst a = 1;")).toBe("js");
    expect(guessLang("x = undefined\nif x == None:")).toBe("py");
    expect(guessLang("1. Create a list called fruits")).toBe(null);
  });
});
