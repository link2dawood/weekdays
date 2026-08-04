import { describe, expect, it } from "vitest";
import { routeMeta } from "./seo.js";
import {
  weeksInYearFaqs,
  yearWeekFact,
  yearWeekRows,
} from "./weeksInYearContent.js";

describe("weeks-in-a-year content", () => {
  it("identifies known 53-week years", () => {
    expect(yearWeekFact(2026)).toMatchObject({ weeks: 53, startsOn: "Torstai" });
    expect(yearWeekFact(2032)).toMatchObject({
      weeks: 53,
      startsOn: "Torstai",
      leap: true,
    });
  });

  it("identifies ordinary 52-week years", () => {
    expect(yearWeekFact(2025).weeks).toBe(52);
    expect(yearWeekFact(2027).weeks).toBe(52);
  });

  it("builds an inclusive, ordered comparison range", () => {
    const rows = yearWeekRows(2024, 2035);
    expect(rows).toHaveLength(12);
    expect(rows[0].year).toBe(2024);
    expect(rows.at(-1).year).toBe(2035);
  });

  it("provides seven concrete FAQs including the requested 2026 answer", () => {
    const faqs = weeksInYearFaqs(2026);
    expect(faqs).toHaveLength(7);
    expect(faqs.some((item) => item.a.includes("Vuonna 2026 on 53"))).toBe(true);
  });

  it("keeps page metadata inside snippet limits", () => {
    const meta = routeMeta["/kuinka-monta-viikkoa-vuodessa"];
    expect(meta.title.length).toBeLessThanOrEqual(60);
    expect(meta.description.length).toBeGreaterThanOrEqual(140);
    expect(meta.description.length).toBeLessThanOrEqual(158);
  });
});
