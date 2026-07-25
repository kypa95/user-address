import { TextField } from '@mui/material';

/**
 * Reusable text field wrapping MUI TextField.
 * Declares every prop it accepts explicitly (no prop spreading).
 * Shows a red error message when `error` is a non-empty string.
 *
 * @param {object}   props
 * @param {string}   props.label
 * @param {string}   props.value
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} props.onChange
 * @param {string}   [props.type='text']
 * @param {string}   [props.error='']          - error message; red helper text when set.
 * @param {string}   [props.helperText='']     - normal helper text when no error.
 * @param {string}   [props.autoComplete]
 * @param {boolean}  [props.autoFocus=false]
 * @param {object}   [props.InputProps]        - MUI Input props (e.g. end adornment).
 */
export default function CustomTextField({
  label,
  value,
  onChange,
  type = 'text',
  error = '',
  helperText = '',
  autoComplete,
  autoFocus = false,
  InputProps,
}) {
  const hasError = Boolean(error);
  return (
    <TextField
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
      InputProps={InputProps}
    />
  );
}
