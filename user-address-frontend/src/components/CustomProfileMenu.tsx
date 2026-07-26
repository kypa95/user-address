import { useState, type MouseEvent } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Typography,
  Box,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Logout from '@mui/icons-material/Logout';
import '../css/CustomProfileMenu.css';

interface CustomProfileMenuProps {
  id?: string;
  name?: string;
  onLogout: () => void;
}

/**
 * Reusable profile menu: a profile icon that, on click, opens a dropdown
 * showing the user's name and a logout option.
 */
export default function CustomProfileMenu({ id, name, onLogout }: CustomProfileMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  return (
    <>
      <IconButton id={id} onClick={handleOpen} color="inherit" aria-label="perfil">
        <AccountCircle />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box className="profile-menu-header">
          <Typography variant="caption" color="text.secondary">
            Mi cuenta
          </Typography>
          <Typography variant="subtitle2" noWrap>
            {name}
          </Typography>
        </Box>

        <Divider />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Cerrar sesión
        </MenuItem>
      </Menu>
    </>
  );
}
