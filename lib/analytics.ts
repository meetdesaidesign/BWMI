type AnalyticsValue = string | number | boolean | null | undefined;
type AnalyticsProps = Record<string, AnalyticsValue>;

/** Lightweight product analytics. Never send precise coordinates. */
export function track(event: string, properties?: AnalyticsProps) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("fixo:analytics", { detail: { event, properties } }));
}
