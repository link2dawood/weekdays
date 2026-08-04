import { describe, expect, it } from "vitest";
import { currentSwedishWeek, swedishHomeFaqs, swedishHomeMeta, swedishWeekFacts, swedishWeekMeta, swedishYearMeta } from "./swedishContent.js";

describe("Swedish week content", () => {
  it("calculates week 27 of 2023", () => {
    const fact = swedishWeekFacts(27, 2023);
    expect(fact.days[0].weekday).toBe("måndag");
    expect(fact.monday.getDate()).toBe(3);
    expect(fact.sunday.getDate()).toBe(9);
  });

  it("rejects a nonexistent week", () => {
    expect(swedishWeekFacts(53, 2025)).toBeNull();
  });

  it("calculates the current ISO week at year boundaries", () => {
    const fact = currentSwedishWeek(new Date(2026, 0, 1));
    expect([2025, 2026]).toContain(fact.year);
  });

  it("keeps titles within the snippet target", () => {
    const metas = [swedishHomeMeta(new Date(2026, 7, 4)), swedishYearMeta(2026), swedishWeekMeta(32, 2026)];
    metas.forEach((meta) => {
      expect(meta.title.length).toBeLessThanOrEqual(60);
      expect(meta.description.length).toBeGreaterThanOrEqual(140);
      expect(meta.description.length).toBeLessThanOrEqual(160);
    });
  });

  it("provides visible homepage FAQs", () => {
    expect(swedishHomeFaqs).toHaveLength(4);
  });
});
