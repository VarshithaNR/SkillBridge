/**
 * Parses simple duration strings like "15m", "7d", "1h" into milliseconds.
 * Only supports the handful of unit suffixes we actually use in env config
 * (s/m/h/d) — deliberately not a general-purpose duration library.
 */
export function parseDurationMs(value: string): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid duration format: "${value}" (expected e.g. "15m", "7d")`);
  }

  const amount = Number(match[1]);
  const unit = match[2];

  const unitMs: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * unitMs[unit];
}
