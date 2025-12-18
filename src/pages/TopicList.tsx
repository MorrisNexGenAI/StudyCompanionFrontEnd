import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useTopics, useDownloadTopic } from '../hooks/useDepartments';
import { db } from '../db/schema';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  IconButton,
  Button,
} from '@mui/material';
import {
  CloudDownload,
  CheckCircle,
  Description,
  CloudDone,
} from '@mui/icons-material';

export const TopicList = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { data: topics, isLoading, error } = useTopics(Number(courseId));
  const downloadMutation = useDownloadTopic();
  const [downloadedIds, setDownloadedIds] = useState<number[]>([]);

  // Load downloaded topic IDs
  useEffect(() => {
    const loadDownloaded = async () => {
      const ids = await db.downloadedTopics.toCollection().primaryKeys();
      setDownloadedIds(ids as number[]);
    };
    loadDownloaded();
  }, [downloadMutation.isSuccess]);

  const handleDownload = async (topicId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await downloadMutation.mutateAsync(topicId);
  };

  const handleTopicClick = (topicId: number, isRefined: boolean) => {
    // Only navigate if topic has refined content
    if (isRefined) {
      navigate(`/topics/${topicId}`);
    } else {
      alert('This topic has no refined summary yet.');
    }
  };

  if (isLoading) {
    return (
      <Layout title="Topics" showBack>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Topics" showBack>
        <Alert severity="error">Failed to load topics. Please check your connection.</Alert>
      </Layout>
    );
  }

  if (!topics || topics.length === 0) {
    return (
      <Layout title="Topics" showBack>
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" mb={2}>
            No topics yet in this course
          </Typography>
          <Button variant="contained" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Topics" showBack>
      <Stack spacing={2}>
        {topics.map((topic) => {
          const isDownloaded = downloadedIds.includes(topic.id);
          const isDownloading = downloadMutation.isPending;

          return (
            <Card 
              key={topic.id} 
              onClick={() => handleTopicClick(topic.id, topic.is_refined)} 
              sx={{ 
                cursor: topic.is_refined ? 'pointer' : 'default',
                opacity: topic.is_refined ? 1 : 0.7,
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Box flex={1}>
                    <Typography variant="h6" fontWeight={600} mb={1}>
                      {topic.title}
                    </Typography>

                    {topic.page_range && (
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Description fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {topic.page_range}
                        </Typography>
                      </Box>
                    )}

                    <Box display="flex" gap={1} mt={2}>
                      {topic.is_refined ? (
                        <Chip
                          icon={<CheckCircle />}
                          label="Refined"
                          size="small"
                          color="success"
                        />
                      ) : (
                        <Chip
                          label="Raw Only"
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}

                      {isDownloaded && (
                        <Chip
                          icon={<CloudDone />}
                          label="Offline"
                          size="small"
                          color="primary"
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Download Button */}
                  {!isDownloaded && topic.is_refined && (
                    <IconButton
                      color="primary"
                      onClick={(e) => handleDownload(topic.id, e)}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <CircularProgress size={24} />
                      ) : (
                        <CloudDownload />
                      )}
                    </IconButton>
                  )}
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Layout>
  );
};