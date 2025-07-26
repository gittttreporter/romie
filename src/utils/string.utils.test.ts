import { describe, it, expect } from "vitest"; // or 'jest'
import { normalizeInput } from "./string.utils";

describe("normalizeInput", () => {
  it("removes disallowed special chars, keeps allowed", () => {
    expect(normalizeInput("hello world!")).toBe("hello world!");
    expect(normalizeInput("a_good-tag:example?")).toBe("a_good-tag:example?");
    expect(normalizeInput(`emojis 🎮🔥`)).toBe("emojis 🎮🔥");
    expect(normalizeInput("hello@foo.com")).toBe("hello@foo.com");
    expect(normalizeInput("foo#bar&baz,boop.")).toBe("foo#bar&baz,boop.");
  });

  it("trims leading/trailing/extra spaces", () => {
    expect(normalizeInput("   spaced   out   ")).toBe("spaced out");
    expect(normalizeInput("a    b\tc")).toBe("a b c"); // collapses tabs and spaces
  });

  it("removes forbidden HTML or JS", () => {
    expect(normalizeInput('<script>alert("x")</script>')).toBe(
      "scriptalertxscript",
    );
    expect(normalizeInput("hello/world")).toBe("helloworld"); // slash gone
    expect(normalizeInput("tag*with$forbidden%chars^")).toBe(
      "tagwithforbiddenchars",
    );
  });

  it("allows unicode letters and numbers", () => {
    expect(normalizeInput("naïve café 123")).toBe("naïve café 123"); // accents stay
    expect(normalizeInput("中文タグ123")).toBe("中文タグ123"); // Kanji, Katakana, Arabic numbers stay
  });

  it("removes control and invisible characters", () => {
    expect(normalizeInput("foo\nbar\r\nbaz")).toBe("foo bar baz");
    expect(normalizeInput("abc\u200Bdef")).toBe("abcdef"); // zero-width space removed
  });
});
