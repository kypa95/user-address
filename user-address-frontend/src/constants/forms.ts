import type { FieldDescriptor, FormErrors } from '../types/forms';
export type FormValues = Record<string, string>;

/**
 * Keeps only the keys the backend accepts, so ids and timestamps never travel
 * back on an update.
 */
export function pickFields(
  fields: FieldDescriptor[],
  source: Record<string, any> | null | undefined,
): FormValues {
  return Object.fromEntries(fields.map(([, key]) => [key, String(source?.[key] ?? '')]));
}

export type { FormErrors };
