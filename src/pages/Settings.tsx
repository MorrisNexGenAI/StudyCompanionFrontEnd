import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useStore } from '../stores/useStore';
import { db, dbHelpers } from '../db/schema';
import { useNavigate } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
} from '@mui/material';
import {
  Apartment as DepartmentIcon,
  Storage,
  Info,
  DeleteForever,
} from '@mui/icons-material';

export const Settings = () => {
  const navigate = useNavigate();
  const clearSelectedDepartment = useStore((state) => state.clearSelectedDepartment);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [storageSize, setStorageSize] = useState<string>('0 KB');
  const [offlineCount, setOfflineCount] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const size = await dbHelpers.getStorageSize();
    const sizeKB = (size / 1024).toFixed(2);
    setStorageSize(`${sizeKB} KB`);

    const count = await db.downloadedTopics.count();
    setOfflineCount(count);
  };

  const handleChangeDepartment = () => {
    clearSelectedDepartment();
    navigate('/');
  };

  const handleClearAll = async () => {
    await dbHelpers.clearAll();
    setClearDialogOpen(false);
    loadStats();
    alert('All offline data cleared!');
  };

  return (
    <Layout title="Settings" showBack>
      <Paper>
        <List>
          {/* Change Department */}
          <ListItemButton onClick={handleChangeDepartment}>
            <DepartmentIcon sx={{ mr: 2, color: 'primary.main' }} />
            <ListItemText
              primary="Change Department"
              secondary="Select a different department"
            />
          </ListItemButton>

          <Divider />

          {/* Storage Info - Now Clickable */}
          <ListItemButton onClick={() => navigate('/downloads')}>
            <Storage sx={{ mr: 2, color: 'primary.main' }} />
            <ListItemText
              primary="My Downloads"
              secondary={`${offlineCount} topics • ${storageSize}`}
            />
          </ListItemButton>

          <Divider />

          {/* Clear All Data */}
          <ListItemButton onClick={() => setClearDialogOpen(true)}>
            <DeleteForever sx={{ mr: 2, color: 'error.main' }} />
            <ListItemText
              primary="Clear All Offline Data"
              secondary="Remove all downloaded topics"
            />
          </ListItemButton>

          <Divider />

          {/* App Info */}
          <ListItem>
            <Info sx={{ mr: 2, color: 'text.secondary' }} />
            <ListItemText
              primary="About"
              secondary="Study Companion v1.0.0"
            />
          </ListItem>
        </List>
      </Paper>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 3 }}>
        This app works offline! Download topics to access them without internet.
      </Alert>

      {/* Clear All Dialog */}
      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>Clear All Offline Data?</DialogTitle>
        <DialogContent>
          <Typography>
            This will delete all downloaded topics and cached data. You'll need to re-download them.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleClearAll} color="error" variant="contained">
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};