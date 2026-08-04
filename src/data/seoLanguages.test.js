import { describe, expect, it } from "vitest";
import { breadcrumbTrail, metaFor, sitemapEntries } from "./seo.js";

describe("published language routes", () => {
  it("does not publish Swedish pages or SEO metadata", () => {
    const paths = sitemapEntries(2026).map((entry) => entry.path);

    expect(paths.some((path) => path === "/sv" || path.startsWith("/sv/"))).toBe(
      false,
    );
    expect(metaFor("/sv")).toBeNull();
    expect(metaFor("/sv/veckor-2026")).toBeNull();
    expect(metaFor("/sv/vecka-32-2026")).toBeNull();
    expect(breadcrumbTrail("/sv")).toBeNull();
  });
});
