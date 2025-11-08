/**
 * Token Usage - AI Cost Tracking Page
 * 
 * T4 (Observation): Track token consumption to enable T5 cost optimization
 * Second page of 8-page pilot (Week 1, Day 3-4)
 * 
 * @module pages/TokenUsage
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { telemetry } from '../services/telemetry-enhanced';
import {
  DollarSign,
  Zap,
  TrendingDown,
  TrendingUp,
  Download,
  ArrowLeft,
  Lightbulb,
} from 'lucide-react';

interface TokenStats {
  totalTokens: number;
  totalCost: number;
  byModel: Array<{
    model: string;
    tokens: number;
    cost: number;
    percentage: number;
  }>;
  byAgent: Array<{
    agent: string;
    tokens: number;
    cost: number;
    executions: number;
  }>;
  trend: {
    tokensChange: number;
    costChange: number;
  };
}

const MODEL_COSTS = {
  'claude-4-haiku': { input: 0.25, output: 1.25 },
  'claude-4-sonnet': { input: 3, output: 15 },
  'claude-4-opus': { input: 15, output: 75 },
  'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
};

export default function TokenUsage() {
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Track page view
  useEffect(() => {
    telemetry.pageView('token-usage', { timeRange });
  }, [timeRange]);

  // Fetch token usage data
  useEffect(() => {
    const fetchTokenData = async () => {
      setLoading(true);
      try {
        // Mock data for now - will be real once executions happen
        const mockStats: TokenStats = {
          totalTokens: 1245780,
          totalCost: 18.42,
          byModel: [
            { model: 'claude-4-haiku', tokens: 620000, cost: 0.78, percentage: 50 },
            { model: 'claude-4-sonnet', tokens: 425000, cost: 12.75, percentage: 34 },
            { model: 'gpt-4o-mini', tokens: 200780, cost: 0.30, percentage: 16 },
          ],
          byAgent: [
            { agent: 'Researcher', tokens: 450000, cost: 5.63, executions: 45 },
            { agent: 'Analyst', tokens: 395000, cost: 11.85, executions: 32 },
            { agent: 'Executor', tokens: 300780, cost: 0.38, executions: 58 },
            { agent: 'Reviewer', tokens: 100000, cost: 0.56, executions: 12 },
          ],
          trend: {
            tokensChange: -12,
            costChange: -15,
          },
        };

        setStats(mockStats);
      } catch (error) {
        console.error('Failed to fetch token data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenData();
  }, [timeRange]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Zap className="h-8 w-8 animate-pulse text-primary-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading token usage...</p>
        </div>
      </div>
    );
  }

  const avgCostPerExecution = stats.totalCost / stats.byAgent.reduce((sum, a) => sum + a.executions, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/analytics"
            className="p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => telemetry.track({ component: 'token-usage', action: 'back_to_analytics' })}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Token Usage & Costs</h1>
            <p className="text-gray-600 mt-1">Track AI API consumption and optimize spending</p>
          </div>
        </div>

        {/* Actions */}
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
              {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
            </button>
          ))}
          <button
            onClick={() => {
              telemetry.track({ component: 'token-usage', action: 'export_csv' });
              alert('Export CSV - Coming soon!');
            }}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Tokens"
          value={stats.totalTokens.toLocaleString()}
          change={stats.trend.tokensChange}
          icon={<Zap className="h-6 w-6" />}
        />
        <MetricCard
          title="Total Cost"
          value={`$${stats.totalCost.toFixed(2)}`}
          change={stats.trend.costChange}
          icon={<DollarSign className="h-6 w-6" />}
        />
        <MetricCard
          title="Avg Cost/Execution"
          value={`$${avgCostPerExecution.toFixed(3)}`}
          change={-8}
          icon={<TrendingDown className="h-6 w-6" />}
        />
        <MetricCard
          title="Optimization Potential"
          value="22%"
          change={null}
          icon={<Lightbulb className="h-6 w-6" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tokens by Model */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Usage by Model</h3>
          <div className="space-y-4">
            {stats.byModel.map((model) => (
              <div key={model.model}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{formatModelName(model.model)}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">${model.cost.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{model.tokens.toLocaleString()} tokens</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${model.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tokens by Agent */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Usage by Agent</h3>
          <div className="space-y-3">
            {stats.byAgent.map((agent) => (
              <div key={agent.agent} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{agent.agent}</div>
                  <div className="text-xs text-gray-500">{agent.executions} executions</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">${agent.cost.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">{agent.tokens.toLocaleString()} tokens</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Cost Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CostStat
            label="Input Tokens"
            value={Math.floor(stats.totalTokens * 0.6).toLocaleString()}
            cost={stats.totalCost * 0.3}
          />
          <CostStat
            label="Output Tokens"
            value={Math.floor(stats.totalTokens * 0.4).toLocaleString()}
            cost={stats.totalCost * 0.7}
          />
          <CostStat
            label="Avg Tokens/Task"
            value={Math.floor(stats.totalTokens / 147).toLocaleString()}
            cost={avgCostPerExecution}
          />
        </div>
      </div>

      {/* Optimization Tips */}
      <div className="card bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-amber-100 rounded-lg">
            <Lightbulb className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Cost Optimization Suggestions</h3>
            <ul className="space-y-2">
              <OptimizationTip
                tip="Switch Researcher agents to Haiku 4"
                savings="$3.85/month (22%)"
                impact="minimal"
              />
              <OptimizationTip
                tip="Use prompt caching for repeated queries"
                savings="$2.50/month (14%)"
                impact="none"
              />
              <OptimizationTip
                tip="Reduce output token limits where possible"
                savings="$1.20/month (7%)"
                impact="low"
              />
            </ul>
          </div>
        </div>
      </div>

      {/* Model Pricing Reference */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Model Pricing Reference</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Model</th>
                <th className="text-right p-3">Input ($/1M)</th>
                <th className="text-right p-3">Output ($/1M)</th>
                <th className="text-right p-3">Speed</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Object.entries(MODEL_COSTS).map(([model, costs]) => (
                <tr key={model} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{formatModelName(model)}</td>
                  <td className="p-3 text-right">${costs.input.toFixed(2)}</td>
                  <td className="p-3 text-right">${costs.output.toFixed(2)}</td>
                  <td className="p-3 text-right">
                    {model.includes('haiku') ? (
                      <span className="text-green-600 font-medium">Fast</span>
                    ) : model.includes('opus') ? (
                      <span className="text-amber-600 font-medium">Slow</span>
                    ) : (
                      <span className="text-blue-600 font-medium">Medium</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: string;
  change: number | null;
  icon: React.ReactNode;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <div className="p-2 bg-primary-50 rounded-lg text-primary-600">{icon}</div>
      </div>
      <div className="mb-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
      {change !== null && (
        <div className="flex items-center space-x-1">
          {change < 0 ? (
            <TrendingDown className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingUp className="h-4 w-4 text-red-600" />
          )}
          <span className={`text-sm font-medium ${change < 0 ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(change)}% {change < 0 ? 'decrease' : 'increase'}
          </span>
        </div>
      )}
    </div>
  );
}

// Cost Stat Component
function CostStat({ label, value, cost }: { label: string; value: string; cost: number }) {
  return (
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">${cost.toFixed(2)}</p>
    </div>
  );
}

// Optimization Tip Component
function OptimizationTip({
  tip,
  savings,
  impact,
}: {
  tip: string;
  savings: string;
  impact: 'none' | 'minimal' | 'low' | 'medium';
}) {
  const impactColors = {
    none: 'bg-green-100 text-green-800',
    minimal: 'bg-green-100 text-green-800',
    low: 'bg-yellow-100 text-yellow-800',
    medium: 'bg-orange-100 text-orange-800',
  };

  return (
    <li className="flex items-center justify-between p-3 bg-white rounded-lg">
      <span className="text-gray-700">{tip}</span>
      <div className="flex items-center space-x-2">
        <span className="font-medium text-green-600">{savings}</span>
        <span className={`text-xs px-2 py-1 rounded ${impactColors[impact]}`}>
          {impact} impact
        </span>
      </div>
    </li>
  );
}

// Format model name helper
function formatModelName(model: string): string {
  const names: Record<string, string> = {
    'claude-4-haiku': 'Claude 4 Haiku',
    'claude-4-sonnet': 'Claude 4 Sonnet',
    'claude-4-opus': 'Claude 4 Opus',
    'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
    'gpt-4o': 'GPT-4o',
    'gpt-4o-mini': 'GPT-4o Mini',
  };
  return names[model] || model;
}
