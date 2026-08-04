import { describe, expect, it } from "vitest";
import { englishFaqs, englishMeta, englishWeekFacts, formatEnglishDate } from "./englishContent.js";

describe("English week content", () => {
  it("calculates ISO week 27 of 2023", () => {
    const fact = englishWeekFacts(new Date(2023, 6, 5));
    expect(fact.week).toBe(27);
    expect(fact.year).toBe(2023);
    expect(formatEnglishDate(fact.monday)).toBe("3 July 2023");
    expect(formatEnglishDate(fact.sunday)).toBe("9 July 2023");
  });

  it("keeps metadata within snippet targets", () => {
    const meta = englishMeta(new Date(2026, 7, 4));
    expect(meta.title.length).toBeLessThanOrEqual(60);
    expect(meta.description.length).toBeGreaterThanOrEqual(140);
    expect(meta.description.length).toBeLessThanOrEqual(160);
  });

  it("provides visible FAQ content", () => {
    expect(englishFaqs).toHaveLength(4);
  });
});
