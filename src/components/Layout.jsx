import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Container,
} from '@mui/material';
import {
  Notifications,
  AccountCircle,
  Dashboard,
  AdminPanelSettings,
} from '@mui/icons-material';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Notifications sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
            Alert Platform
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
            {isAdmin() ? (
              <>
                <Button
                  color="inherit"
                  startIcon={<Dashboard />}
                  onClick={() => navigate('/admin/dashboard')}
                  sx={{
                    fontWeight: isActive('/admin/dashboard') ? 'bold' : 'normal',
                  }}
                >
                  Dashboard
                </Button>
                <Button
                  color="inherit"
                  startIcon={<Notifications />}
                  onClick={() => navigate('/admin/alerts')}
                  sx={{
                    fontWeight: isActive('/admin/alerts') ? 'bold' : 'normal',
                  }}
                >
                  Alerts
                </Button>
              </>
            ) : (
              <Button
                color="inherit"
                startIcon={<Dashboard />}
                onClick={() => navigate('/dashboard')}
                sx={{
                  fontWeight: isActive('/dashboard') ? 'bold' : 'normal',
                }}
              >
                My Alerts
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAdmin() && (
              <AdminPanelSettings sx={{ color: 'warning.light' }} />
            )}
            <Typography variant="body2">{user?.name}</Typography>
            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  Role: {user?.role}
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
        {children}
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: 'background.paper',
        }}
      >
        
      </Box>
    </Box>
  );
};

export default Layout;