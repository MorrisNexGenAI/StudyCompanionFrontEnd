import { Box, Button, Typography } from '@mui/material';
import { ArrowBack, ArrowForward, CheckCircle } from '@mui/icons-material';

interface ChunkNavigationProps {
  currentChunk: number;
  totalChunks: number;
  onPrevious: () => void;
  onNext: () => void;
  onFinish?: () => void;
}

export const ChunkNavigation = ({
  currentChunk,
  totalChunks,
  onPrevious,
  onNext,
  onFinish,
}: ChunkNavigationProps) => {
  const isFirstChunk = currentChunk === 1;
  const isLastChunk = currentChunk === totalChunks;

  return (
    <Box 
      sx={{ 
        position: 'sticky',
        bottom: 0,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        p: 2,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
      }}
    >
      {/* Progress */}
      <Typography 
        variant="body2" 
        color="text.secondary" 
        textAlign="center" 
        mb={2}
      >
        Set {currentChunk} of {totalChunks}
      </Typography>

      {/* Buttons */}
      <Box display="flex" gap={2} justifyContent="space-between">
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={onPrevious}
          disabled={isFirstChunk}
          fullWidth
        >
          Previous
        </Button>

        {isLastChunk ? (
          <Button
            variant="contained"
            endIcon={<CheckCircle />}
            onClick={onFinish}
            fullWidth
            color="success"
          >
            Finish
          </Button>
        ) : (
          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={onNext}
            fullWidth
          >
            Next Set
          </Button>
        )}
      </Box>
    </Box>
  );
};