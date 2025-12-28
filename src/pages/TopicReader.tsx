import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { StudyChunkComponent } from '../components/StudyChunk';
import { ChunkNavigation } from '../components/ChunkNavigation';
import { useTopic, useDeleteDownloadedTopic } from '../hooks/useDepartments';
import { parseQAContent, isContentParseable } from '../utils/contentParser';
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  Paper,
  Chip,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
// @ts-ignore: No declaration file
import { Share, Delete, CloudDone } from '@mui/icons-material';

export const TopicReader = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { data: topic, isLoading, error } = useTopic(Number(topicId));
  const deleteMutation = useDeleteDownloadedTopic();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);

  const handleShare = async () => {
    if (!topic) return;

    const text = `${topic.title}\n\n${topic.refined_summary}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: topic.title,
          text: text,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(Number(topicId));
    setDeleteDialogOpen(false);
    navigate(-1);
  };

  const handlePrevious = () => {
    if (currentChunkIndex > 0) {
      setCurrentChunkIndex(currentChunkIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (parsedContent && currentChunkIndex < parsedContent.chunks.length - 1) {
      setCurrentChunkIndex(currentChunkIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinish = () => {
    // Could add completion tracking here
    navigate(-1);
  };

  if (isLoading) {
    return (
      <Layout title="Topic" showBack>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error || !topic) {
    return (
      <Layout title="Topic" showBack>
        <Alert severity="error">Failed to load topic. Please check your connection.</Alert>
      </Layout>
    );
  }

  // Parse content
  const refinedText = topic.refined_summary || '';
  const isParseable = isContentParseable(refinedText);
  const parsedContent = isParseable ? parseQAContent(refinedText) : null;
  const currentChunk = parsedContent?.chunks[currentChunkIndex];

  return (
    <Layout title={topic.title} showBack>
      {/* Header Info */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            <strong>Course:</strong> {topic.course_name}
          </Typography>

          {topic.departments.length > 0 && (
            <Box display="flex" flexWrap="wrap" gap={1}>
              {topic.departments.map((dept, idx) => (
                <Chip key={idx} label={dept} size="small" color="secondary" variant="outlined" />
              ))}
            </Box>
          )}

          {topic.page_range && (
            <Typography variant="body2" color="text.secondary">
              <strong>Pages:</strong> {topic.page_range}
            </Typography>
          )}

          {/* Action Buttons */}
          <Box display="flex" gap={1}>
            <IconButton color="primary" onClick={handleShare}>
              <Share />
            </IconButton>
            <IconButton color="error" onClick={() => setDeleteDialogOpen(true)}>
              <Delete />
            </IconButton>
            <Chip icon={<CloudDone />} label="Offline" size="small" color="primary" />
          </Box>
        </Stack>
      </Paper>

      {/* Content Display */}
      {!isParseable ? (
        // Fallback: Show raw text if not parseable
        <>
          <Alert severity="info" sx={{ mb: 2 }}>
            This content is not in the expected Q&A format. Showing raw text.
          </Alert>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="body1"
              component="pre"
              sx={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              {refinedText || 'No refined summary available.'}
            </Typography>
          </Paper>
        </>
      ) : (
        // New Card-Based Display
        <>
          {currentChunk && (
            <StudyChunkComponent 
              chunk={currentChunk} 
              totalQuestions={parsedContent.totalQuestions}
            />
          )}

          {parsedContent && (
            <ChunkNavigation
              currentChunk={currentChunkIndex + 1}
              totalChunks={parsedContent.chunks.length}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onFinish={handleFinish}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Offline Copy?</DialogTitle>
        <DialogContent>
          <Typography>
            This will remove the offline copy. You can download it again later.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};