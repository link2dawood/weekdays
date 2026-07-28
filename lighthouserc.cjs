// Lighthouse CI (G-02) — a lab-based regression gate, run against the
// production build's static output (staticDistDir, no dev server involved).
//
// IMPORTANT: this is NOT the same thing as HANDOFF's "verified in the field"
// requirement. Lab runs (this file) use Lighthouse's simulated throttling on
// one machine; "field" means real-user data (CrUX / Search Console's Core
// Web Vitals report), aggregated over real devices and networks. A page can
// pass this gate and still miss its field target, or vice versa. This gate
// exists to catch a commit that makes things measurably worse — treat the
// field numbers in Search Console as the actual source of truth.
//
// Baseline measured 2026-07-27 against the then-current build (18 runs: 6
// pages x 3 runs each, see the retained .lighthouseci/ reports for raw data):
//   - CLS:  0.000-0.006  (target <0.05  — comfortably passing)
//   - TBT:  0-247ms      (lab proxy for INP; target <100ms field — TBT running
//                         close to that already, some headroom kept below)
//   - LCP:  2041-3728ms  (target <1.0s  — NOT currently met; traced to the
//                         Google Fonts round-trip, ~1.4s before any font
//                         arrives under throttling. Real optimization work,
//                         tracked separately — this file gates against
//                         REGRESSING further from today's baseline, it does
//                         not pretend the 1.0s target is already hit.)
//
// Thresholds below are set from that baseline plus a margin wide enough to
// not flake on Lighthouse's normal run-to-run noise (a single URL swung
// 2041ms-3528ms across 3 runs of the identical build), not the aspirational
// HANDOFF numbers — update them down as real optimization work lands.
module.exports = {
  ci: {
    collect: {
      staticDistDir: "./dist",
      // A fixed past year (well inside PRERENDER_MIN_YEAR=2020's floor, so
      // these files always exist) rather than "this build's current week" —
      // keeps the sample URLs stable across every future run instead of
      // silently drifting with whatever week happens to be current.
      url: [
        "/index.html",
        "/viikko-1-2024.html",
        "/vuosi-2024.html",
        "/kuukausi-1-2024.html",
        "/mika-on-viikkonumero.html",
        "/upota-widgetti.html",
      ],
      numberOfRuns: 5,
    },
    assert: {
      assertions: {
        // Composite performance score deliberately NOT gated here — it swung
        // 0.79-0.95 across repeated runs of one identical build (Lighthouse's
        // usual noise), which would make this flaky without adding any
        // signal beyond the specific metrics below.
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 4500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.05 }],
        "total-blocking-time": ["error", { maxNumericValue: 400 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./.lighthouseci",
    },
  },
};
