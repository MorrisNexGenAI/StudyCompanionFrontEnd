# Phase 3: Interactive Study Mode with Q&A Parsing (Frontend)

## Overview
Phase 3 transforms the Study Companion PWA from a passive reading tool into an active learning system. It implements intelligent Q&A parsing, chunking, and progressive disclosure to reduce cognitive load and increase learning effectiveness.

---

## The Problem We're Solving

### Before Phase 3:
- ❌ Students see walls of text (overwhelming)
- ❌ No clear learning progression
- ❌ Hard to track what's been studied
- ❌ No focus on individual concepts
- ❌ Difficult to review specific questions

### After Phase 3:
- ✅ One concept at a time (manageable)
- ✅ Clear progress indicators
- ✅ Trackable study sessions
- ✅ Focused attention on single Q&A
- ✅ Easy navigation between concepts

---

## Core Design Principles

### 1️⃣ One Learning Unit = One Main Idea

**Structure (Locked):**
```
Question → focuses attention
Answer (4-6 words) → the truth
Explanation (6-8 words) → why it's true
Example (5-7 words) → make it real
```

**Why this works:**
- Cognitive load theory: working memory holds ~7 items
- Each unit is self-contained
- No need to reference other sections
- Immediate reinforcement loop

---

### 2️⃣ Chunking Rule

**5 questions per chunk (max 6)**

**Why 5?**
- Psychological research: people naturally group in 5s
- Reduces anxiety ("I can finish this")
- Creates natural break points
- Builds momentum through small wins

**Math:**
```
20 total questions = 4 chunks
Chunk 1: Q1-Q5
Chunk 2: Q6-Q10
Chunk 3: Q11-Q15
Chunk 4: Q16-Q20

Student mindset: "Just 5 questions" (not "20 questions")
```

---

### 3️⃣ Progressive Disclosure

**Default State:**
- Question visible
- Answer visible
- Explanation/Example collapsed

**Why?**
- Gives students control
- Reduces information overload
- Encourages active recall first
- Optional depth when needed

**User Flow:**
```
1. Read question → Try to recall
2. Read answer → Check understanding
3. Tap to expand → Get more context (if needed)
4. Tap again → Collapse (declutter)
```

---

## Part A: Q&A Parser Implementation

### 1. Parser Logic

**Location:** `src/utils/qaParser.ts`

**Input Format (from Backend AI):**
```
Q1: What causes malaria transmission?
Answer: Infected female Anopheles mosquito bite

Explanation: Parasite enters bloodstream and infects red cells

Example: Monrovia rainy season increases mosquito breeding

---

Q2: What key roles do microbes play?
Answer: Nutrient cycling, biodegradation, disease, biotechnology

Explanation: Essential for environment, food, and human health

Example: Gut bacteria help digest food

---

Q3: What are the three types of rocks?
Answer:
| Rock Type | Formation | Example |
|-----------|-----------|---------|
| Igneous | Cooled magma | Granite |
| Sedimentary | Compressed layers | Limestone |
| Metamorphic | Heat and pressure | Marble |

---
```

**Output Structure:**
```typescript
interface ParsedContent {
  totalQuestions: number;
  chunks: StudyChunk[];
  rawText: string;
}

interface StudyChunk {
  chunkNumber: number;     // 1, 2, 3...
  questions: QuestionUnit[];
  startIndex: number;      // 0, 5, 10...
  endIndex: number;        // 4, 9, 14...
}

interface QuestionUnit {
  id: string;              // "Q1", "Q2"
  question: string;
  answer: string;
  explanation?: string;    // undefined for tables
  example?: string;        // undefined for tables
  isTable: boolean;
}
```

---

### 2. Parser Implementation

**File:** `src/utils/qaParser.ts`

**Key Functions:**

```typescript
export function parseQAContent(rawText: string): ParsedContent {
  // 1. Split by --- separator
  const blocks = rawText
    .split(/\n\s*---\s*\n/)
    .filter(block => block.trim());

  const questions: QuestionUnit[] = [];

  blocks.forEach((block) => {
    // 2. Extract Q number and question
    const qMatch = block.match(/^Q(\d+):\s*(.+?)$/m);
    if (!qMatch) return;

    const qNumber = qMatch[1];
    const question = qMatch[2].trim();

    // 3. Extract everything after "Answer:"
    const afterAnswer = block.substring(block.indexOf('Answer:') + 7).trim();

    // 4. Detect if answer is a table
    const isTable = /\|[\s\-:]+\|[\s\-:]+\|/.test(afterAnswer);

    if (isTable) {
      // TABLE: No Explanation/Example
      const tableLines = afterAnswer.split('\n').filter(line => line.includes('|'));
      questions.push({
        id: `Q${qNumber}`,
        question,
        answer: tableLines.join('\n'),
        isTable: true,
      });
    } else {
      // TEXT: Extract Answer, Explanation, Example
      const explStart = block.indexOf('\nExplanation:');
      const exStart = block.indexOf('\nExample:');

      const answer = explStart > -1
        ? afterAnswer.substring(0, explStart - block.indexOf('Answer:') - 7).trim()
        : (exStart > -1
          ? afterAnswer.substring(0, exStart - block.indexOf('Answer:') - 7).trim()
          : afterAnswer.trim());

      const explanation = explStart > -1
        ? (exStart > -1
          ? block.substring(explStart + 13, exStart).trim()
          : block.substring(explStart + 13).trim())
        : undefined;

      const example = exStart > -1
        ? block.substring(exStart + 9).trim()
        : undefined;

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

  // 5. Create chunks of 5
  const chunks = createChunks(questions);

  return {
    totalQuestions: questions.length,
    chunks,
    rawText,
  };
}

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
```

---

### 3. Error Handling

**Validation:**
```typescript
export function isContentParseable(text: string): boolean {
  const hasQuestions = /Q\d+:/g.test(text);
  const hasAnswers = /Answer:/g.test(text);
  return hasQuestions && hasAnswers;
}
```

**Usage:**
```typescript
if (!isContentParseable(topicContent)) {
  // Fallback: show raw text
  return <RawTextView content={topicContent} />;
}

// Parse and render study mode
const parsed = parseQAContent(topicContent);
```

---

## Part B: Study Card Component

### 1. Component Design

**Location:** `src/components/StudyCard.tsx`

**Features:**
- Question display (always visible)
- Answer display (highlighted)
- Expand/collapse for Explanation + Example
- Table rendering support
- Progress indicator
- Smooth animations

**Props:**
```typescript
interface StudyCardProps {
  question: QuestionUnit;
  questionNumber: number;    // 1-5 within chunk
  totalQuestions: number;    // Total in chunk (usually 5)
}
```

---

### 2. Visual Design

**Card States:**

**Collapsed (Default):**
```
┌─────────────────────────────────────────┐
│ Question 2 of 5                         │
│                                         │
│ Q2: What causes malaria transmission?  │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Answer:                             ││
│ │ Infected mosquito bite transmits    ││
│ │ parasite                            ││
│ └─────────────────────────────────────┘│
│                                         │
│              [▼ Expand]                 │
└─────────────────────────────────────────┘
```

**Expanded:**
```
┌─────────────────────────────────────────┐
│ Question 2 of 5                         │
│                                         │
│ Q2: What causes malaria transmission?  │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Answer:                             ││
│ │ Infected mosquito bite transmits    ││
│ │ parasite                            ││
│ └─────────────────────────────────────┘│
│                                         │
│              [▲ Collapse]               │
│ ─────────────────────────────────────  │
│                                         │
│ Explanation:                            │
│ Parasite enters bloodstream and         │
│ infects red cells                       │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Example:                            ││
│ │ Monrovia rainy season increases     ││
│ │ mosquito breeding                   ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

**Table Answer:**
```
┌─────────────────────────────────────────┐
│ Question 3 of 5                         │
│                                         │
│ Q3: What are the three types of rocks? │
│                                         │
│ Answer:                                 │
│ ┌─────────────────────────────────────┐│
│ │ Rock Type  │ Formation   │ Example  ││
│ │────────────┼─────────────┼──────────││
│ │ Igneous    │ Cooled mag  │ Granite  ││
│ │ Sedimentar │ Compressed  │ Limeston ││
│ │ Metamorphi │ Heat/pressu │ Marble   ││
│ └─────────────────────────────────────┘│
│                                         │
│ (No expand button - tables are complete)│
└─────────────────────────────────────────┘
```

---

### 3. Table Rendering

**Function:** `renderTable(tableText: string)`

**Features:**
- Parses markdown tables
- Renders with MUI Table components
- Styled header row
- Alternating row colors
- Hover effects
- Responsive overflow

**Implementation:**
```typescript
const renderTable = (tableText: string) => {
  const lines = tableText.split('\n').filter(line => line.trim());
  
  // Parse header
  const headerCells = lines[0]
    .split('|')
    .filter(cell => cell.trim());

  // Parse data rows (skip separator line)
  const dataRows = lines.slice(2).map(line =>
    line.split('|').filter(cell => cell.trim())
  );

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'primary.main' }}>
            {headerCells.map((header, idx) => (
              <TableCell key={idx} sx={{ color: 'white', fontWeight: 700 }}>
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {dataRows.map((row, rowIdx) => (
            <TableRow key={rowIdx} sx={{ '&:hover': { bgcolor: 'rgba(102,126,234,0.08)' } }}>
              {row.map((cell, cellIdx) => (
                <TableCell key={cellIdx}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
```

---

## Part C: Study Mode Page

### 1. Page Structure

**Location:** `src/pages/StudyModePage.tsx`

**Components:**
```
StudyModePage
├── Header (Progress + Exit)
├── ChunkSelector (if multiple chunks)
├── StudyCard[] (5 questions)
└── Navigation (Previous/Next Chunk)
```

**State Management:**
```typescript
const [currentChunk, setCurrentChunk] = useState(0);
const [parsedContent, setParsedContent] = useState<ParsedContent | null>(null);
```

---

### 2. Navigation Flow

**Chunk Navigation:**
```
Chunk 1 (Q1-Q5) → [Next Chunk] → Chunk 2 (Q6-Q10)
                ← [Previous]   ←

Progress: "Chunk 1 of 4"
```

**Within Chunk:**
```
[Q1 Card - Expanded]
[Q2 Card - Collapsed] ← Tap to expand
[Q3 Card - Collapsed]
[Q4 Card - Collapsed]
[Q5 Card - Collapsed]

User scrolls naturally
Each card independent
```

---

### 3. Progress Tracking

**Local Storage:**
```typescript
interface StudyProgress {
  topic_id: number;
  current_chunk: number;
  completed_chunks: number[];
  last_studied: number;  // timestamp
}
```

**Save Progress:**
```typescript
const saveProgress = async (topicId: number, chunkNumber: number) => {
  const progress: StudyProgress = {
    topic_id: topicId,
    current_chunk: chunkNumber,
    completed_chunks: [1, 2], // example
    last_studied: Date.now(),
  };
  
  await db.studyProgress.put(progress);
};
```

**Load Progress:**
```typescript
const loadProgress = async (topicId: number) => {
  const progress = await db.studyProgress.get(topicId);
  if (progress) {
    setCurrentChunk(progress.current_chunk);
  }
};
```

---

## Part D: User Experience Flow

### 1. Entry Point

**From Topic Detail Page:**
```
┌─────────────────────────────────────────┐
│ Cell Division - Pages 5-8               │
│                                         │
│ [📖 Read Full Text]                     │
│ [🎯 Study Mode]  ← NEW BUTTON           │
│ [⬇️ Download]                           │
└─────────────────────────────────────────┘
```

**Button Logic:**
```typescript
const handleStudyMode = () => {
  if (!isContentParseable(topic.refined_summary)) {
    alert('This topic is not in Q&A format yet');
    return;
  }
  
  navigate(`/topics/${topicId}/study`);
};
```

---

### 2. Study Session

**Step 1: Load Content**
```typescript
useEffect(() => {
  const content = parseQAContent(topic.refined_summary);
  setParsedContent(content);
  
  // Load saved progress
  loadProgress(topicId).then(setCurrentChunk);
}, [topicId]);
```

**Step 2: Display Chunk**
```typescript
const currentChunkData = parsedContent?.chunks[currentChunk];

return (
  <Box>
    <Typography variant="h6">
      Chunk {currentChunk + 1} of {parsedContent?.chunks.length}
    </Typography>
    
    {currentChunkData?.questions.map((q, index) => (
      <StudyCard
        key={q.id}
        question={q}
        questionNumber={index + 1}
        totalQuestions={currentChunkData.questions.length}
      />
    ))}
  </Box>
);
```

**Step 3: Navigate**
```typescript
const handleNextChunk = () => {
  if (currentChunk < parsedContent!.chunks.length - 1) {
    const nextChunk = currentChunk + 1;
    setCurrentChunk(nextChunk);
    saveProgress(topicId, nextChunk);
    window.scrollTo(0, 0);
  }
};
```

---

### 3. Exit Confirmation

**Prevent Accidental Exit:**
```typescript
const handleExit = () => {
  const confirmed = window.confirm(
    'Exit study mode? Your progress will be saved.'
  );
  
  if (confirmed) {
    saveProgress(topicId, currentChunk);
    navigate(`/topics/${topicId}`);
  }
};
```

---

## Part E: Visual Design Guidelines

### 1. Color System

**Question:**
- Text: Primary color (#667eea)
- Font weight: 600 (semibold)
- Font size: 1.25rem (h6)

**Answer:**
- Background: Light blue (rgba(102, 126, 234, 0.1))
- Border: Blue (rgba(102, 126, 234, 0.2))
- Text: Dark gray (#333)
- Font weight: 600

**Explanation:**
- Background: None
- Text: Gray (#666)
- Font weight: 400 (normal)

**Example:**
- Background: Light green (rgba(16, 185, 129, 0.1))
- Border: Green (#10b981)
- Text: Dark green (#047857)
- Font weight: 500

**Table:**
- Header: Primary color background, white text
- Rows: Alternating gray/white
- Hover: Light blue tint
- Borders: Light gray

---

### 2. Spacing System

**Card Padding:**
- Outer: 16px
- Inner sections: 12px
- Between elements: 8px

**Typography Spacing:**
- Section labels: 4px bottom margin
- Paragraphs: 8px bottom margin
- Between sections: 16px

**Chunk Spacing:**
- Between cards: 16px
- Chunk separator: 24px

---

### 3. Animation

**Expand/Collapse:**
```typescript
<Collapse in={expanded} timeout={300}>
  {/* Explanation + Example */}
</Collapse>
```

**Card Shadow:**
```typescript
sx={{
  boxShadow: expanded 
    ? '0 8px 24px rgba(102, 126, 234, 0.25)' 
    : undefined,
  transition: 'all 0.3s ease',
}}
```

**Smooth Scroll:**
```typescript
window.scrollTo({
  top: 0,
  behavior: 'smooth'
});
```

---

## Part F: Performance Optimization

### 1. Parser Caching

**Cache parsed content:**
```typescript
const [parsedCache, setParsedCache] = useState<Map<number, ParsedContent>>(new Map());

const getParsedContent = (topicId: number, rawText: string) => {
  if (parsedCache.has(topicId)) {
    return parsedCache.get(topicId)!;
  }
  
  const parsed = parseQAContent(rawText);
  setParsedCache(prev => new Map(prev).set(topicId, parsed));
  return parsed;
};
```

---

### 2. Lazy Rendering

**Only render current chunk:**
```typescript
// Don't render all chunks at once
const currentChunkData = parsedContent?.chunks[currentChunk];

return (
  <>
    {/* Only render current chunk */}
    {currentChunkData?.questions.map((q) => (
      <StudyCard key={q.id} question={q} />
    ))}
  </>
);
```

---

### 3. Progressive Loading

**For large topics:**
```typescript
const [loadedChunks, setLoadedChunks] = useState<Set<number>>(new Set([0]));

useEffect(() => {
  // Preload next chunk
  if (currentChunk < parsedContent!.chunks.length - 1) {
    setLoadedChunks(prev => new Set(prev).add(currentChunk + 1));
  }
}, [currentChunk]);
```

---

## Part G: Accessibility

### 1. Keyboard Navigation

**Support keyboard users:**
```typescript
const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'ArrowRight') handleNextChunk();
  if (e.key === 'ArrowLeft') handlePreviousChunk();
  if (e.key === 'Escape') handleExit();
};

useEffect(() => {
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

---

### 2. Screen Reader Support

**ARIA labels:**
```typescript
<Box role="region" aria-label="Study flashcard">
  <Typography variant="h6" aria-label="Question">
    {question.question}
  </Typography>
  
  <Box aria-label="Answer">
    {question.answer}
  </Box>
  
  <IconButton
    aria-label={expanded ? "Collapse details" : "Expand details"}
    onClick={() => setExpanded(!expanded)}
  >
    {expanded ? <ExpandLess /> : <ExpandMore />}
  </IconButton>
</Box>
```

---

### 3. Focus Management

**Auto-focus on chunk change:**
```typescript
const chunkRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  chunkRef.current?.focus();
}, [currentChunk]);

return (
  <Box ref={chunkRef} tabIndex={-1}>
    {/* Chunk content */}
  </Box>
);
```

---

## Part H: Error Handling

### 1. Parsing Failures

**Graceful degradation:**
```typescript
try {
  const parsed = parseQAContent(rawText);
  setParsedContent(parsed);
} catch (error) {
  console.error('Parse error:', error);
  setError('Unable to parse content. Showing raw text instead.');
  setFallbackMode(true);
}

if (fallbackMode) {
  return <RawTextView content={rawText} />;
}
```

---

### 2. Incomplete Content

**Validate before rendering:**
```typescript
if (parsedContent.totalQuestions === 0) {
  return (
    <Alert severity="warning">
      No questions found in this topic. Please check the content format.
    </Alert>
  );
}

if (parsedContent.chunks.length === 0) {
  return (
    <Alert severity="error">
      Unable to create study chunks. Content may be malformed.
    </Alert>
  );
}
```

---

### 3. Progress Save Failures

**Silent failure with retry:**
```typescript
const saveProgress = async (topicId: number, chunkNumber: number) => {
  try {
    await db.studyProgress.put({ topic_id: topicId, current_chunk: chunkNumber });
  } catch (error) {
    console.error('Failed to save progress:', error);
    // Retry once
    setTimeout(() => {
      db.studyProgress.put({ topic_id: topicId, current_chunk: chunkNumber })
        .catch(e => console.error('Retry failed:', e));
    }, 1000);
  }
};
```

---

## Part I: Testing Strategy

### Unit Tests

**Parser Tests:**
```typescript
describe('parseQAContent', () => {
  it('should parse simple Q&A', () => {
    const input = 'Q1: Test?\nAnswer: Test answer\n---';
    const result = parseQAContent(input);
    expect(result.totalQuestions).toBe(1);
    expect(result.chunks[0].questions[0].answer).toBe('Test answer');
  });

  it('should handle tables', () => {
    const input = 'Q1: Test?\nAnswer:\n| A | B |\n|---|---|\n| 1 | 2 |\n---';
    const result = parseQAContent(input);
    expect(result.chunks[0].questions[0].isTable).toBe(true);
  });

  it('should create correct number of chunks', () => {
    const input = Array(12).fill(0)
      .map((_, i) => `Q${i+1}: Test?\nAnswer: Test\n---`)
      .join('\n');
    const result = parseQAContent(input);
    expect(result.chunks.length).toBe(3); // 12 questions = 3 chunks
  });
});
```

---

### Integration Tests

**Study Mode Flow:**
```typescript
describe('StudyModePage', () => {
  it('should load and display first chunk', async () => {
    render(<StudyModePage />);
    await waitFor(() => {
      expect(screen.getByText('Chunk 1 of 4')).toBeInTheDocument();
    });
  });

  it('should navigate to next chunk', async () => {
    render(<StudyModePage />);
    const nextButton = screen.getByText('Next Chunk');
    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.getByText('Chunk 2 of 4')).toBeInTheDocument();
    });
  });

  it('should expand/collapse cards', () => {
    render(<StudyCard question={mockQuestion} />);
    const expandButton = screen.getByLabelText('Expand details');
    fireEvent.click(expandButton);
    expect(screen.getByText(mockQuestion.explanation!)).toBeVisible();
  });
});
```

---

## Part J: Future Enhancements

### Phase 4 Features

**Spaced Repetition:**
- Track answer confidence (Easy/Medium/Hard)
- Schedule reviews based on forgetting curve
- Show "due for review" count

**Study Statistics:**
- Time spent per chunk
- Questions reviewed
- Average completion time
- Weak areas identified

**Collaborative Features:**
- Share study progress with classmates
- Group study sessions
- Leaderboards (optional)

**Advanced Navigation:**
- Jump to specific question
- Bookmark difficult questions
- Filter by topic/keyword

---

## Key Achievements

1. ✅ **Intelligent Parsing** - Converts AI text to structured Q&A
2. ✅ **Chunking System** - 5 questions per chunk (psychological safety)
3. ✅ **Progressive Disclosure** - Show/hide details on demand
4. ✅ **Table Support** - Beautiful rendering of structured data
5. ✅ **Progress Tracking** - Resume where you left off
6. ✅ **Distraction-Free** - One concept at a time
7. ✅ **Offline Support** - Works without internet
8. ✅ **Responsive Design** - Mobile-first interface

---

## Summary

Phase 3 transforms study notes into an **active learning tool** by:

- **Reducing cognitive load** (5 questions at a time)
- **Increasing control** (expand/collapse on demand)
- **Building momentum** (small wins through chunks)
- **Tracking progress** (know where you are)
- **Focusing attention** (one concept at a time)

The result: **Students actually use the app to study, not just read.**

---

**Phase 3 Complete! 🎉**

Students now have a powerful, distraction-free study tool that respects their cognitive limits and helps them learn effectively.