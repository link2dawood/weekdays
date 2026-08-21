# AdSense placement plan

Status: layout planning only. No AdSense script, ad unit, publisher ID, or
production placeholder is active.

Preview locally with:

```sh
VITE_AD_LAYOUT_PREVIEW=true npm run dev
```

The flag is intentionally separate from future ad serving. Production ads must
not be enabled until the AdSense site status is **Ready** and the certified CMP
has granted the consent required for the request.

## Planned slots

| Placement ID | Route family | Position | Format | Rationale |
| --- | --- | --- | --- | --- |
| `year-summary-after-facts` | `/vuosi-{year}` | After the complete year summary, before navigation and week cards | Responsive banner | Keeps the direct answer and facts uninterrupted. |
| `working-days-after-result` | `/tyopaivat-{year}` | After calculated totals, before the monthly breakdown | In-content rectangle | Never separates inputs from results and remains outside the table. |
| `print-list-before-preview` | `/tulosta-{year}` | After print/download controls, before the printable week table | Responsive banner | Leaves the explanation and actions together and never enters printed output. |
| `calendar-before-preview` | `/kalenteri-{year}[-alkuvuosi|-loppuvuosi]` | After view controls, before the calendar grid | Responsive banner | Places monetization outside the calendar itself and excludes the print-only route. |

## Guardrails for post-approval integration

- Slots stay out of the header, navigation, footer, calculator controls,
  calculator results, tables, calendar cells, and printable output.
- No sticky, floating, overlay, interstitial, or auto-inserted placement may
  cover or imitate functional controls.
- The reserved slot dimensions must remain in place while an approved creative
  loads: 120 px minimum for desktop banners and 280 px for mobile/rectangle
  placements. This is the CLS budget protection.
- A slot must collapse entirely when ads are disabled or consent is unavailable;
  it must not leave an empty card that looks unfinished.
- Ad requests and the AdSense script remain consent-gated by the certified CMP.
  The layout-preview flag must never be used as the ad-serving switch.
- Re-run mobile and desktop Lighthouse plus real-user CWV monitoring after the
  first ad units are enabled; pre-approval numbers are only the baseline.
