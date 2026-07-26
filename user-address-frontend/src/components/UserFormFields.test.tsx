import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserFormFields from './UserFormFields';
import { USER_FIELDS, EMPTY_USER } from '../constants/users/userFields';

/** The props the two pages pass, with spies in place of their handlers. */
function setup(overrides: Partial<Parameters<typeof UserFormFields>[0]> = {}) {
  const onFieldChange = vi.fn(() => vi.fn());
  const onValueChange = vi.fn(() => vi.fn());

  render(
    <UserFormFields
      idPrefix="tst"
      values={EMPTY_USER}
      errors={{}}
      onFieldChange={onFieldChange}
      onValueChange={onValueChange}
      {...overrides}
    />,
  );

  return { onFieldChange, onValueChange };
}

describe('UserFormFields', () => {
  it('renders one input per user field', () => {
    setup();

    USER_FIELDS.forEach(([label]) => {
      expect(screen.getByLabelText(label, { exact: false })).toBeInTheDocument();
    });
  });

  it('prefixes the ids, so the same body can be reused on two screens', () => {
    setup();

    expect(document.querySelector('#tst_curp')).not.toBeNull();
    expect(document.querySelector('#tst_email')).not.toBeNull();
  });

  it('shows the values it is given', () => {
    setup({ values: { ...EMPTY_USER, name: 'Sonia', curp: 'LOGS900101MDFPRN09' } });

    expect(screen.getByLabelText('Nombre')).toHaveValue('Sonia');
    expect(screen.getByLabelText('CURP')).toHaveValue('LOGS900101MDFPRN09');
  });

  it('shows the error of each field', () => {
    setup({ errors: { curp: 'CURP inválida', email: 'Ingresa un correo válido' } });

    expect(screen.getByText('CURP inválida')).toBeInTheDocument();
    expect(screen.getByText('Ingresa un correo válido')).toBeInTheDocument();
    expect(screen.getByLabelText('CURP')).toBeInvalid();
  });

  it('reports a change through the handler of the field that changed', async () => {
    const onFieldChange = vi.fn(() => vi.fn());
    setup({ onFieldChange });

    await userEvent.type(screen.getByLabelText('Nombre'), 'A');

    // The page builds one handler per key: it must have been asked for "name".
    expect(onFieldChange).toHaveBeenCalledWith('name');
  });

  it('sends the phone through onValueChange, not onFieldChange', () => {
    const onValueChange = vi.fn(() => vi.fn());
    setup({ onValueChange });

    // CustomPhoneInput hands back the value directly, not a DOM event.
    expect(onValueChange).toHaveBeenCalledWith('phoneNumber');
  });
});
