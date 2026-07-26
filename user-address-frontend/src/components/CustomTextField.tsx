import { TextField } from '@mui/material';
import type { ChangeEvent } from 'react';

interface CustomTextFieldProps {
  id?: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: string;
  helperText?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  /** Character cap, mirroring the backend `@Size(max = ...)` for the field. */
  maxLength?: number;
  // Props for the Input slot (e.g. an adornment). MUI v9 dropped the old
  // `InputProps`, so these go through `slotProps.input`. Kept loose to stay
  // compatible across MUI type versions.
  inputSlotProps?: Record<string, unknown>;
}

/**
 * Reusable text field wrapping MUI TextField.
 * Shows a red error message when `error` is a non-empty string.
 */
export default function CustomTextField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  error = '',
  helperText = '',
  autoComplete,
  autoFocus = false,
  disabled = false,
  maxLength,
  inputSlotProps,
}: CustomTextFieldProps) {
  const hasError = Boolean(error);
  // `htmlInput` reaches the <input> itself, `input` the MUI Input that wraps it.
  // Both live under the same slotProps object, so they are merged here instead
  // of overwriting each other.
  const slotProps = {
    ...(maxLength ? { htmlInput: { maxLength } } : {}),
    ...(inputSlotProps ? { input: inputSlotProps } : {}),
  };

  return (
    <TextField
      id={id}
      fullWidth
      variant="outlined"
      margin="normal"
      label={label}
      value={value}
      onChange={onChange}
      type={type}
      error={hasError}
      helperText={hasError ? error : helperText}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      disabled={disabled}
      slotProps={slotProps}
    />
  );
}
