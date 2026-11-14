import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SkillModalProvider } from './context/SkillModalContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MobileNav } from './components/MobileNav';
import { MentorDrawer } from './components/MentorDrawer';

import { LandingPage } from './pages/LandingPage';
import { OnboardingWizard } from './pages/OnboardingWizard';
import { DashboardPage } from './pages/DashboardPage';
import { SkillAnalysisPage } from './pages/SkillAnalysisPage';
import { CareerMatchPage } from './pages/CareerMatchPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { ProgressPage } from './pages/ProgressPage';
import { MentorPage } from './pages/MentorPage';
import { AgentTracePage } from './pages/AgentTracePage';
import { OrgCohortPage } from './pages/OrgCohortPage';
import { SettingsPage } from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Minimal layout for landing and onboarding
  const isMinimal = location.pathname === '/' || location.pathname === '/onboard';

  if (isMinimal) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200">
      {/* Left Collapsible Sidebar (Desktop) */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Top Header Bar */}
        <TopBar onOpenMentor={() => setIsMentorOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Mobile Bottom Tab Navigation */}
        <MobileNav onOpenMentor={() => setIsMentorOpen(true)} />
      </div>

      {/* AI Mentor Slide-Over Drawer */}
      <MentorDrawer isOpen={isMentorOpen} onClose={() => setIsMentorOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
            <AuthProvider>
              <SkillModalProvider>
                <Layout>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/onboard" element={<OnboardingWizard />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/analysis" element={<SkillAnalysisPage />} />
                    <Route path="/match" element={<CareerMatchPage />} />
                    <Route path="/roadmap" element={<RoadmapPage />} />
                    <Route path="/assessments" element={<AssessmentPage />} />
                    <Route path="/progress" element={<ProgressPage />} />
                    <Route path="/mentor" element={<MentorPage />} />
                    <Route path="/trace" element={<AgentTracePage />} />
                    <Route path="/cohort" element={<OrgCohortPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </SkillModalProvider>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
