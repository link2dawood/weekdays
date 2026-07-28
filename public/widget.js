/*!
 * Viikko Nro — embeddable week-number widget (https://viikkonro.fi/upota-widgetti)
 * Single <script> tag, no dependencies. Renders the current ISO 8601 week
 * number where the tag is placed and links back to viikkonro.fi.
 *
 * Runs synchronously (no async/defer) so the badge is inserted during HTML
 * parsing, before the host page's first paint — that's what keeps this
 * layout-shift-free without needing to reserve space up front.
 */
(function () {
  "use strict";

  // Mirrors src/components/dateUtils.js's isoWeek() exactly. Duplicated, not
  // imported: this file ships standalone to third-party sites with no build
  // step of its own, so it can't pull in the React app's module graph.
  function isoWeek(d) {
    var t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var day = (t.getDay() + 6) % 7;
    t.setDate(t.getDate() - day + 3);
    var firstThu = t.valueOf();
    t.setMonth(0, 1);
    if (t.getDay() !== 4) {
      t.setMonth(0, 1 + ((4 - t.getDay() + 7) % 7));
    }
    return 1 + Math.round((firstThu - t.valueOf()) / 604800000);
  }

  var week = isoWeek(new Date());

  var link = document.createElement("a");
  link.href = "https://viikkonro.fi/?utm_source=widget&utm_medium=embed&utm_campaign=viikkonro-widget";
  link.target = "_blank";
  // Deliberately no "nofollow"/"sponsored" — the attribution link back is the
  // whole point of the widget (G-01's link-acquisition mechanism). "noopener"
  // is just tab-hijacking hygiene and has no effect on link equity.
  link.rel = "noopener";
  link.setAttribute("aria-label", "Viikko " + week + " — viikkonro.fi");
  link.style.cssText =
    "display:inline-flex;align-items:center;gap:.4em;" +
    "font:600 13px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;" +
    "color:#15211F;background:#eef1ef;border:1px solid #d7ddd9;" +
    "border-radius:999px;padding:.4em .85em;text-decoration:none;" +
    "white-space:nowrap;box-sizing:border-box;";

  var label = document.createElement("span");
  label.textContent = "Viikko " + week;

  var brand = document.createElement("span");
  brand.textContent = "viikkonro.fi";
  brand.style.cssText = "font-weight:400;font-size:10px;opacity:.65;";

  link.appendChild(label);
  link.appendChild(brand);

  var thisScript = document.currentScript;
  if (thisScript && thisScript.parentNode) {
    thisScript.parentNode.insertBefore(link, thisScript);
  }
})();
