import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { DepartmentSelect } from './pages/DepartmentSelect';
import { CourseList } from './pages/CourseList';
import { TopicList } from './pages/TopicList';
import { TopicReader } from './pages/TopicReader';
import { Settings } from './pages/Settings';
import { MyDownloads } from './pages/MyDownloads';
import { useStore } from './stores/useStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AppRoutes() {
  const selectedDeptId = useStore((state) => state.selectedDepartmentId);

  return (
    <Routes>
      <Route path="/" element={<DepartmentSelect />} />
      <Route
        path="/courses"
        element={selectedDeptId ? <CourseList /> : <Navigate to="/" replace />}
      />
      <Route path="/courses/:courseId/topics" element={<TopicList />} />
      <Route path="/topics/:topicId" element={<TopicReader />} />
      <Route path="/downloads" element={<MyDownloads />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;