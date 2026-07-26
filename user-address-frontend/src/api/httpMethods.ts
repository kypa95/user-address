/**
 * HTTP verbs the API uses. Kept as named constants so a call site says
 * `HTTP_METHOD.POST` instead of a loose string a typo could break.
 */
export const HTTP_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const;

/** 'GET' | 'POST' | 'PUT' | 'DELETE', derived so both never drift apart. */
export type HttpMethod = (typeof HTTP_METHOD)[keyof typeof HTTP_METHOD];
