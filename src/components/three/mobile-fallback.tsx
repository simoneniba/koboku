/**
 * Static fallback shown when:
 * - User prefers reduced motion
 * - Device is low-power / mobile (detected via navigator.hardwareConcurrency)
 *
 * This is a server component — no JS overhead.
 */
export function MobileFallback() {
  return (
    <div
      className="fixed inset-0 z-[1] bg-marine"
      aria-hidden="true"
    />
  );
}
