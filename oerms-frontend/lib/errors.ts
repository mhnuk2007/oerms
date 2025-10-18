export function getErrorMessage(err: unknown, defaultMessage = 'An error occurred'): string {
  if (!err) return defaultMessage;
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>;
    const resp = e['response'] as Record<string, unknown> | undefined;
    const data = resp?.['data'] as Record<string, unknown> | undefined;
    const msg = data?.['message'] ?? e['message'];
    if (typeof msg === 'string') return msg;
  }
  return defaultMessage;
}
