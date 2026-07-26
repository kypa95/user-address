/** Query params shared by the paginated list endpoints. */
export interface ListParams {
  page?: number;
  size?: number;
  search?: string;
  signal?: AbortSignal;
}

/**
 * Per-column filters, keyed by the column name the backend expects. Blank
 * values are dropped instead of being sent as empty params.
 */
export type ColumnFilters = Record<string, string>;

/** Appends the non-empty filters to a query string. */
export function appendFilters(params: URLSearchParams, filters?: ColumnFilters): void {
  if (!filters) return;

  for (const [key, value] of Object.entries(filters)) {
    const term = String(value ?? '').trim();
    if (term) params.set(key, term);
  }
}
