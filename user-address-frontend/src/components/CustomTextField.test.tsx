import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomTextField from './CustomTextField';

describe('CustomTextField', () => {
  it('renders the label and the value it is given', () => {
    render(<CustomTextField label="Nombre" value="Sonia" onChange={() => {}} />);

    expect(screen.getByLabelText('Nombre')).toHaveValue('Sonia');
  });

  it('reports every keystroke, since the page owns the state', async () => {
    const onChange = vi.fn();
    render(<CustomTextField label="Nombre" value="" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('Nombre'), 'Ana');

    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('shows the error message and marks the field invalid', () => {
    render(
      <CustomTextField label="CURP" value="x" onChange={() => {}} error="CURP inválida" />,
    );

    expect(screen.getByText('CURP inválida')).toBeInTheDocument();
    expect(screen.getByLabelText('CURP')).toBeInvalid();
  });

  it('shows the helper text while there is no error', () => {
    render(
      <CustomTextField
        label="CURP"
        value=""
        onChange={() => {}}
        helperText="18 caracteres"
      />,
    );

    expect(screen.getByText('18 caracteres')).toBeInTheDocument();
    expect(screen.getByLabelText('CURP')).toBeValid();
  });

  it('the error replaces the helper text rather than stacking with it', () => {
    render(
      <CustomTextField
        label="CURP"
        value=""
        onChange={() => {}}
        helperText="18 caracteres"
        error="CURP inválida"
      />,
    );

    expect(screen.queryByText('18 caracteres')).not.toBeInTheDocument();
    expect(screen.getByText('CURP inválida')).toBeInTheDocument();
  });

  it('caps the length at the same point the backend would reject it', async () => {
    render(<CustomTextField label="RFC" value="" onChange={() => {}} maxLength={13} />);

    const input = screen.getByLabelText('RFC');
    expect(input).toHaveAttribute('maxlength', '13');

    await userEvent.type(input, 'LOGS900101AB1XXXX');
    // The DOM enforces it, so nothing longer can even be typed.
    expect((input as HTMLInputElement).value.length).toBeLessThanOrEqual(13);
  });

  it('does not report changes while disabled', async () => {
    const onChange = vi.fn();
    render(<CustomTextField label="Nombre" value="Sonia" onChange={onChange} disabled />);

    await userEvent.type(screen.getByLabelText('Nombre'), 'Ana');

    expect(onChange).not.toHaveBeenCalled();
  });
});
