import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomPhoneInput from './CustomPhoneInput';

describe('CustomPhoneInput', () => {
  // The prefix goes through the Input slot. MUI v9 dropped the old `InputProps`,
  // and passing it there fails silently: React drops it on the DOM and the
  // adornment never renders, so the field loses its "+52".
  it('shows the +52 prefix', () => {
    render(<CustomPhoneInput label="Teléfono" value="" onChange={() => {}} />);

    expect(screen.getByText('+52')).toBeInTheDocument();
  });

  it('displays a stored E.164 number as its national digits', () => {
    render(
      <CustomPhoneInput label="Teléfono" value="+525512345678" onChange={() => {}} />,
    );

    expect(screen.getByLabelText('Teléfono')).toHaveValue('5512345678');
  });

  it('hands back E.164, which is what the backend validates', async () => {
    const onChange = vi.fn();
    render(<CustomPhoneInput label="Teléfono" value="" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('Teléfono'), '5');

    expect(onChange).toHaveBeenCalledWith('+525');
  });

  it('drops anything that is not a digit', async () => {
    const onChange = vi.fn();
    render(<CustomPhoneInput label="Teléfono" value="" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('Teléfono'), 'a-b');

    // The keystrokes are reported, but none of them adds a character: with no
    // digits the value stays empty rather than becoming a bare "+52".
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.every(([value]) => value === '')).toBe(true);
  });

  it('caps the national part at 10 digits', () => {
    render(<CustomPhoneInput label="Teléfono" value="" onChange={() => {}} />);

    expect(screen.getByLabelText('Teléfono')).toHaveAttribute('maxlength', '10');
  });

  it('reports an empty value instead of a bare prefix when the field is cleared', async () => {
    const onChange = vi.fn();
    render(<CustomPhoneInput label="Teléfono" value="+525512345678" onChange={onChange} />);

    await userEvent.clear(screen.getByLabelText('Teléfono'));

    expect(onChange).toHaveBeenCalledWith('');
  });
});
