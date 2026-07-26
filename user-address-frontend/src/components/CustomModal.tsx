import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import Close from '@mui/icons-material/Close';
import type { ReactNode } from 'react';
import '../css/CustomModal.css';

type MaxWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;

interface CustomModalProps {
  id?: string;
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: MaxWidth;
}

/**
 * Reusable modal dialog. The body is dynamic — pass any content as children.
 */
export default function CustomModal({
  id,
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
}: CustomModalProps) {
  return (
    <Dialog id={id} open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle className="modal-title" component="div">
        <span>{title}</span>
        <IconButton aria-label="cerrar" onClick={onClose} sx={{ ml: 2 }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      {actions ? <DialogActions>{actions}</DialogActions> : null}
    </Dialog>
  );
}
