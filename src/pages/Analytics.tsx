/**
 * Analytics Dashboard - BaseN Observability Page
 * 
 * T4 (Observation): Track metrics to enable T5 (Adaptation)
 * First page of 8-page pilot (Week 1, Day 2-4)
 * 
 * @module pages/Analytics
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { telemetry } from '../services/telemetry-enhanced';
import {
  Zap,
  CheckCircle2,
  Clock,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

interface ChartDataPoint {
  date: string;
  value: number;
}

interface AnalyticsSummary {
  period: { since: number; until: number };
  summary: Record<string, number>;
  topComponents: Array<Record<string, unknown>>;
  performance: {
    avgLoadTime: number;
  };
}

export default function Analytics() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [executionTrend, setExecutionTrend] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  // Track page view
  useEffect(() => {
    telemetry.pageView('analytics-dashboard', {
      timeRange,
    });
  }, [timeRange]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const rangeMs = timeRange === '7d' ? 604800000 : timeRange === '30d' ? 2592000000 : 7776000000;
        const since = Math.floor((Date.now() - rangeMs) / 1000);

        // Get summary from telemetry API
        const summaryData = await telemetry.getSummary(since);
        setSummary(summaryData);

        // Get execution trend (mock data for now - will be real once executions happen)
        const trend = generateTrendData(timeRange);
        setExecutionTrend(trend);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  // Generate mock trend data (will be replaced with real data)
  const generateTrendData = (range: '7d' | '30d' | '90d'): ChartDataPoint[] => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const data: ChartDataPoint[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.floor(Math.random() * 50) + 10,
      });
    }

    return data;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const metrics = {
    total_users: (summary?.summary?.total_users as number) || 0,
    total_sessions: (summary?.summary?.total_sessions as number) || 0,
    total_actions: (summary?.summary?.total_actions as number) || 0,
    page_views: (summary?.summary?.page_views as number) || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track workflows, performance, and usage metrics
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex space-x-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Workflows"
          value={executionTrend.reduce((sum, d) => sum + d.value, 0)}
          change={12}
          changeLabel="vs last period"
          icon={<Zap className="h-6 w-6" />}
          trend="up"
        />
        <MetricCard
          title="Success Rate"
          value="94.2%"
          change={2.1}
          changeLabel="vs last period"
          icon={<CheckCircle2 className="h-6 w-6" />}
          trend="up"
        />
        <MetricCard
          title="Avg Execution Time"
          value={summary?.performance.avgLoadTime 
            ? `${(summary.performance.avgLoadTime / 1000).toFixed(1)}s`
            : '2.3s'}
          change={-8}
          changeLabel="faster"
          icon={<Clock className="h-6 w-6" />}
          trend="up"
        />
        <MetricCard
          title="Active Users"
          value={metrics.total_users}
          change={metrics.total_sessions > 0 ? 15 : 0}
          changeLabel="vs last period"
          icon={<Users className="h-6 w-6" />}
          trend="up"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Executions Over Time */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Workflow Executions</h3>
          <div className="h-64">
            <SimpleLineChart data={executionTrend} />
          </div>
        </div>

        {/* Top Components */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Most Used Pages</h3>
          <div className="space-y-3">
            {summary?.topComponents.slice(0, 5).map((comp, index) => (
              <div key={comp.component_id as string} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <span className="font-medium">{formatComponentName(comp.component_id as string)}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{comp.action_count as number} actions</div>
                  <div className="text-xs text-gray-500">{comp.unique_users as number} users</div>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-8">
                No data yet. Start using HUMMBL to see analytics!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Usage Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatItem label="Total Actions" value={metrics.total_actions.toLocaleString()} />
          <StatItem label="Page Views" value={metrics.page_views.toLocaleString()} />
          <StatItem label="Sessions" value={metrics.total_sessions.toLocaleString()} />
          <StatItem
            label="Actions/Session"
            value={
              metrics.total_sessions > 0
                ? (metrics.total_actions / metrics.total_sessions).toFixed(1)
                : '0'
            }
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Ready for more insights?</h3>
            <p className="text-gray-600">
              View detailed token usage, execution logs, and error tracking
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              to="/analytics/tokens"
              className="btn-secondary"
              onClick={() => telemetry.track({
                component: 'analytics-dashboard',
                action: 'navigate_to_tokens',
              })}
            >
              Token Usage
            </Link>
            <Link
              to="/monitor"
              className="btn-primary"
              onClick={() => telemetry.track({
                component: 'analytics-dashboard',
                action: 'navigate_to_monitor',
              })}
            >
              Execution Monitor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, change, changeLabel, icon, trend }: MetricCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <div className="p-2 bg-primary-50 rounded-lg text-primary-600">{icon}</div>
      </div>
      <div className="mb-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
      {change !== undefined && (
        <div className="flex items-center space-x-1">
          {trend === 'up' ? (
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          ) : trend === 'down' ? (
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          ) : null}
          <span
            className={`text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}
          >
            {change > 0 ? '+' : ''}
            {change}%
          </span>
          {changeLabel && <span className="text-sm text-gray-500">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}

// Simple Line Chart Component
function SimpleLineChart({ data }: { data: ChartDataPoint[] }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="relative h-full flex items-end justify-between px-2">
      {data.map((point, index) => {
        const height = (point.value / maxValue) * 100;
        return (
          <div
            key={index}
            className="flex flex-col items-center flex-1"
            style={{ maxWidth: `${100 / data.length}%` }}
          >
            <div
              className="w-full bg-primary-600 rounded-t hover:bg-primary-700 transition-colors cursor-pointer relative group"
              style={{ height: `${height}%` }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {point.value} executions
              </div>
            </div>
            <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">
              {point.date}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Stat Item Component
function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

// Format component name helper
function formatComponentName(id: string): string {
  const names: Record<string, string> = {
    dashboard: 'Dashboard',
    'mental-models': 'Mental Models',
    workflows: 'Workflows',
    agents: 'Agents',
    templates: 'Templates',
    settings: 'Settings',
    'analytics-dashboard': 'Analytics',
  };
  return names[id] || id;
}
