import { useState } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Trash2, Play, Pause, MoreVertical } from 'lucide-react';

export default function WorkflowList() {
  const workflows = useWorkflowStore((state) => state.workflows);
  const deleteWorkflow = useWorkflowStore((state) => state.deleteWorkflow);
  const startWorkflow = useWorkflowStore((state) => state.startWorkflow);
  const pauseWorkflow = useWorkflowStore((state) => state.pauseWorkflow);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      deleteWorkflow(id);
    }
  };

  const handleStart = (id: string) => {
    startWorkflow(id);
    setShowMenu(null);
  };

  const handlePause = (id: string) => {
    pauseWorkflow(id);
    setShowMenu(null);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-2">Workflows</h1>
          <p className="text-gray-900 dark:text-gray-200 mt-2 text-base md:text-lg leading-relaxed">
            Manage and monitor your agentic workflows
          </p>
        </div>
        <Link to="/workflows/new" className="btn-primary flex items-center space-x-2 self-start sm:self-auto whitespace-nowrap">
          <Plus className="h-5 w-5" />
          <span>New Workflow</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-700" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Filter className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Filter workflows by status"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workflow Grid */}
      {filteredWorkflows.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-900">
            {searchTerm || statusFilter !== 'all'
              ? 'No workflows match your filters'
              : 'No workflows yet'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Link to="/workflows/new" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
              Create your first workflow
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredWorkflows.map((workflow) => (
            <div key={workflow.id} className="card p-4 md:p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <Link
                  to={`/workflows/${workflow.id}`}
                  className="flex-1 min-w-0"
                >
                  <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-lg truncate hover:text-primary-600 dark:hover:text-primary-400">
                    {workflow.name}
                  </h3>
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(showMenu === workflow.id ? null : workflow.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    aria-label="Open workflow menu"
                  >
                    <MoreVertical className="h-5 w-5 text-gray-900 dark:text-gray-200" />
                  </button>
                  {showMenu === workflow.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                      {workflow.status === 'draft' || workflow.status === 'paused' ? (
                        <button
                          onClick={() => handleStart(workflow.id)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-900 dark:text-gray-200"
                        >
                          <Play className="h-4 w-4" />
                          <span>Start</span>
                        </button>
                      ) : null}
                      {workflow.status === 'active' && (
                        <button
                          onClick={() => handlePause(workflow.id)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-900 dark:text-gray-200"
                        >
                          <Pause className="h-4 w-4" />
                          <span>Pause</span>
                        </button>
                      )}
                      <Link
                        to={`/workflows/${workflow.id}/edit`}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 block"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(workflow.id)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-black dark:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-900 mb-4 line-clamp-2">
                {workflow.description}
              </p>

              <div className="flex items-center justify-between mb-3">
                <StatusBadge status={workflow.status} />
                <div className="flex items-center space-x-3 text-sm text-gray-900">
                  <span>{workflow.tasks.length} tasks</span>
                  <span>{workflow.agents.length} agents</span>
                </div>
              </div>

              {workflow.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {workflow.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {workflow.tags.length > 3 && (
                    <span className="px-2 py-1 text-gray-800 text-xs">
                      +{workflow.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="text-xs text-gray-800 border-t border-gray-200 pt-3">
                Updated {formatDate(workflow.updatedAt)}
              </div>
            </div>
          ))}
        </div>
      )}
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

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
