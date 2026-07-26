import { startRequest, endRequest } from './requestTracker';
import { HTTP_METHOD, type HttpMethod } from './httpMethods';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

interface ApiErrorInit {
  status?: number;
  code?: string | number;
  url?: string;
}

export class ApiError extends Error {
  status: number;
  code?: string | number;
  url?: string;

  constructor(message: string, { status = 0, code, url }: ApiErrorInit = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.url = url;
  }
}

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
}

interface ApiEnvelope<T> {
  message?: string;
  code?: string | number;
  url?: string;
  data?: T;
}

/**
 * @param path - path after /api, e.g. "/users?page=0".
 * @returns the `data` field of the envelope.
 */
export async function apiRequest<T = unknown>(
  path: string,
  { method = HTTP_METHOD.GET, body, signal }: ApiRequestOptions = {},
): Promise<T | null> {
  startRequest();
  try {
    let response: Response;

    try {
      response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal,
      });
    } catch (cause) {
      if (cause instanceof Error && cause.name === 'AbortError') throw cause;
      throw new ApiError('No se pudo contactar al servidor. Verifica que el backend esté arriba.');
    }

    const payload: ApiEnvelope<T> | null = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(payload?.message ?? `Error ${response.status}`, {
        status: response.status,
        code: payload?.code,
        url: payload?.url,
      });
    }

    return payload?.data ?? null;
  } finally {
    endRequest();
  }
}
