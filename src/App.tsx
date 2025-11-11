import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import PageErrorBoundary from './components/PageErrorBoundary';
import ErrorNotification from './components/ErrorNotification';
import { useWorkflowStore } from './store/workflowStore';
import { workflowTemplates } from './data/templates';
import { usePageTracking } from './hooks/usePageTracking';

// Lazy load pages for code splitting and improved initial load time
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const MentalModels = lazy(() => import('./pages/MentalModels'));
const WorkflowList = lazy(() => import('./pages/WorkflowList'));
const WorkflowDetail = lazy(() => import('./pages/WorkflowDetail'));
const WorkflowEditorFull = lazy(() => import('./pages/WorkflowEditorFull'));
const AgentManagement = lazy(() => import('./pages/AgentManagement'));
const Templates = lazy(() => import('./pages/Templates'));
const Settings = lazy(() => import('./pages/Settings'));
const Analytics = lazy(() => import('./pages/Analytics'));
const TokenUsage = lazy(() => import('./pages/TokenUsage'));
const ExecutionMonitor = lazy(() => import('./pages/ExecutionMonitor'));
const ErrorLogs = lazy(() => import('./pages/ErrorLogs'));
const TeamMembers = lazy(() => import('./pages/TeamMembers'));
const APIKeys = lazy(() => import('./pages/APIKeys'));
const Notifications = lazy(() => import('./pages/Notifications'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Main content of the app
const AppContent: React.FC = () => {
  const addTemplate = useWorkflowStore((state) => state.addTemplate);
  const templates = useWorkflowStore((state) => state.templates);

  usePageTracking(); // Ensures analytics/page tracking hook is active

  useEffect(() => {
    // Initialize templates on app load if not already loaded
    if (templates.length === 0) {
      workflowTemplates.forEach((template) => {
        addTemplate(template);
      });
    }
  }, [addTemplate, templates.length]);

  return (
    <>
      <ErrorNotification />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes (no layout) */}
          <Route path="/login" element={<PageErrorBoundary pageName="Login"><Login /></PageErrorBoundary>} />
          <Route path="/register" element={<PageErrorBoundary pageName="Register"><Register /></PageErrorBoundary>} />
          
          {/* Protected routes (with layout) */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<PageErrorBoundary pageName="Dashboard"><Dashboard /></PageErrorBoundary>} />
                <Route path="/mental-models" element={<PageErrorBoundary pageName="Mental Models"><MentalModels /></PageErrorBoundary>} />
                <Route path="/workflows" element={<PageErrorBoundary pageName="Workflows"><WorkflowList /></PageErrorBoundary>} />
                <Route path="/workflows/new" element={<PageErrorBoundary pageName="Workflow Editor"><WorkflowEditorFull /></PageErrorBoundary>} />
                <Route path="/workflows/:id" element={<PageErrorBoundary pageName="Workflow Details"><WorkflowDetail /></PageErrorBoundary>} />
                <Route path="/agents" element={<PageErrorBoundary pageName="Agents"><AgentManagement /></PageErrorBoundary>} />
                <Route path="/templates" element={<PageErrorBoundary pageName="Templates"><Templates /></PageErrorBoundary>} />
                <Route path="/analytics" element={<PageErrorBoundary pageName="Analytics"><Analytics /></PageErrorBoundary>} />
                <Route path="/execution-monitor" element={<PageErrorBoundary pageName="Execution Monitor"><ExecutionMonitor /></PageErrorBoundary>} />
                <Route path="/error-logs" element={<PageErrorBoundary pageName="Error Logs"><ErrorLogs /></PageErrorBoundary>} />
                <Route path="/team" element={<PageErrorBoundary pageName="Team"><TeamMembers /></PageErrorBoundary>} />
                <Route path="/token-usage" element={<PageErrorBoundary pageName="Token Usage"><TokenUsage /></PageErrorBoundary>} />
                <Route path="/settings/api-keys" element={<PageErrorBoundary pageName="API Keys"><APIKeys /></PageErrorBoundary>} />
                <Route path="/notifications" element={<PageErrorBoundary pageName="Notifications"><Notifications /></PageErrorBoundary>} />
                <Route path="/settings" element={<PageErrorBoundary pageName="Settings"><Settings /></PageErrorBoundary>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Suspense>
    </>
  );
};

// Main app wrapper
export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
};
