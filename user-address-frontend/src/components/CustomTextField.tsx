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
  // MUI Input props (e.g. an end adornment). Kept loose to stay compatible
  // across MUI type versions; forwarded to TextField as-is.
  InputProps?: Record<string, unknown>;
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
  InputProps,
}: CustomTextFieldProps) {
  const hasError = Boolean(error);
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
      slotProps={maxLength ? { htmlInput: { maxLength } } : undefined}
      {...(InputProps ? ({ InputProps } as Record<string, unknown>) : {})}
    />
  );
}
