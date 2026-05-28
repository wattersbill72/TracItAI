type TelemetryProperties = Record<string, string | number | boolean | null | undefined>

export async function trackEvent(
  eventType: string,
  properties?: TelemetryProperties,
): Promise<void> {
  try {
    await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, properties }),
    })
  } catch {
    // fire and forget — never throws
  }
}
