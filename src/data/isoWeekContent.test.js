import { describe, expect, it } from "vitest";
import { isoWeek, isoYear } from "../components/dateUtils.js";
import { routeMeta } from "./seo.js";
import { whatWeekFaqs, weekStartsMondayFaqs } from "./isoWeekContent.js";

describe("ISO week explainer content", () => {
  it("keeps the visible FAQ sets suitable for FAQPage schema", () => {
    expect(whatWeekFaqs).toHaveLength(7);
    expect(weekStartsMondayFaqs).toHaveLength(6);
    expect(weekStartsMondayFaqs[0].a).toContain("viikko alkaa maanantaista");
  });

  it("keeps the new metadata inside snippet limits", () => {
    const meta = routeMeta["/viikko-alkaa-maanantaista"];
    expect(meta.title.length).toBeLessThanOrEqual(60);
    expect(meta.description.length).toBeGreaterThanOrEqual(140);
    expect(meta.description.length).toBeLessThanOrEqual(160);
  });

  it("matches known ISO week-year boundaries", () => {
    const firstWeek2026 = new Date(2025, 11, 29);
    expect(isoWeek(firstWeek2026)).toBe(1);
    expect(isoYear(firstWeek2026)).toBe(2026);

    const lastWeek2026 = new Date(2027, 0, 1);
    expect(isoWeek(lastWeek2026)).toBe(53);
    expect(isoYear(lastWeek2026)).toBe(2026);
  });
});
