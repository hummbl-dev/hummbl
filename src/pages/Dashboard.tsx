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
      color: 'from-accent-500 to-accent-600',
      iconBg: 'bg-accent-100 dark:bg-accent-900/30',
      iconColor: 'text-accent-600 dark:text-accent-400',
    },
    {
      name: 'Draft',
      value: draftWorkflows.length,
      icon: Activity,
      color: 'from-warning-400 to-warning-500',
      iconBg: 'bg-warning-100 dark:bg-warning-900/30',
      iconColor: 'text-warning-600 dark:text-warning-400',
    },
    {
      name: 'Active',
      value: activeWorkflows.length,
      icon: Activity,
      color: 'from-success-500 to-success-600',
      iconBg: 'bg-success-100 dark:bg-success-900/30',
      iconColor: 'text-success-600 dark:text-success-400',
    },
    {
      name: 'Completed',
      value: completedWorkflows.length,
      icon: CheckCircle2,
      color: 'from-primary-500 to-primary-600',
      iconBg: 'bg-primary-100 dark:bg-primary-900/30',
      iconColor: 'text-primary-600 dark:text-primary-400',
    },
  ];

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-900 to-primary-700 dark:from-primary-50 dark:to-primary-200 bg-clip-text text-transparent mb-2">Dashboard</h1>
          <p className="text-primary-600 dark:text-primary-300 mt-2 text-base md:text-lg leading-relaxed">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in">
        {stats.map((stat, index) => (
          <div
            key={stat.name}
            className="card group p-5 md:p-7"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm md:text-base font-semibold text-primary-700 dark:text-primary-200 tracking-wide">{stat.name}</p>
                <div className={`${stat.iconBg} p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-subtle`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
              <p className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent tracking-tight`}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Workflows */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-50">Recent Workflows</h2>
          <Link
            to="/workflows"
            className="text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-500 text-sm font-semibold transition-colors"
          >
            View All
          </Link>
        </div>
        {recentWorkflows.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="bg-primary-100 dark:bg-primary-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Workflow className="h-10 w-10 text-primary-600 dark:text-primary-400" />
            </div>
            <p className="text-primary-600 dark:text-primary-300 text-lg mb-3">No workflows yet</p>
            <Link to="/workflows/new" className="btn-primary inline-flex">
              Create your first workflow
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentWorkflows.map((workflow) => (
              <Link
                key={workflow.id}
                to={`/workflows/${workflow.id}`}
                className="block p-5 border border-primary-200 dark:border-primary-700 rounded-xl hover:border-accent-400 dark:hover:border-accent-600 hover:shadow-soft transition-all bg-white/50 dark:bg-primary-800/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-primary-900 dark:text-primary-50 truncate">{workflow.name}</h3>
                    <p className="text-sm text-primary-600 dark:text-primary-300 mt-1 line-clamp-2">
                      {workflow.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-3">
                      <span className="text-xs font-medium text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded">
                        {workflow.tasks.length} tasks
                      </span>
                      <span className="text-xs font-medium text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded">
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
        )
        }
      </div>

      {/* Agent Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Agent Overview</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-900">Total Agents</span>
              <span className="font-bold text-gray-900">{totalAgentCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-900">In Workflows</span>
              <span className="font-bold text-gray-900">{workflowAgents.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-900">Global Agents</span>
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
    draft: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
    active: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100',
    paused: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200',
    completed: 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100',
    failed: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
