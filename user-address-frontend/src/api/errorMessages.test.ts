import { describe, it, expect } from 'vitest';
import { messageForError, ERROR_MESSAGES } from './errorMessages';

describe('messageForError', () => {
  it('prefers the business code over the HTTP status', () => {
    // 409 is mapped too; the code is the more specific of the two.
    expect(messageForError(1027, 409)).toBe(ERROR_MESSAGES[1027]);
  });

  it('accepts the code as a string, the way the envelope may carry it', () => {
    expect(messageForError('3100', 404)).toBe(ERROR_MESSAGES[3100]);
  });

  it('falls back to the status when the code is unknown', () => {
    expect(messageForError(9999, 500)).toBe('Ocurrió un error en el servidor. Inténtalo de nuevo.');
  });

  it('falls back to the status when there is no code at all', () => {
    expect(messageForError(undefined, 404)).toBe('No se encontró lo que buscabas.');
  });

  it('ignores a code that is not a number', () => {
    expect(messageForError('abc', 403)).toBe('No tienes permiso para realizar esta acción.');
  });

  it('returns null when neither the code nor the status is mapped', () => {
    expect(messageForError(undefined, 418)).toBeNull();
  });

  it('has a Spanish message for the codes the backend actually emits', () => {
    // The catalog in ErrorCode.java; a missing one would surface the English
    // text the server logs with.
    const emitted = [803, 817, 830, 831, 1020, 1027, 1028, 2111, 2116, 2215, 3100, 3120];

    emitted.forEach((code) => {
      expect(ERROR_MESSAGES[code], `code ${code}`).toBeTruthy();
    });
  });
});
