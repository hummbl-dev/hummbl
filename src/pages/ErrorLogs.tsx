/**
 * Error Logs - Workflow Debugging & Troubleshooting
 * 
 * T4 (Observation): Track errors for T5 optimization & debugging
 * Fifth page of 8-page pilot (Week 1, Day 5)
 * 
 * @module pages/ErrorLogs
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { telemetry } from '../services/telemetry-enhanced';
import {
  AlertTriangle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
  CheckCircle,
  Filter,
  Search,
} from 'lucide-react';

interface ErrorLog {
  id: string;
  executionId: string;
  workflowId: string;
  workflowName: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  errorType: string;
  message: string;
  stackTrace?: string;
  context: {
    agent?: string;
    task?: string;
    model?: string;
  };
  resolved: boolean;
  resolvedAt?: number;
  notes?: string;
}

type SeverityFilter = 'all' | 'low' | 'medium' | 'high' | 'critical';
type StatusFilter = 'all' | 'unresolved' | 'resolved';

export default function ErrorLogs() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedError, setExpandedError] = useState<string | null>(null);

  // Track page view
  useEffect(() => {
    telemetry.pageView('error-logs', { severityFilter, statusFilter });
  }, [severityFilter, statusFilter]);

  // Fetch error logs
  useEffect(() => {
    const fetchErrors = async () => {
      setLoading(true);
      try {
        // Mock data for now - will be real once backend API is called
        const mockErrors: ErrorLog[] = [
          {
            id: 'err-001',
            executionId: 'exec-003',
            workflowId: 'wf-003',
            workflowName: 'Data Processing',
            timestamp: Date.now() - 240000,
            severity: 'high',
            errorType: 'RateLimitError',
            message: 'API rate limit exceeded for OpenAI GPT-4o',
            stackTrace: `Error: 429 Too Many Requests
  at callOpenAI (ai.ts:145)
  at executeTask (workflow.ts:234)
  at processWorkflow (orchestrator.ts:89)`,
            context: {
              agent: 'Researcher',
              task: 'Research Market Trends',
              model: 'gpt-4o',
            },
            resolved: false,
          },
          {
            id: 'err-002',
            executionId: 'exec-007',
            workflowId: 'wf-005',
            workflowName: 'Email Campaign',
            timestamp: Date.now() - 3600000,
            severity: 'critical',
            errorType: 'ValidationError',
            message: 'Required field "recipient" missing in task parameters',
            stackTrace: `ValidationError: Missing required field
  at validateTaskInput (validation.ts:67)
  at prepareTask (workflow.ts:123)
  at executeWorkflow (orchestrator.ts:45)`,
            context: {
              agent: 'Executor',
              task: 'Send Email',
            },
            resolved: true,
            resolvedAt: Date.now() - 3000000,
            notes: 'Fixed task template to include recipient field',
          },
          {
            id: 'err-003',
            executionId: 'exec-009',
            workflowId: 'wf-001',
            workflowName: 'Content Generation',
            timestamp: Date.now() - 7200000,
            severity: 'medium',
            errorType: 'TimeoutError',
            message: 'Task execution timeout after 120 seconds',
            context: {
              agent: 'Analyst',
              task: 'Analyze Sentiment',
              model: 'claude-4-sonnet',
            },
            resolved: false,
          },
          {
            id: 'err-004',
            executionId: 'exec-012',
            workflowId: 'wf-008',
            workflowName: 'Report Generation',
            timestamp: Date.now() - 10800000,
            severity: 'low',
            errorType: 'WarningError',
            message: 'Token limit approaching (85% of max)',
            context: {
              agent: 'Researcher',
              task: 'Compile Research',
              model: 'gpt-4o',
            },
            resolved: true,
            resolvedAt: Date.now() - 9000000,
            notes: 'Reduced context window size',
          },
          {
            id: 'err-005',
            executionId: 'exec-015',
            workflowId: 'wf-003',
            workflowName: 'Data Processing',
            timestamp: Date.now() - 14400000,
            severity: 'high',
            errorType: 'NetworkError',
            message: 'Failed to connect to external API endpoint',
            stackTrace: `NetworkError: ECONNREFUSED
  at fetch (node:internal/modules/cjs/loader:1120)
  at callExternalAPI (external.ts:34)
  at processData (workflow.ts:189)`,
            context: {
              agent: 'Executor',
              task: 'Fetch Data',
            },
            resolved: false,
          },
        ];

        setErrors(mockErrors);
      } catch (error) {
        console.error('Failed to fetch error logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchErrors();
  }, []);

  // Filter errors
  const filteredErrors = errors.filter((error) => {
    const matchesSeverity = severityFilter === 'all' || error.severity === severityFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'resolved' && error.resolved) ||
      (statusFilter === 'unresolved' && !error.resolved);
    const matchesSearch =
      searchQuery === '' ||
      error.workflowName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.errorType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  // Calculate stats
  const stats = {
    total: errors.length,
    unresolved: errors.filter((e) => !e.resolved).length,
    critical: errors.filter((e) => e.severity === 'critical').length,
    high: errors.filter((e) => e.severity === 'high').length,
    resolved24h: errors.filter((e) => e.resolved && e.resolvedAt && Date.now() - e.resolvedAt < 86400000)
      .length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 animate-pulse text-gray-800 dark:text-gray-200 mx-auto mb-2" />
          <p className="text-gray-900">Loading error logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Error Logs</h1>
          <p className="text-gray-900 mt-1">Debug failed workflows and track issues</p>
        </div>

        {/* Export Button */}
        <button
          onClick={() => {
            telemetry.track({ component: 'error-logs', action: 'export_logs' });
            alert('Export logs - Coming soon!');
          }}
          className="btn-secondary flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Errors" value={stats.total} icon={<AlertTriangle className="h-5 w-5" />} />
        <StatCard
          label="Unresolved"
          value={stats.unresolved}
          icon={<XCircle className="h-5 w-5" />}
          color="text-gray-900 dark:text-gray-100"
        />
        <StatCard
          label="Critical"
          value={stats.critical}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="text-black dark:text-white"
        />
        <StatCard
          label="High Priority"
          value={stats.high}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="text-black dark:text-white"
        />
        <StatCard
          label="Resolved (24h)"
          value={stats.resolved24h}
          icon={<CheckCircle className="h-5 w-5" />}
          color="text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-700" />
              <input
                type="text"
                placeholder="Search errors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-800" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as SeverityFilter)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-800" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="unresolved">Unresolved</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error List */}
      <div className="space-y-3">
        {filteredErrors.length === 0 ? (
          <div className="card text-center py-12">
            <CheckCircle className="h-12 w-12 text-gray-900 dark:text-gray-100 mx-auto mb-3" />
            <p className="text-gray-900 font-medium">No errors found</p>
            <p className="text-sm text-gray-800 mt-1">
              {searchQuery || severityFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'All systems running smoothly!'}
            </p>
          </div>
        ) : (
          filteredErrors.map((error) => (
            <ErrorCard
              key={error.id}
              error={error}
              expanded={expandedError === error.id}
              onToggle={() => setExpandedError(expandedError === error.id ? null : error.id)}
              onResolve={() => {
                telemetry.track({
                  component: 'error-logs',
                  action: 'resolve_error',
                  properties: { errorId: error.id },
                });
                setErrors(
                  errors.map((e) =>
                    e.id === error.id ? { ...e, resolved: true, resolvedAt: Date.now() } : e
                  )
                );
              }}
            />
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
          <p className="text-sm text-gray-900">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-2 bg-gray-50 rounded-lg ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

// Error Card Component
function ErrorCard({
  error,
  expanded,
  onToggle,
  onResolve,
}: {
  error: ErrorLog;
  expanded: boolean;
  onToggle: () => void;
  onResolve: () => void;
}) {
  const severityConfig = {
    low: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-900 dark:text-gray-100',
      border: 'border-blue-200',
      label: 'Low',
    },
    medium: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-900 dark:text-gray-100',
      border: 'border-yellow-200',
      label: 'Medium',
    },
    high: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-900 dark:text-gray-100',
      border: 'border-orange-200',
      label: 'High',
    },
    critical: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-900 dark:text-gray-100',
      border: 'border-red-200',
      label: 'Critical',
    },
  };

  const config = severityConfig[error.severity];

  return (
    <div className={`card border-l-4 ${config.border} ${error.resolved ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
              {config.label}
            </span>
            <span className="text-xs text-gray-800">
              {error.errorType}
            </span>
            {error.resolved && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>Resolved</span>
              </span>
            )}
          </div>
          <Link
            to={`/workflows/${error.workflowId}`}
            className="font-medium text-gray-900 hover:text-primary-600"
            onClick={() =>
              telemetry.track({
                component: 'error-logs',
                action: 'click_workflow',
                properties: { workflowId: error.workflowId },
              })
            }
          >
            {error.workflowName}
          </Link>
        </div>

        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Error Message */}
      <div className={`p-3 rounded-lg mb-3 ${config.bg}`}>
        <p className={`text-sm font-medium ${config.text}`}>{error.message}</p>
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between text-sm text-gray-900 mb-3">
        <div className="flex items-center space-x-4">
          {error.context.agent && <span>Agent: {error.context.agent}</span>}
          {error.context.task && <span>Task: {error.context.task}</span>}
          {error.context.model && <span>Model: {error.context.model}</span>}
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span>{formatTimestamp(error.timestamp)}</span>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="space-y-3 pt-3 border-t">
          {/* Stack Trace */}
          {error.stackTrace && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Stack Trace</p>
              <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
                {error.stackTrace}
              </pre>
            </div>
          )}

          {/* IDs */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-900">Error ID</p>
              <p className="font-mono text-gray-900">{error.id}</p>
            </div>
            <div>
              <p className="text-gray-900">Execution ID</p>
              <Link
                to={`/monitor`}
                className="font-mono text-primary-600 hover:underline"
                onClick={() =>
                  telemetry.track({
                    component: 'error-logs',
                    action: 'click_execution',
                    properties: { executionId: error.executionId },
                  })
                }
              >
                {error.executionId}
              </Link>
            </div>
          </div>

          {/* Resolution Notes */}
          {error.resolved && error.notes && (
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium text-black dark:text-white mb-1">Resolution Notes</p>
              <p className="text-sm text-gray-900 dark:text-gray-100">{error.notes}</p>
              {error.resolvedAt && (
                <p className="text-xs text-gray-900 dark:text-gray-100 mt-2">
                  Resolved {formatTimestamp(error.resolvedAt)}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          {!error.resolved && (
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={onResolve}
                className="btn-primary text-sm"
              >
                Mark as Resolved
              </button>
              <button
                onClick={() => {
                  telemetry.track({
                    component: 'error-logs',
                    action: 'retry_execution',
                    properties: { executionId: error.executionId },
                  });
                  alert('Retry execution - Coming soon!');
                }}
                className="btn-secondary text-sm"
              >
                Retry Execution
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Format timestamp helper
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = Date.now();
  const diff = now - timestamp;

  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now';
  }
  // Less than 1 hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  }
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  // More than 24 hours
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
