import type { QuestionUnit, StudyChunk, ParsedContent } from '../types';

/**
 * Parses AI-generated Q&A text into structured question units
 */
export function parseQAContent(rawText: string): ParsedContent {
  // Split by --- on its own line (with optional whitespace)
  const blocks = rawText
    .split(/\n\s*---\s*\n/)
    .map(block => block.trim())
    .filter(block => block.length > 0);

  const questions: QuestionUnit[] = [];

  blocks.forEach((block) => {
    // Extract Q number and question
    const qMatch = block.match(/^Q(\d+):\s*(.+?)$/m);
    if (!qMatch) return; // Skip invalid blocks

    const qNumber = qMatch[1];
    const question = qMatch[2].trim();

    // Find where "Answer:" starts
    const answerIndex = block.indexOf('Answer:');
    if (answerIndex === -1) return; // Skip if no answer

    // Extract everything after "Answer:"
    const afterAnswer = block.substring(answerIndex + 7).trim(); // 7 = length of "Answer:"

    // Check if this contains a table
    // Table has: pipe characters AND a separator row like |---|---|---|---|
    const hasTableSeparator = /\|[\s\-:]+\|[\s\-:]+\|/.test(afterAnswer);
    const hasPipeStructure = afterAnswer.includes('|');
    const isTable = hasTableSeparator && hasPipeStructure;

    if (isTable) {
      // Table answer - extract only the table, no Explanation or Example
      // Tables in your format go from first | to last | line
      const tableLines = afterAnswer.split('\n').filter(line => line.trim().includes('|'));
      const answer = tableLines.join('\n').trim();

      questions.push({
        id: `Q${qNumber}`,
        question,
        answer,
        explanation: undefined,
        example: undefined,
        isTable: true,
      });
    } else {
      // Regular text answer - may have Explanation and/or Example
      
      // Use regex to find sections more precisely
      const explanationMatch = block.match(/\nExplanation:\s*(.+?)(?=\nExample:|$)/s);
      const exampleMatch = block.match(/\nExample:\s*(.+?)$/s);

      let answer: string;
      
      if (explanationMatch) {
        // Extract answer: everything after "Answer:" until "\nExplanation:"
        const explStart = block.indexOf('\nExplanation:');
        answer = block.substring(answerIndex + 7, explStart).trim();
      } else if (exampleMatch) {
        // Extract answer: everything after "Answer:" until "\nExample:"
        const exStart = block.indexOf('\nExample:');
        answer = block.substring(answerIndex + 7, exStart).trim();
      } else {
        // Just answer, no Explanation or Example
        answer = afterAnswer.trim();
      }

      const explanation = explanationMatch ? explanationMatch[1].trim() : undefined;
      const example = exampleMatch ? exampleMatch[1].trim() : undefined;

      questions.push({
        id: `Q${qNumber}`,
        question,
        answer,
        explanation,
        example,
        isTable: false,
      });
    }
  });

  // Group into chunks of 5 questions
  const chunks = createChunks(questions);

  return {
    totalQuestions: questions.length,
    chunks,
    rawText,
  };
}

/**
 * Groups questions into chunks of 5 questions each
 */
function createChunks(questions: QuestionUnit[]): StudyChunk[] {
  const CHUNK_SIZE = 5;
  const chunks: StudyChunk[] = [];

  for (let i = 0; i < questions.length; i += CHUNK_SIZE) {
    const chunkQuestions = questions.slice(i, i + CHUNK_SIZE);
    chunks.push({
      chunkNumber: Math.floor(i / CHUNK_SIZE) + 1,
      questions: chunkQuestions,
      startIndex: i,
      endIndex: i + chunkQuestions.length - 1,
    });
  }

  return chunks;
}

/**
 * Validates if content is parseable
 */
export function isContentParseable(text: string): boolean {
  // Check if text has Q&A structure
  const hasQuestions = /Q\d+:/g.test(text);
  const hasAnswers = /Answer:/g.test(text);
  return hasQuestions && hasAnswers;
}