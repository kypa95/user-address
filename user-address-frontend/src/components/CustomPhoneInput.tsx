import { forwardRef, useState } from 'react';
import { TextField } from '@mui/material';
import PhoneInput, { getCountryCallingCode } from 'react-phone-number-input';
import type { Country } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../css/CustomPhoneInput.css';

interface InnerInputProps {
  value?: string;
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

/** getCountryCallingCode throws on an unknown country; never let that crash the field. */
function safeCallingCode(country: Country): string {
  try {
    return getCountryCallingCode(country);
  } catch {
    return '';
  }
}

const MuiPhoneField = forwardRef<HTMLInputElement, InnerInputProps>(
  function MuiPhoneField({ label, error, helperText, ...rest }, ref) {
    return (
      <TextField
        {...rest}
        inputRef={ref}
        fullWidth
        variant="outlined"
        margin="normal"
        label={label}
        error={error}
        helperText={helperText}
      />
    );
  },
);

interface CustomPhoneInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  defaultCountry?: Country;
  maxDigits?: number;
}

/**
 * Phone field built on react-phone-number-input: country dropdown, formatting
 * as you type, and an E.164 value ready for the backend.
 *
 * Declares every prop it accepts explicitly, like the other Custom components.
 * The object spread inside `MuiPhoneField` is the library's own input props,
 * which must be forwarded as-is.
 */
export default function CustomPhoneInput({
  id,
  label,
  value,
  onChange,
  error = '',
  helperText = '',
  disabled = false,
  defaultCountry = 'MX',
  maxDigits = 10,
}: CustomPhoneInputProps) {
  const hasError = Boolean(error);
  const [country, setCountry] = useState<Country>(defaultCountry);

  const handleChange = (next?: string) => {
    const nextValue = next ?? '';

    if (nextValue && maxDigits) {
      const digits = nextValue.replace(/\D/g, '');
      const callingCode = country ? safeCallingCode(country) : '';
      const national =
        callingCode && digits.startsWith(callingCode)
          ? digits.slice(callingCode.length)
          : digits;
      if (national.length > maxDigits) return;
    }

    onChange(nextValue);
  };

  return (
    <PhoneInput
      id={id}
      countryCallingCodeEditable={false}
      defaultCountry={defaultCountry}
      countries={['MX']}
      addInternationalOption={false}
      value={value || undefined}
      onChange={handleChange}
      onCountryChange={(next) => next && setCountry(next)}
      disabled={disabled}
      inputComponent={MuiPhoneField}
      numberInputProps={{
        label,
        error: hasError,
        helperText: hasError ? error : helperText,
      }}
      className="custom-phone-input"
    />
  );
}
