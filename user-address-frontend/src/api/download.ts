import { ApiError } from './client';
import { messageForError } from './errorMessages';
import { startRequest, endRequest } from './requestTracker';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

/** Pulls the file name out of a Content-Disposition header, or falls back. */
function filenameFromDisposition(disposition: string | null, fallback: string): string {
  if (!disposition) return fallback;
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  return match ? decodeURIComponent(match[1]) : fallback;
}

/**
 * Fetches a binary endpoint and triggers a browser download.
 * Unlike `apiRequest`, the body is a Blob, not the JSON envelope — used for the
 * .xlsx exports.
 */
export async function downloadFile(path: string, fallbackName: string): Promise<void> {
  startRequest();
  try {
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}${path}`);
    } catch {
      throw new ApiError('No se pudo contactar al servidor. Verifica que el backend esté arriba.');
    }

    if (!response.ok) {
      // A failed export still answers with the JSON envelope, so the business
      // code is translated the same way apiRequest does it.
      let code: string | number | undefined;
      let backendMessage: string | undefined;
      try {
        const payload = await response.json();
        code = payload?.code;
        backendMessage = payload?.message;
      } catch {
        // non-JSON error page
      }

      const message =
        messageForError(code, response.status) ??
        backendMessage ??
        `Error ${response.status}`;

      throw new ApiError(message, { status: response.status, code });
    }

    const blob = await response.blob();
    const name = filenameFromDisposition(
      response.headers.get('Content-Disposition'),
      fallbackName,
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  } finally {
    endRequest();
  }
}
