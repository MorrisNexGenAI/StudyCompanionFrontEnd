import type { ReactNode } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Container } from '@mui/material';
// @ts-ignore: No declaration file for '@mui/icons-material' in this project
import { ArrowBack, Settings as SettingsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  title: string;
  showBack?: boolean;
  showSettings?: boolean;
}

export const Layout = ({ children, title, showBack = false, showSettings = false }: LayoutProps) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar position="sticky" elevation={1}>
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
      
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  );
};
