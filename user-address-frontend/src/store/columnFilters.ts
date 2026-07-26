import type { ColumnFilters } from '../api/params';

/** One per-column filter, keyed by the column's accessor, as MRT shapes it. */
export interface ColumnFilter {
  id: string;
  value: unknown;
}

/**
 * MRT's `[{ id, value }]` turned into the `{ column: term }` the API takes.
 * Blank values are dropped so an emptied input stops narrowing the query.
 */
export function toColumnFilters(filters: ColumnFilter[]): ColumnFilters {
  return Object.fromEntries(
    filters
      .filter((filter) => filter.value != null && String(filter.value).trim() !== '')
      .map((filter) => [filter.id, String(filter.value)]),
  );
}
