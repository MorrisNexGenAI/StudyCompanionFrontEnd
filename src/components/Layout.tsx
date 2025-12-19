import type { ReactNode } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { ArrowBack, Settings as SettingsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  title: string;
  showBack?: boolean;
  showSettings?: boolean;
  transparentHeader?: boolean; // New prop for hero pages
}

export const Layout = ({ 
  children, 
  title, 
  showBack = false, 
  showSettings = false,
  transparentHeader = false 
}: LayoutProps) => {
  const navigate = useNavigate();

  // For department select page, don't show AppBar (hero replaces it)
  if (title === 'Study Companion' && !showBack) {
    return <Box sx={{ minHeight: '100vh' }}>{children}</Box>;
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar 
        position="sticky" 
        elevation={transparentHeader ? 0 : 1}
        sx={{
          backgroundColor: transparentHeader ? 'transparent' : 'primary.main',
        }}
      >
        <Toolbar>
          {showBack && (
            <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
          )}
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            {title}
          </Typography>
          
          {showSettings && (
            <IconButton color="inherit" onClick={() => navigate('/settings')}>
              <SettingsIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      
      {children}
    </Box>
  );
};