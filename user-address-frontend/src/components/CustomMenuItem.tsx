import { MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import type { ReactNode } from 'react';

interface CustomMenuItemProps {
  id?: string;
  icon: ReactNode;
  label: ReactNode;
  onClick: () => void;
}

/**
 * Reusable row/menu action: an icon plus a label inside an MUI MenuItem.
 * The icon carries its own color/size (e.g. `color="error"` for destructive
 * actions), so this stays purely structural.
 */
export default function CustomMenuItem({ id, icon, label, onClick }: CustomMenuItemProps) {
  return (
    <MenuItem id={id} onClick={onClick}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText>{label}</ListItemText>
    </MenuItem>
  );
}
