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
import { PremiumSetup } from './pages/PremiumSetup'; // NEW
import { PremiumGuard } from './components/PremiumGuard'; // NEW
import { useStore } from './stores/useStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AppRoutes() {
  const selectedDeptId = useStore((state) => state.selectedDepartmentId);

  return (
    <Routes>
      {/* Premium Setup - First Page */}
      <Route path="/setup" element={<PremiumSetup />} />
      
      {/* Main App Routes with Premium Guard */}
      <Route
        path="/"
        element={
          <PremiumGuard>
            <DepartmentSelect />
          </PremiumGuard>
        }
      />
      <Route
        path="/courses"
        element={
          <PremiumGuard>
            {selectedDeptId ? <CourseList /> : <Navigate to="/" replace />}
          </PremiumGuard>
        }
      />
      <Route
        path="/courses/:courseId/topics"
        element={
          <PremiumGuard>
            <TopicList />
          </PremiumGuard>
        }
      />
      <Route
        path="/topics/:topicId"
        element={
          <PremiumGuard>
            <TopicReader />
          </PremiumGuard>
        }
      />
      <Route
        path="/downloads"
        element={
          <PremiumGuard>
            <MyDownloads />
          </PremiumGuard>
        }
      />
      <Route
        path="/settings"
        element={
          <PremiumGuard>
            <Settings />
          </PremiumGuard>
        }
      />
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