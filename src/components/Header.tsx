// components/Header.tsx

import { Box, Typography, Container, Card, CardContent } from '@mui/material';
import { CloudDownload, MenuBook, CheckCircle } from '@mui/icons-material';
import '../styles/header.css';

interface HeaderProps {
  emoji: string;
  departmentName: string;
  userName: string;
  gradient: string;
  stats: {
    totalCourses: number;
    totalTopics: number;
    downloaded: number;
  };
}

export const Header = ({ emoji, departmentName, userName, gradient, stats }: HeaderProps) => {
  return (
    <Box className="header-wrapper">
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, px: { xs: 2, sm: 3 } }}>
        {/* Single Card with Mobile-First Layout */}
        <Card className="header-card glass-card">
          {/* Background Pattern */}
          <Box className="header-pattern" />
          <Box className="header-pattern-overlay" />
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            
            {/* Desktop Layout */}
            <Box className="header-desktop-layout">
              {/* Left: Department Info */}
              <Box className="department-info">
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography className="department-emoji-compact">
                    {emoji}
                  </Typography>
                  <Box>
                    <Typography 
                      variant="h4" 
                      className="department-name-compact"
                      sx={{ 
                        fontWeight: 800,
                        fontSize: { xs: '1.5rem', sm: '2rem' },
                        background: gradient,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        lineHeight: 1.2,
                        mb: 0.5
                      }}
                    >
                      {departmentName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 500, textShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
                      Welcome back, {userName}! 👋
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Right: Stats */}
              <Box className="stats-compact">
                <Box className="stat-item">
                  <Box className="stat-icon-compact" sx={{ bgcolor: 'primary.main' }}>
                    <MenuBook sx={{ fontSize: 20, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1 }}>
                      {stats.totalCourses}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Courses
                    </Typography>
                  </Box>
                </Box>

                <Box className="stat-item">
                  <Box className="stat-icon-compact" sx={{ bgcolor: 'success.main' }}>
                    <CheckCircle sx={{ fontSize: 20, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main', lineHeight: 1 }}>
                      {stats.totalTopics}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Topics
                    </Typography>
                  </Box>
                </Box>

                <Box className="stat-item">
                  <Box className="stat-icon-compact" sx={{ bgcolor: 'info.main' }}>
                    <CloudDownload sx={{ fontSize: 20, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'info.main', lineHeight: 1 }}>
                      {stats.downloaded}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Downloaded
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Mobile Layout */}
            <Box className="header-mobile-layout">
              {/* Department Name Card - Bold at top */}
              <Card className="mobile-department-card">
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography 
                    className="mobile-department-name"
                    sx={{ 
                      fontWeight: 900,
                      background: gradient,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textAlign: 'center',
                    }}
                  >
                    {departmentName}
                  </Typography>
                </CardContent>
              </Card>

              {/* Emoji - Center */}
              <Typography className="mobile-emoji" sx={{ textAlign: 'center', mb: 1.5 }}>
                {emoji}
              </Typography>

              {/* Welcome Message Card - Stretch */}
              <Card className="mobile-welcome-card">
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary', 
                      fontWeight: 500,
                      textAlign: 'center',
                    }}
                  >
                    Welcome back, {userName}! 👋
                  </Typography>
                </CardContent>
              </Card>

              {/* Stats Grid - Mobile Optimized */}
              <Box className="mobile-stats-grid">
                {/* Top Row: Topics (left) and Courses (right) */}
                <Box className="mobile-stat-card">
                  <Box className="mobile-stat-icon" sx={{ bgcolor: 'success.main' }}>
                    <CheckCircle sx={{ fontSize: 18, color: 'white' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main', lineHeight: 1, mb: 0.5 }}>
                    {stats.totalTopics}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem' }}>
                    Topics
                  </Typography>
                </Box>

                <Box className="mobile-stat-card">
                  <Box className="mobile-stat-icon" sx={{ bgcolor: 'primary.main' }}>
                    <MenuBook sx={{ fontSize: 18, color: 'white' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1, mb: 0.5 }}>
                    {stats.totalCourses}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem' }}>
                    Courses
                  </Typography>
                </Box>

                {/* Bottom Row: Downloaded (center, spans both columns) */}
                <Box className="mobile-stat-card mobile-stat-full">
                  <Box className="mobile-stat-icon" sx={{ bgcolor: 'info.main' }}>
                    <CloudDownload sx={{ fontSize: 18, color: 'white' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'info.main', lineHeight: 1, mb: 0.5 }}>
                    {stats.downloaded}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem' }}>
                    Downloaded
                  </Typography>
                </Box>
              </Box>
            </Box>

          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};