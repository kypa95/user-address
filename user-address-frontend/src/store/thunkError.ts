/**
 * Shared by every thunk: turns a failed request into the plain message the
 * reducers store.
 *
 * An abort is rethrown instead of rejected, so `action.meta.aborted` stays true
 * and the reducer can ignore a request that a newer one already superseded.
 *
 * The generic keeps whatever `rejectWithValue` returns, so each thunk keeps its
 * own `rejectValue` typing.
 *
 * @param error           whatever was thrown; ApiError carries a message
 * @param rejectWithValue the helper Redux Toolkit hands to the payload creator
 */
export function toMessage<T>(error: unknown, rejectWithValue: (value: string) => T): T {
  if (error instanceof Error) {
    if (error.name === 'AbortError') throw error;
    return rejectWithValue(error.message);
  }
  return rejectWithValue('Error');
}
