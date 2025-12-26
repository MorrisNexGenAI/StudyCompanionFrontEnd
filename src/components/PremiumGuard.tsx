import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { dbHelpers } from '../db/schema';

interface PremiumGuardProps {
  children: React.ReactNode;
}

export const PremiumGuard = ({ children }: PremiumGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      const hasProfile = await dbHelpers.hasPremiumProfile();
      
      // Only redirect to setup if we're not already there
      if (!hasProfile && location.pathname !== '/setup') {
        navigate('/setup');
      }
      
      setChecking(false);
    };

    checkProfile();
  }, [navigate, location.pathname]);

  if (checking) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
};