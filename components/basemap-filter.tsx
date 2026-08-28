/**
 * Warm, quiet tint for the basemap land tiles, applied with
 * `filter: url(#basemap-warm)`.
 *
 * Esri's canvas tiles bake their place names into the land layer, so opacity on
 * the label layer cannot reach them. This transfer curve can: it is close to
 * flat from black up to ~0.87 and then climbs steeply to white, which collapses
 * every dark tone — the baked type — into one pale band while spreading the
 * light tones apart, so road casings separate more crisply from the land than
 * they did untouched.
 *
 * The three channels run the same curve at slightly different heights. That is
 * the warmth: red held highest, blue pulled down, land landing on off-white
 * while the top of each curve keeps the roads white.
 *
 * It lives in the layout, not in the map, so two mounted maps cannot duplicate
 * the filter id.
 */
const CURVE = {
  r: "0.790 0.792 0.795 0.800 0.802 0.808 0.820 0.837 1.000",
  g: "0.773 0.775 0.778 0.782 0.784 0.790 0.802 0.819 0.997",
  b: "0.743 0.745 0.747 0.752 0.754 0.759 0.771 0.787 0.985",
};

export function BasemapFilter() {
  return (
    <svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
      <filter id="basemap-warm" colorInterpolationFilters="sRGB">
        <feComponentTransfer>
          <feFuncR type="table" tableValues={CURVE.r} />
          <feFuncG type="table" tableValues={CURVE.g} />
          <feFuncB type="table" tableValues={CURVE.b} />
        </feComponentTransfer>
      </filter>
    </svg>
  );
}
