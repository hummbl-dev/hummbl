import { useWorkflowStore } from '../store/workflowStore';
import { Workflow, CheckCircle2, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const workflows = useWorkflowStore((state) => state.workflows);
  const agents = useWorkflowStore((state) => state.agents);

  const draftWorkflows = workflows.filter((w) => w.status === 'draft');
  const activeWorkflows = workflows.filter((w) => w.status === 'active');
  const completedWorkflows = workflows.filter((w) => w.status === 'completed');
  const recentWorkflows = workflows
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  // Count all agents including those embedded in workflows
  const workflowAgents = workflows.flatMap((w) => w.agents || []);
  const totalAgentCount = agents.length + workflowAgents.length;

  const stats = [
    {
      name: 'Total Workflows',
      value: workflows.length,
      icon: Workflow,
      color: 'bg-blue-500',
    },
    {
      name: 'Draft',
      value: draftWorkflows.length,
      icon: Activity,
      color: 'bg-gray-500',
    },
    {
      name: 'Active',
      value: activeWorkflows.length,
      icon: Activity,
      color: 'bg-green-500',
    },
    {
      name: 'Completed',
      value: completedWorkflows.length,
      icon: CheckCircle2,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
            Welcome to your agentic workflow management system
          </p>
        </div>
        <Link
          to="/workflows/new"
          className="btn-primary whitespace-nowrap self-start sm:self-auto"
        >
          Create Workflow
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 animate-fade-in">
        {stats.map((stat, index) => (
          <div 
            key={stat.name} 
            className="card group p-4 md:p-6"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 md:mb-2">{stat.name}</p>
                <p className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-2 md:p-3 rounded-lg md:rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Workflows */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Workflows</h2>
          <Link
            to="/workflows"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        {recentWorkflows.length === 0 ? (
          <div className="text-center py-12">
            <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No workflows yet</p>
            <Link to="/workflows/new" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
              Create your first workflow
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentWorkflows.map((workflow) => (
              <Link
                key={workflow.id}
                to={`/workflows/${workflow.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{workflow.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {workflow.description}
                    </p>
                    <div className="flex items-center space-x-3 md:space-x-4 mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {workflow.tasks.length} tasks
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {workflow.agents.length} agents
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 self-start sm:self-auto">
                    <StatusBadge status={workflow.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Agent Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Agent Overview</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Agents</span>
              <span className="font-bold text-gray-900">{totalAgentCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">In Workflows</span>
              <span className="font-bold text-gray-900">{workflowAgents.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Global Agents</span>
              <span className="font-bold text-gray-900">{agents.length}</span>
            </div>
          </div>
          <Link
            to="/agents"
            className="btn-secondary mt-4 w-full text-center"
          >
            Manage Agents
          </Link>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link to="/workflows/new" className="btn-primary w-full text-center">
              New Workflow
            </Link>
            <Link to="/templates" className="btn-secondary w-full text-center">
              Browse Templates
            </Link>
            <Link to="/agents" className="btn-secondary w-full text-center">
              Add Agent
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
