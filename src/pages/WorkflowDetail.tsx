import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWorkflowStore } from '../store/workflowStore';
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export default function WorkflowDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getWorkflow = useWorkflowStore((state) => state.getWorkflow);
  const deleteWorkflow = useWorkflowStore((state) => state.deleteWorkflow);
  const startWorkflow = useWorkflowStore((state) => state.startWorkflow);
  const pauseWorkflow = useWorkflowStore((state) => state.pauseWorkflow);
  const stopWorkflow = useWorkflowStore((state) => state.stopWorkflow);
  const getWorkflowLogs = useWorkflowStore((state) => state.getWorkflowLogs);

  const workflow = id ? getWorkflow(id) : undefined;
  const logs = id ? getWorkflowLogs(id) : [];

  if (!workflow) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Workflow not found</p>
        <Link to="/workflows" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Back to Workflows
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      deleteWorkflow(workflow.id);
      navigate('/workflows');
    }
  };

  const completedTasks = workflow.tasks.filter((t) => t.status === 'completed').length;
  const progress = workflow.tasks.length > 0
    ? (completedTasks / workflow.tasks.length) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/workflows')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{workflow.name}</h1>
            <p className="text-gray-600 mt-1">{workflow.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {workflow.status === 'draft' || workflow.status === 'paused' ? (
            <button
              onClick={() => startWorkflow(workflow.id)}
              className="btn-success flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Start</span>
            </button>
          ) : null}
          {workflow.status === 'active' && (
            <>
              <button
                onClick={() => pauseWorkflow(workflow.id)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Pause className="h-4 w-4" />
                <span>Pause</span>
              </button>
              <button
                onClick={() => stopWorkflow(workflow.id)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Square className="h-4 w-4" />
                <span>Stop</span>
              </button>
            </>
          )}
          <Link
            to={`/workflows/${workflow.id}/edit`}
            className="btn-secondary flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Link>
          <button
            onClick={handleDelete}
            className="btn-danger flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Status and Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Status</p>
          <StatusBadge status={workflow.status} />
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Progress</p>
          <div className="flex items-center space-x-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900">
              {Math.round(progress)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {completedTasks} of {workflow.tasks.length} tasks completed
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Last Updated</p>
          <p className="font-medium text-gray-900">
            {workflow.updatedAt.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tasks */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Tasks</h2>
        {workflow.tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No tasks configured yet
          </div>
        ) : (
          <div className="space-y-3">
            {workflow.tasks.map((task, index) => (
              <div
                key={task.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      {task.status === 'completed' && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      {task.status === 'running' && (
                        <Clock className="h-5 w-5 text-blue-600 animate-spin" />
                      )}
                      {task.status === 'failed' && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      {task.status === 'pending' && (
                        <AlertCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">#{index + 1}</span>
                        <h3 className="font-medium text-gray-900">{task.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {task.description}
                      </p>
                      {task.dependencies.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Depends on: {task.dependencies.join(', ')}
                        </p>
                      )}
                      {task.error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                          {task.error}
                        </div>
                      )}
                    </div>
                  </div>
                  <TaskStatusBadge status={task.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agents */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Agents</h2>
        {workflow.agents.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No agents assigned yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflow.agents.map((agent) => (
              <div
                key={agent.id}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <h3 className="font-medium text-gray-900">{agent.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{agent.description}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {agent.role}
                  </span>
                  {agent.model && (
                    <span className="text-xs text-gray-500">{agent.model}</span>
                  )}
                </div>
                {agent.capabilities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 3).map((cap) => (
                      <span
                        key={cap}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {cap}
                      </span>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <span className="px-2 py-1 text-gray-500 text-xs">
                        +{agent.capabilities.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Execution Logs */}
      {logs.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Execution Logs</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 border-l-4 bg-gray-50 text-sm"
                style={{
                  borderLeftColor:
                    log.level === 'error'
                      ? '#ef4444'
                      : log.level === 'warning'
                      ? '#f59e0b'
                      : '#3b82f6',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{log.message}</span>
                  <span className="text-xs text-gray-500">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {workflow.tags.length > 0 && (
        <div className="card">
          <h3 className="font-medium text-gray-900 mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {workflow.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
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
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status as keyof typeof colors]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function TaskStatusBadge({ status }: { status: string }) {
  const colors = {
    pending: 'bg-gray-100 text-gray-800',
    running: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    skipped: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status as keyof typeof colors]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
