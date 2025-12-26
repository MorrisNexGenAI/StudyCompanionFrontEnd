
import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { dbHelpers } from '../db/schema';
import type { PremiumProfile } from '../types';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { Person, Logout } from '@mui/icons-material';

export const Settings = () => {
  const [profile, setProfile] = useState<PremiumProfile | null>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const p = await dbHelpers.getPremiumProfile();
    setProfile(p || null);
  };

  const handleLogout = async () => {
    await dbHelpers.clearPremiumProfile();
    setLogoutDialogOpen(false);
    window.location.href = '/setup'; // Force reload to setup page
  };

  return (
    <Layout title="Settings" showBack>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Premium Account Section */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Person color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Premium Account
              </Typography>
            </Box>

            {profile ? (
              <>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    mb: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Name
                  </Typography>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    {profile.name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Personal Code
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{
                      fontFamily: 'monospace',
                      color: 'primary.main',
                    }}
                  >
                    {profile.code}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" mt={2} display="block">
                    Registered: {new Date(profile.registered_at).toLocaleDateString()}
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  startIcon={<Logout />}
                  onClick={() => setLogoutDialogOpen(true)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Log Out
                </Button>
              </>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                You are browsing as a guest. Set up premium account to access exclusive content.
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Your other settings sections here */}
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 3, p: 1 },
        }}
      >
        <DialogTitle fontWeight={600}>Log Out?</DialogTitle>
        <DialogContent>
          <Typography>
            You will need to re-enter your name and code to access premium content again.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
            Downloaded topics will remain accessible offline.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button onClick={handleLogout} color="error" variant="contained" sx={{ textTransform: 'none' }}>
            Log Out
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};