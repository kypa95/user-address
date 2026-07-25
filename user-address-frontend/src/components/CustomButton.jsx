import { Button } from '@mui/material';
import './CustomButton.css';

/**
 * Reusable button wrapping MUI Button.
 * Declares every prop it accepts explicitly (no prop spreading).
 *
 * @param {object}   props
 * @param {React.ReactNode} props.children  - button label/content.
 * @param {'text'|'outlined'|'contained'} [props.variant='contained']
 * @param {'button'|'submit'|'reset'} [props.type='button']
 * @param {boolean}  [props.fullWidth=true]
 * @param {boolean}  [props.disabled=false]
 * @param {() => void} [props.onClick]
 * @param {string}   [props.className='']    - extra class for view-level spacing/sizing.
 */
export default function CustomButton({
  children,
  variant = 'contained',
  type = 'button',
  fullWidth = true,
  disabled = false,
  onClick,
  className = '',
}) {
  return (
    <Button
      variant={variant}
      type={type}
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      className={`custom-button ${className}`.trim()}
    >
      {children}
    </Button>
  );
}
