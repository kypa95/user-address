import { Autocomplete, TextField } from '@mui/material';
import type { SyntheticEvent } from 'react';

interface CustomAutocompleteSearchProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options?: string[];
  freeSolo?: boolean;
  disabled?: boolean;
  error?: string;
  /** Character cap, mirroring the backend `@Size(max = ...)` for the field. */
  maxLength?: number;
}

/**
 * Reusable searchable autocomplete wrapping MUI Autocomplete.
 * Controlled string field: `value` is the current text and `onChange` receives
 * the new string (both on select and, in freeSolo, on type).
 */
export default function CustomAutocompleteSearch({
  id,
  label,
  value,
  onChange,
  options = [],
  freeSolo = false,
  disabled = false,
  error = '',
  maxLength,
}: CustomAutocompleteSearchProps) {
  const hasError = Boolean(error);

  return (
    <Autocomplete
      id={id}
      options={options}
      value={value || null}
      disabled={disabled}
      freeSolo={freeSolo}
      autoHighlight
      onChange={(_event: SyntheticEvent, next: string | null) => onChange(next ?? '')}
      onInputChange={
        freeSolo
          ? (_event: SyntheticEvent, next: string) => onChange(next ?? '')
          : undefined
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          margin="normal"
          error={hasError}
          helperText={hasError ? error : ''}
          slotProps={
            maxLength
              ? { ...params.slotProps, htmlInput: { ...params.slotProps.htmlInput, maxLength } }
              : undefined
          }
        />
      )}
    />
  );
}
