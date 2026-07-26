import { InputAdornment } from '@mui/material';
import type { ChangeEvent } from 'react';
import CustomTextField from './CustomTextField';

interface CustomPhoneInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  maxDigits?: number;
}

/** Mexican calling code; the field only registers Mexican numbers. */
const MX_CODE = '52';
const E164_PREFIX = `+${MX_CODE}`;

/**
 * The national digits shown in the field. The stored value is always E.164
 * ("+52" + up to 10 digits, produced by handleChange), so the prefix is
 * stripped literally — not by digit count, which broke as the user deleted
 * down to a few digits. Legacy values without the "+52" prefix pass through.
 */
function toNationalDigits(value: string, maxDigits: number): string {
  const raw = (value ?? '').trim();
  const withoutPrefix = raw.startsWith(E164_PREFIX) ? raw.slice(E164_PREFIX.length) : raw;
  return withoutPrefix.replace(/\D/g, '').slice(0, maxDigits);
}

/**
 * Phone field for Mexican numbers. Fixed "+52" prefix, digits only, capped at
 * `maxDigits` (10), so it lines up with the other text fields and never accepts
 * more than the required characters. The value handed back is E.164
 * ("+525512345678"), ready for the backend.
 */
export default function CustomPhoneInput({
  id,
  label,
  value,
  onChange,
  error = '',
  helperText = '',
  disabled = false,
  maxDigits = 10,
}: CustomPhoneInputProps) {
  const national = toNationalDigits(value, maxDigits);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, maxDigits);
    onChange(digits ? `+${MX_CODE}${digits}` : '');
  };

  return (
    <CustomTextField
      id={id}
      label={label}
      value={national}
      onChange={handleChange}
      error={error}
      helperText={helperText}
      disabled={disabled}
      maxLength={maxDigits}
      inputSlotProps={{
        startAdornment: <InputAdornment position="start">+{MX_CODE}</InputAdornment>,
      }}
    />
  );
}
