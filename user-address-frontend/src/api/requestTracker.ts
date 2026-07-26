// Global in-flight request counter. Every backend call (JSON or file download)
// brackets itself with start/end, so a single overlay can reflect whether any
// request is running, independent of Redux.

let count = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function startRequest(): void {
  count += 1;
  if (count === 1) emit(); // false -> true
}

export function endRequest(): void {
  count = Math.max(0, count - 1);
  if (count === 0) emit(); // true -> false
}

/** True while at least one request is in flight. */
export function isRequestActive(): boolean {
  return count > 0;
}

/** Subscribe to on/off changes; returns an unsubscribe fn (for useSyncExternalStore). */
export function subscribeRequests(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
