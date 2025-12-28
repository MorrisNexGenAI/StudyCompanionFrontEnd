import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Collapse,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
// @ts-ignore: No declaration file
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import type { QuestionUnit } from '../types';

interface StudyCardProps {
  question: QuestionUnit;
  questionNumber: number;
  totalQuestions: number;
}

/**
 * Converts markdown table to MUI Table component
 */
const renderTable = (tableText: string) => {
  const lines = tableText.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    // Not a valid table, show as pre-formatted text
    return (
      <Box
        component="pre"
        sx={{
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          margin: 0,
          overflowX: 'auto',
        }}
      >
        {tableText}
      </Box>
    );
  }

  // Parse header
  const headerCells = lines[0]
    .split('|')
    .map(cell => cell.trim())
    .filter(cell => cell.length > 0);

  // Skip separator line (line with ---)
  const dataRows = lines.slice(2).map(line =>
    line
      .split('|')
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0)
  );

  return (
    <TableContainer 
      component={Paper} 
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'primary.main' }}>
            {headerCells.map((header, idx) => (
              <TableCell
                key={idx}
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  py: 1.5,
                  borderRight: idx < headerCells.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {dataRows.map((row, rowIdx) => (
            <TableRow 
              key={rowIdx} 
              sx={{ 
                '&:nth-of-type(odd)': { bgcolor: 'grey.50' },
                '&:nth-of-type(even)': { bgcolor: 'white' },
                '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.08)' },
                transition: 'background-color 0.2s',
              }}
            >
              {row.map((cell, cellIdx) => (
                <TableCell 
                  key={cellIdx} 
                  sx={{ 
                    fontSize: '0.875rem',
                    py: 1.25,
                    borderRight: cellIdx < row.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none',
                    // Make first column bold for better readability
                    fontWeight: cellIdx === 0 ? 600 : 400,
                    color: cellIdx === 0 ? 'primary.dark' : 'text.primary',
                  }}
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export const StudyCard = ({ question, questionNumber, totalQuestions }: StudyCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card 
      sx={{ 
        mb: 2,
        boxShadow: expanded ? '0 8px 24px rgba(102, 126, 234, 0.25)' : undefined,
        transition: 'all 0.3s ease',
      }}
    >
      <CardContent>
        {/* Progress Indicator */}
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ display: 'block', mb: 1 }}
        >
          Question {questionNumber} of {totalQuestions}
        </Typography>

        {/* Question */}
        <Typography 
          variant="h6" 
          fontWeight={600} 
          color="primary.main"
          sx={{ mb: 2 }}
        >
          {question.id}: {question.question}
        </Typography>

        {/* Answer Display */}
        {question.isTable ? (
          // TABLE DISPLAY - Full width with nice styling
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1.5}>
              Answer:
            </Typography>
            {renderTable(question.answer)}
          </Box>
        ) : (
          // REGULAR TEXT ANSWER
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'rgba(102, 126, 234, 0.1)', 
              borderRadius: 2,
              mb: 2,
              border: '1px solid rgba(102, 126, 234, 0.2)',
            }}
          >
            <Typography variant="body2" fontWeight={500} color="text.secondary" mb={0.5}>
              Answer:
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {question.answer}
            </Typography>
          </Box>
        )}

        {/* Expand/Collapse Button (Only for non-table questions with explanation/example) */}
        {!question.isTable && (question.explanation || question.example) && (
          <>
            <Box display="flex" justifyContent="center" mb={1}>
              <IconButton 
                onClick={() => setExpanded(!expanded)}
                size="small"
                sx={{ 
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>

            {/* Collapsible Content */}
            <Collapse in={expanded}>
              <Divider sx={{ mb: 2 }} />
              
              {/* Explanation */}
              {question.explanation && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight={500} color="text.secondary" mb={0.5}>
                    Explanation:
                  </Typography>
                  <Typography variant="body2">
                    {question.explanation}
                  </Typography>
                </Box>
              )}

              {/* Example */}
              {question.example && (
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(16, 185, 129, 0.1)', 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'success.main',
                  }}
                >
                  <Typography variant="body2" fontWeight={500} color="success.dark" mb={0.5}>
                    Example:
                  </Typography>
                  <Typography variant="body2" color="success.dark">
                    {question.example}
                  </Typography>
                </Box>
              )}
            </Collapse>
          </>
        )}
      </CardContent>
    </Card>
  );
};