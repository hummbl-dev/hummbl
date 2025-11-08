import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import WorkflowList from './pages/WorkflowList';
import WorkflowDetail from './pages/WorkflowDetail';
import WorkflowEditorFull from './pages/WorkflowEditorFull';
import AgentManagement from './pages/AgentManagement';
import Templates from './pages/Templates';
import MentalModels from './pages/MentalModels';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { useWorkflowStore } from './store/workflowStore';
import { workflowTemplates } from './data/templates';
import { usePageTracking } from './hooks/usePageTracking';

const AppContent: React.FC = () => {
  const addTemplate = useWorkflowStore((state) => state.addTemplate);
  usePageTracking();

  useEffect(() => {
    // Initialize templates on app load (run once)
    workflowTemplates.forEach((template) => {
      addTemplate(template);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/mental-models" element={<MentalModels />} />
        <Route path="/workflows" element={<WorkflowList />} />
        <Route path="/workflows/:id" element={<WorkflowDetail />} />
        <Route path="/workflows/new" element={<WorkflowEditorFull />} />
        <Route path="/workflows/:id/edit" element={<WorkflowEditorFull />} />
        <Route path="/agents" element={<AgentManagement />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
};
