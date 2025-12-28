import { Box, Typography, Paper, Stack } from '@mui/material';
import { StudyCard } from './StudyCard';
import type { StudyChunk } from '../types';

interface StudyChunkProps {
  chunk: StudyChunk;
  totalQuestions: number;
}

export const StudyChunkComponent = ({ chunk, totalQuestions }: StudyChunkProps) => {
  return (
    <Box>
      {/* Chunk Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 3, 
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Set {chunk.chunkNumber}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Questions {chunk.startIndex + 1}-{chunk.endIndex + 1} of {totalQuestions}
        </Typography>
      </Paper>

      {/* Cards */}
      <Stack spacing={2}>
        {chunk.questions.map((question, index) => (
          <StudyCard
            key={question.id}
            question={question}
            questionNumber={chunk.startIndex + index + 1}
            totalQuestions={totalQuestions}
          />
        ))}
      </Stack>
    </Box>
  );
};