import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import WorkflowList from './pages/WorkflowList';
import WorkflowDetail from './pages/WorkflowDetail';
import WorkflowEditor from './pages/WorkflowEditor';
import AgentManagement from './pages/AgentManagement';
import Templates from './pages/Templates';
import { useWorkflowStore } from './store/workflowStore';
import { workflowTemplates } from './data/templates';

export const App: React.FC = () => {
  const addTemplate = useWorkflowStore((state) => state.addTemplate);

  useEffect(() => {
    // Initialize templates on app load
    workflowTemplates.forEach((template) => {
      addTemplate(template);
    });
  }, [addTemplate]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workflows" element={<WorkflowList />} />
          <Route path="/workflows/:id" element={<WorkflowDetail />} />
          <Route path="/workflows/new" element={<WorkflowEditor />} />
          <Route path="/workflows/:id/edit" element={<WorkflowEditor />} />
          <Route path="/agents" element={<AgentManagement />} />
          <Route path="/templates" element={<Templates />} />
        </Routes>
      </Layout>
    </Router>
  );
};
