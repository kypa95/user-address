/**
 * Spanish message per business error code.
 *
 * The backend answers with an English message plus a numeric `code` from its
 * ErrorCode catalog. The code is the stable part — the wording is not — so the
 * text the user reads is decided here.
 *
 * Keys mirror `util/enums/ErrorCode.java`; keep both in step when adding one.
 */
export const ERROR_MESSAGES: Record<number, string> = {
  801: 'El correo no tiene un formato válido.',
  802: 'El teléfono no tiene un formato válido.',
  803: 'Alguno de los datos enviados no tiene el tipo esperado.',
  817: 'Revisa el formulario: hay campos incompletos o inválidos.',
  818: 'El registro no se puede actualizar.',
  825: 'El nombre es obligatorio.',
  826: 'El apellido paterno es obligatorio.',
  827: 'El apellido materno es obligatorio.',
  828: 'El correo es obligatorio.',
  829: 'El teléfono es obligatorio.',
  830: 'La petición no se pudo leer. Revisa los datos enviados.',
  831: 'El registro no existe.',
  832: 'El registro ya existe.',
  833: 'No hay cambios que guardar.',
  835: 'El registro no se puede eliminar.',
  837: 'La operación no es aceptable.',
  838: 'Falta información obligatoria.',
  880: 'La lista está vacía.',

  1020: 'El correo ya está registrado por otro usuario.',
  1021: 'El teléfono ya está registrado por otro usuario.',
  1027: 'La CURP ya está registrada por otro usuario.',
  1028: 'El RFC ya está registrado por otro usuario.',
  1029: 'Falta el identificador del usuario.',
  3100: 'El usuario no existe.',
  3101: 'La CURP no tiene un formato válido.',
  3102: 'El RFC no tiene un formato válido.',
  3103: 'El usuario no se puede eliminar.',
  3104: 'Los criterios de búsqueda no son válidos.',

  3120: 'La dirección no existe.',
  3121: 'La dirección no pertenece a este usuario.',
  3122: 'El código postal no tiene un formato válido.',
  3123: 'La dirección ya existe.',
  3124: 'La dirección debe estar asociada a un usuario.',
  3125: 'La dirección no se puede eliminar.',

  2111: 'No se pudo generar el reporte. Inténtalo de nuevo.',
  2116: 'Ocurrió un error inesperado. Contacta al administrador.',
  2212: 'No hay conexión con la base de datos.',
  2215: 'El registro duplica un valor que debe ser único.',
  2216: 'Ocurrió un error al acceder a la base de datos.',
};

/** Shown when the server answers an HTTP error with no business code. */
const BY_STATUS: Record<number, string> = {
  400: 'La petición no es válida.',
  401: 'Tu sesión no es válida. Inicia sesión de nuevo.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'No se encontró lo que buscabas.',
  405: 'La operación no está permitida en este recurso.',
  409: 'El registro entra en conflicto con uno existente.',
  500: 'Ocurrió un error en el servidor. Inténtalo de nuevo.',
  503: 'El servicio no está disponible en este momento.',
};

/**
 * Message for the user, preferring the business code over the HTTP status.
 *
 * @param code   business code from the response envelope
 * @param status HTTP status, used when the code is unknown or absent
 * @returns the Spanish message, or null when neither is mapped
 */
export function messageForError(
  code: string | number | undefined,
  status: number,
): string | null {
  const numericCode = typeof code === 'string' ? Number(code) : code;

  if (numericCode !== undefined && !Number.isNaN(numericCode)) {
    const byCode = ERROR_MESSAGES[numericCode as number];
    if (byCode) return byCode;
  }

  return BY_STATUS[status] ?? null;
}
