import { Chip } from '@mui/material';
import type { ReactElement } from 'react';

interface CustomChipProps {
  id?: string;
  label: string;
  /** Leading icon; must be a single element, as MUI Chip expects. */
  icon?: ReactElement;
  color?: 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium';
  className?: string;
}

/**
 * Reusable chip wrapping MUI Chip.
 * Declares every prop it accepts explicitly (no prop spreading).
 */
export default function CustomChip({
  id,
  label,
  icon,
  color = 'default',
  variant = 'filled',
  size = 'medium',
  className,
}: CustomChipProps) {
  return (
    <Chip
      id={id}
      label={label}
      icon={icon}
      color={color}
      variant={variant}
      size={size}
      className={className}
    />
  );
}
