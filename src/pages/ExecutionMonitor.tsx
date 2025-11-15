/**
 * Execution Monitor - Real-time Workflow Tracking
 * 
 * T4 (Observation): Monitor live executions for T5 optimization
 * Fourth page of 8-page pilot (Week 1, Day 4)
 * 
 * @module pages/ExecutionMonitor
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { telemetry } from '../services/telemetry-enhanced';
import { listExecutions } from '../services/api';
import {
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Square,
  RotateCcw,
  Filter,
  Search,
} from 'lucide-react';

interface Execution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt: number;
  completedAt: number | null;
  duration: number | null;
  tasksTotal: number;
  tasksCompleted: number;
  error: string | null;
}

type StatusFilter = 'all' | 'running' | 'completed' | 'failed' | 'pending';

export default function ExecutionMonitor() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Track page view
  useEffect(() => {
    telemetry.pageView('execution-monitor', { autoRefresh });
  }, [autoRefresh]);

  // Fetch executions
  useEffect(() => {
    const fetchExecutions = async () => {
      try {
        const response = await listExecutions(20, 0);
        
        // Transform API response to match component interface
        const transformedExecutions: Execution[] = response.executions.map((exec) => {
          const startedAt = new Date(exec.started_at).getTime();
          const completedAt = exec.completed_at ? new Date(exec.completed_at).getTime() : null;
          const duration = completedAt ? completedAt - startedAt : null;
          
          return {
            id: exec.id,
            workflowId: exec.workflow_id,
            workflowName: exec.workflow_name,
            status: exec.status,
            progress: exec.progress,
            startedAt,
            completedAt,
            duration,
            tasksTotal: 0, // Will be populated from execution details
            tasksCompleted: 0, // Will be populated from execution details
            error: exec.error,
          };
        });

        setExecutions(transformedExecutions);
      } catch (error) {
        console.error('Failed to fetch executions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExecutions();
  }, []);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      try {
        const response = await listExecutions(20, 0);
        const transformedExecutions: Execution[] = response.executions.map((exec) => {
          const startedAt = new Date(exec.started_at).getTime();
          const completedAt = exec.completed_at ? new Date(exec.completed_at).getTime() : null;
          const duration = completedAt ? completedAt - startedAt : null;
          
          return {
            id: exec.id,
            workflowId: exec.workflow_id,
            workflowName: exec.workflow_name,
            status: exec.status,
            progress: exec.progress,
            startedAt,
            completedAt,
            duration,
            tasksTotal: 0,
            tasksCompleted: 0,
            error: exec.error,
          };
        });
        setExecutions(transformedExecutions);
      } catch (error) {
        console.error('Auto-refresh error:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filter executions
  const filteredExecutions = executions.filter((exec) => {
    const matchesStatus = statusFilter === 'all' || exec.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      exec.workflowName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exec.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate stats
  const stats = {
    total: executions.length,
    running: executions.filter((e) => e.status === 'running').length,
    completed: executions.filter((e) => e.status === 'completed').length,
    failed: executions.filter((e) => e.status === 'failed').length,
    avgDuration: executions
      .filter((e) => e.duration)
      .reduce((sum, e) => sum + (e.duration || 0), 0) / executions.filter((e) => e.duration).length || 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-pulse text-primary-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading executions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Execution Monitor</h1>
          <p className="text-gray-600 mt-1">Real-time workflow execution tracking</p>
        </div>

        {/* Auto-refresh toggle */}
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => {
                setAutoRefresh(e.target.checked);
                telemetry.track({
                  component: 'execution-monitor',
                  action: 'toggle_autorefresh',
                  properties: { enabled: e.target.checked },
                });
              }}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Auto-refresh (5s)</span>
          </label>
          {autoRefresh && <Loader2 className="h-4 w-4 animate-spin text-primary-600" />}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total" value={stats.total} icon={<Activity className="h-5 w-5" />} />
        <StatCard
          label="Running"
          value={stats.running}
          icon={<Activity className="h-5 w-5" />}
          color="text-black dark:text-white"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="text-black dark:text-white"
        />
        <StatCard
          label="Failed"
          value={stats.failed}
          icon={<XCircle className="h-5 w-5" />}
          color="text-black dark:text-white"
        />
        <StatCard
          label="Avg Duration"
          value={`${(stats.avgDuration / 1000).toFixed(1)}s`}
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Executions List */}
      <div className="space-y-3">
        {filteredExecutions.length === 0 ? (
          <div className="card text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No executions found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search query</p>
          </div>
        ) : (
          filteredExecutions.map((execution) => (
            <ExecutionCard key={execution.id} execution={execution} />
          ))
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon,
  color = 'text-gray-700',
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-2 bg-gray-50 rounded-lg ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

// Execution Card Component
function ExecutionCard({ execution }: { execution: Execution }) {
  const statusConfig = {
    pending: {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      icon: <Clock className="h-4 w-4" />,
      label: 'Pending',
    },
    running: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      label: 'Running',
    },
    completed: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      icon: <CheckCircle2 className="h-4 w-4" />,
      label: 'Completed',
    },
    failed: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      icon: <XCircle className="h-4 w-4" />,
      label: 'Failed',
    },
  };

  const config = statusConfig[execution.status];
  const elapsed = Date.now() - execution.startedAt;

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <Link
            to={`/workflows/${execution.workflowId}`}
            className="font-medium text-gray-900 hover:text-primary-600"
            onClick={() =>
              telemetry.track({
                component: 'execution-monitor',
                action: 'click_workflow',
                properties: { workflowId: execution.workflowId },
              })
            }
          >
            {execution.workflowName}
          </Link>
          <span className={`px-2 py-1 rounded text-xs font-medium flex items-center space-x-1 ${config.bg} ${config.text}`}>
            {config.icon}
            <span>{config.label}</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {execution.status === 'running' && (
            <button
              onClick={() => {
                telemetry.track({
                  component: 'execution-monitor',
                  action: 'stop_execution',
                  properties: { executionId: execution.id },
                });
                alert('Stop execution - Coming soon!');
              }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
              title="Stop execution"
            >
              <Square className="h-4 w-4" />
            </button>
          )}
          {execution.status === 'failed' && (
            <button
              onClick={() => {
                telemetry.track({
                  component: 'execution-monitor',
                  action: 'retry_execution',
                  properties: { executionId: execution.id },
                });
                alert('Retry execution - Coming soon!');
              }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
              title="Retry execution"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {execution.status === 'running' && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{Math.round(execution.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${execution.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Details */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>
            Tasks: {execution.tasksCompleted}/{execution.tasksTotal}
          </span>
          <span>ID: {execution.id}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span>{formatDuration(execution.duration || elapsed)}</span>
        </div>
      </div>

      {/* Error */}
      {execution.error && (
        <div className="mt-3 flex items-start space-x-2 p-3 bg-red-50 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{execution.error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Format duration helper
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}
