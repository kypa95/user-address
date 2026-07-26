import { TextField, MenuItem } from '@mui/material';
import type { ChangeEvent } from 'react';

type SelectOption = string | { value: string; label: string };

interface CustomSelectProps {
  id?: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  options?: SelectOption[];
  disabled?: boolean;
  error?: string;
  helperText?: string;
}

/**
 * Reusable dropdown wrapping MUI TextField in select mode.
 * Options may be plain strings or { value, label } objects.
 */
export default function CustomSelect({
  id,
  label,
  value,
  onChange,
  options = [],
  disabled = false,
  error = '',
  helperText = '',
}: CustomSelectProps) {
  const hasError = Boolean(error);

  const normalized = options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option,
  );

  return (
    <TextField
      id={id}
      select
      fullWidth
      variant="outlined"
      margin="normal"
      label={label}
      value={value ?? ''}
      onChange={onChange}
      disabled={disabled}
      error={hasError}
      helperText={hasError ? error : helperText}
    >
      {normalized.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
