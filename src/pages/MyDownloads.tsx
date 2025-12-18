import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { db } from '../db/schema';
import type { DownloadedTopic } from '../types';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CloudDone, MenuBook } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

export const MyDownloads = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<DownloadedTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    setLoading(true);
    const downloaded = await db.downloadedTopics.toArray();
    // Sort by most recently downloaded
    downloaded.sort((a, b) => b.downloaded_at - a.downloaded_at);
    setTopics(downloaded);
    setLoading(false);
  };

  const handleTopicClick = (topicId: number) => {
    navigate(`/topics/${topicId}`);
  };

  if (loading) {
    return (
      <Layout title="My Downloads" showBack showSettings>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (topics.length === 0) {
    return (
      <Layout title="My Downloads" showBack showSettings>
        <Box textAlign="center" py={8}>
          <MenuBook sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" mb={1}>
            No downloaded topics yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Download topics from course pages to read them offline
          </Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="My Downloads" showBack showSettings>
      <Alert severity="info" sx={{ mb: 3 }}>
        You have <strong>{topics.length}</strong> topic{topics.length > 1 ? 's' : ''} available offline
      </Alert>

      <Stack spacing={2}>
        {topics.map((topic) => (
          <Card
            key={topic.id}
            onClick={() => handleTopicClick(topic.id)}
            sx={{ cursor: 'pointer' }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="start">
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={600} mb={1}>
                    {topic.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mb={1}>
                    📚 {topic.course_name}
                  </Typography>

                  {topic.departments && (
                    <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                      {topic.departments.split(', ').map((dept, idx) => (
                        <Chip
                          key={idx}
                          label={dept}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  )}

                  {topic.page_range && (
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      📄 {topic.page_range}
                    </Typography>
                  )}

                  <Box display="flex" gap={1} alignItems="center">
                    <Chip
                      icon={<CloudDone />}
                      label="Offline"
                      size="small"
                      color="primary"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Downloaded {formatDistanceToNow(topic.downloaded_at, { addSuffix: true })}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Layout>
  );
};