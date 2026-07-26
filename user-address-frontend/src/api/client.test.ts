import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiRequest, ApiError } from './client';
import { HTTP_METHOD } from './httpMethods';
import { isRequestActive } from './requestTracker';

/** Builds a fetch Response-like object with the envelope the backend sends. */
function envelope(body: unknown, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

describe('apiRequest', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('unwraps the data field of the envelope', async () => {
    vi.mocked(fetch).mockResolvedValue(
      envelope({ message: 'ok', code: 200, data: { id: 'u1' } }),
    );

    await expect(apiRequest('/users/u1')).resolves.toEqual({ id: 'u1' });
    expect(fetch).toHaveBeenCalledWith('/api/users/u1', expect.objectContaining({ method: 'GET' }));
  });

  it('sends a JSON body with its content type on a write', async () => {
    vi.mocked(fetch).mockResolvedValue(envelope({ data: { id: 'u1' } }));

    await apiRequest('/users', { method: HTTP_METHOD.POST, body: { name: 'Sonia' } });

    expect(fetch).toHaveBeenCalledWith(
      '/api/users',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"name":"Sonia"}',
      }),
    );
  });

  it('answers null when the envelope carries no data', async () => {
    vi.mocked(fetch).mockResolvedValue(envelope({ message: 'ok' }));

    await expect(apiRequest('/users/u1')).resolves.toBeNull();
  });

  it('turns a business code into its Spanish message', async () => {
    vi.mocked(fetch).mockResolvedValue(
      envelope({ message: 'user with ID: u1 not exists.', code: 3100 }, { ok: false, status: 404 }),
    );

    // The English text the backend logs with never reaches the user.
    await expect(apiRequest('/users/u1')).rejects.toThrowError('El usuario no existe.');
  });

  it('carries the status and the code on the error it throws', async () => {
    vi.mocked(fetch).mockResolvedValue(
      envelope({ code: 1027, url: '/api/users' }, { ok: false, status: 409 }),
    );

    await expect(apiRequest('/users')).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 1027,
      url: '/api/users',
    });
  });

  it('falls back to the status when the code is unknown', async () => {
    vi.mocked(fetch).mockResolvedValue(envelope({ code: 9999 }, { ok: false, status: 500 }));

    await expect(apiRequest('/users')).rejects.toThrowError(
      'Ocurrió un error en el servidor. Inténtalo de nuevo.',
    );
  });

  it('explains that the backend is unreachable when fetch itself fails', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(apiRequest('/users')).rejects.toBeInstanceOf(ApiError);
    await expect(apiRequest('/users')).rejects.toThrowError(/backend esté arriba/);
  });

  it('rethrows an abort untouched, so the thunk can tell it apart', async () => {
    const aborted = new Error('The operation was aborted');
    aborted.name = 'AbortError';
    vi.mocked(fetch).mockRejectedValue(aborted);

    await expect(apiRequest('/users')).rejects.toThrowError(aborted);
  });

  it('stops counting the request even when it fails', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(apiRequest('/users')).rejects.toThrow();

    // A leaked counter would leave the global loading overlay stuck on.
    expect(isRequestActive()).toBe(false);
  });
});
