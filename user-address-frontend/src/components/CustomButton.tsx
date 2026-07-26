import { Button, type ButtonProps } from '@mui/material';
import type { ReactNode } from 'react';
import '../css/CustomButton.css';

interface CustomButtonProps {
  id?: string;
  children: ReactNode;
  variant?: ButtonProps['variant'];
  color?: ButtonProps['color'];
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: ButtonProps['onClick'];
  className?: string;
}

/**
 * Reusable button wrapping MUI Button. Extra spacing/sizing is applied by
 * callers via the `className` prop.
 */
export default function CustomButton({
  id,
  children,
  variant = 'contained',
  color = 'primary',
  type = 'button',
  fullWidth = true,
  disabled = false,
  onClick,
  className = '',
}: CustomButtonProps) {
  return (
    <Button
      id={id}
      variant={variant}
      color={color}
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
