import { useState, useEffect } from 'react';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { Wifi, Cloud, Refresh, SignalWifiOff } from '@mui/icons-material';
import { getConnectionStatus, refreshServerDetection } from '../api/client';

export const ConnectionStatus = () => {
  const [status, setStatus] = useState(getConnectionStatus());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(async () => {
      const newStatus = await refreshServerDetection();
      setStatus({
        mode: newStatus.mode,
        baseURL: newStatus.url,
        isLocal: newStatus.mode === 'local',
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    const newStatus = await refreshServerDetection();
    setStatus({
      mode: newStatus.mode,
      baseURL: newStatus.url,
      isLocal: newStatus.mode === 'local',
    });
    setTimeout(() => setRefreshing(false), 500);
  };

  const icon = status.mode === 'local' ? (
    <Wifi sx={{ fontSize: 16 }} />
  ) : status.mode === 'online' ? (
    <Cloud sx={{ fontSize: 16 }} />
  ) : (
    <SignalWifiOff sx={{ fontSize: 16 }} />
  );

  const label = status.mode === 'local' 
    ? 'Connected Locally' 
    : status.mode === 'online'
    ? 'Online'
    : 'Offline';

  const color = status.mode === 'local' 
    ? 'success' 
    : status.mode === 'online'
    ? 'primary'
    : 'default';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Chip
        icon={icon}
        label={label}
        color={color}
        size="small"
        variant={status.mode === 'local' ? 'filled' : 'outlined'}
      />
      <Tooltip title="Check for local server">
        <IconButton 
          size="small" 
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{ 
            animation: refreshing ? 'spin 1s linear' : 'none',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            }
          }}
        >
          <Refresh sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};