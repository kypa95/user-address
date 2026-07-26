import { useSyncExternalStore } from 'react';
import { subscribeRequests, isRequestActive } from '../api/requestTracker';

/** True while any backend request is in flight. */
export function useGlobalLoading(): boolean {
  return useSyncExternalStore(subscribeRequests, isRequestActive, isRequestActive);
}
