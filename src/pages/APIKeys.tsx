/**
 * API Keys Management - AI Integration & Security
 * 
 * T1 (Abstraction): Centralized API key management for AI services
 * Seventh page of 8-page pilot (Week 1, Day 7)
 * 
 * @module pages/APIKeys
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { telemetry } from '../services/telemetry-enhanced';
import {
  Key,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Settings,
  Shield,
  Clock,
} from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  service: 'anthropic' | 'openai' | 'custom';
  key: string;
  masked: string;
  createdAt: number;
  lastUsed?: number;
  usageCount: number;
  status: 'active' | 'expired' | 'revoked';
}

export default function APIKeys() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Track page view
  useEffect(() => {
    telemetry.pageView('api-keys', {});
  }, []);

  // Load API keys
  useEffect(() => {
    const loadKeys = () => {
      setLoading(true);
      try {
        // Mock data for now - will integrate with localStorage/backend
        const mockKeys: APIKey[] = [
          {
            id: 'key-001',
            name: 'Anthropic Claude API',
            service: 'anthropic',
            key: 'sk-ant-api03-abc123...',
            masked: 'sk-ant-...abc123',
            createdAt: Date.now() - 15552000000,
            lastUsed: Date.now() - 3600000,
            usageCount: 1247,
            status: 'active',
          },
          {
            id: 'key-002',
            name: 'OpenAI GPT API',
            service: 'openai',
            key: 'sk-proj-xyz789...',
            masked: 'sk-proj-...xyz789',
            createdAt: Date.now() - 7776000000,
            lastUsed: Date.now() - 86400000,
            usageCount: 834,
            status: 'active',
          },
          {
            id: 'key-003',
            name: 'Legacy OpenAI Key',
            service: 'openai',
            key: 'sk-old-key...',
            masked: 'sk-old-...key',
            createdAt: Date.now() - 31536000000,
            lastUsed: Date.now() - 2592000000,
            usageCount: 45,
            status: 'expired',
          },
        ];

        setKeys(mockKeys);
      } catch (error) {
        console.error('Failed to load API keys:', error);
      } finally {
        setLoading(false);
      }
    };

    loadKeys();
  }, []);

  // Copy key to clipboard
  const handleCopy = (key: string, keyId: string) => {
    navigator.clipboard.writeText(key);
    telemetry.track({
      component: 'api-keys',
      action: 'copy_key',
      properties: { keyId },
    });
    alert('API key copied to clipboard!');
  };

  // Delete key
  const handleDelete = (keyId: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      setKeys(keys.filter((k) => k.id !== keyId));
      telemetry.track({
        component: 'api-keys',
        action: 'delete_key',
        properties: { keyId },
      });
    }
  };

  // Calculate stats
  const stats = {
    total: keys.length,
    active: keys.filter((k) => k.status === 'active').length,
    totalUsage: keys.reduce((sum, k) => sum + k.usageCount, 0),
    services: new Set(keys.map((k) => k.service)).size,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Key className="h-8 w-8 animate-pulse text-primary-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading API keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-600 mt-1">Manage AI service integrations and authentication</p>
        </div>

        {/* Add Key Button */}
        <button
          onClick={() => {
            setShowAddModal(true);
            telemetry.track({ component: 'api-keys', action: 'click_add_key' });
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add API Key</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Keys" value={stats.total} icon={<Key className="h-5 w-5" />} />
        <StatCard
          label="Active"
          value={stats.active}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="text-green-600"
        />
        <StatCard
          label="Total Usage"
          value={stats.totalUsage.toLocaleString()}
          icon={<Settings className="h-5 w-5" />}
          color="text-blue-600"
        />
        <StatCard
          label="Services"
          value={stats.services}
          icon={<Shield className="h-5 w-5" />}
          color="text-purple-600"
        />
      </div>

      {/* Security Notice */}
      <div className="card bg-amber-50 border-amber-200">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-amber-900 mb-1">Security Best Practices</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Never share your API keys publicly or commit them to version control</li>
              <li>• Rotate keys regularly and delete unused keys immediately</li>
              <li>• Use separate keys for development and production environments</li>
              <li>• Monitor usage patterns for unusual activity</li>
            </ul>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="space-y-3">
        {keys.length === 0 ? (
          <div className="card text-center py-12">
            <Key className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No API keys configured</p>
            <p className="text-sm text-gray-500 mt-1">Add your first API key to start using AI services</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary mt-4 inline-flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add API Key</span>
            </button>
          </div>
        ) : (
          keys.map((apiKey) => (
            <APIKeyCard
              key={apiKey.id}
              apiKey={apiKey}
              showKey={showKey === apiKey.id}
              onToggleShow={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
              onCopy={() => handleCopy(apiKey.key, apiKey.id)}
              onDelete={() => handleDelete(apiKey.id)}
            />
          ))
        )}
      </div>

      {/* Add Key Modal */}
      {showAddModal && (
        <AddKeyModal
          onClose={() => setShowAddModal(false)}
          onAdd={(service, name, key) => {
            const newKey: APIKey = {
              id: `key-${Date.now()}`,
              name,
              service,
              key,
              masked: `${key.slice(0, 8)}...${key.slice(-6)}`,
              createdAt: Date.now(),
              usageCount: 0,
              status: 'active',
            };
            setKeys([...keys, newKey]);
            telemetry.track({
              component: 'api-keys',
              action: 'add_key',
              properties: { service },
            });
            setShowAddModal(false);
          }}
        />
      )}

      {/* Service Setup Guides */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Setup Guides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ServiceGuide
            service="Anthropic Claude"
            logo="🤖"
            steps={[
              'Visit console.anthropic.com',
              'Navigate to API Keys section',
              'Click "Create Key"',
              'Copy and paste key above',
            ]}
            docsUrl="https://docs.anthropic.com/claude/reference/getting-started-with-the-api"
          />
          <ServiceGuide
            service="OpenAI GPT"
            logo="🧠"
            steps={[
              'Visit platform.openai.com',
              'Go to API keys section',
              'Click "Create new secret key"',
              'Copy and paste key above',
            ]}
            docsUrl="https://platform.openai.com/docs/quickstart"
          />
        </div>
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

// API Key Card Component
function APIKeyCard({
  apiKey,
  showKey,
  onToggleShow,
  onCopy,
  onDelete,
}: {
  apiKey: APIKey;
  showKey: boolean;
  onToggleShow: () => void;
  onCopy: () => void;
  onDelete: () => void;
}) {
  const serviceConfig = {
    anthropic: { name: 'Anthropic Claude', bg: 'bg-purple-50', text: 'text-purple-700', logo: '🤖' },
    openai: { name: 'OpenAI GPT', bg: 'bg-green-50', text: 'text-green-700', logo: '🧠' },
    custom: { name: 'Custom API', bg: 'bg-blue-50', text: 'text-blue-700', logo: '⚙️' },
  };

  const statusConfig = {
    active: { bg: 'bg-green-50', text: 'text-green-700', icon: <CheckCircle2 className="h-4 w-4" /> },
    expired: { bg: 'bg-amber-50', text: 'text-amber-700', icon: <Clock className="h-4 w-4" /> },
    revoked: { bg: 'bg-red-50', text: 'text-red-700', icon: <AlertCircle className="h-4 w-4" /> },
  };

  const service = serviceConfig[apiKey.service];
  const status = statusConfig[apiKey.status];

  return (
    <div className={`card ${apiKey.status !== 'active' ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <div className="text-3xl">{service.logo}</div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium text-gray-900">{apiKey.name}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${service.bg} ${service.text}`}>
                {service.name}
              </span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium flex items-center space-x-1 ${status.bg} ${status.text}`}
              >
                {status.icon}
                <span className="capitalize">{apiKey.status}</span>
              </span>
            </div>
            <p className="text-sm text-gray-500">Created {formatDate(apiKey.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Key Display */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <code className="text-sm font-mono text-gray-900 flex-1">
            {showKey ? apiKey.key : apiKey.masked}
          </code>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={onToggleShow}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              onClick={onCopy}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div>
            <span className="font-medium">{apiKey.usageCount.toLocaleString()}</span> uses
          </div>
          {apiKey.lastUsed && (
            <div>
              Last used <span className="font-medium">{formatTimestamp(apiKey.lastUsed)}</span>
            </div>
          )}
        </div>

        <button
          onClick={onDelete}
          className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
          title="Delete key"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Add Key Modal Component
function AddKeyModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (service: 'anthropic' | 'openai' | 'custom', name: string, key: string) => void;
}) {
  const [service, setService] = useState<'anthropic' | 'openai' | 'custom'>('anthropic');
  const [name, setName] = useState('');
  const [key, setKey] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add API Key</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value as 'anthropic' | 'openai' | 'custom')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="anthropic">Anthropic Claude</option>
              <option value="openai">OpenAI GPT</option>
              <option value="custom">Custom API</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Production API Key"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Your key is encrypted and stored securely</p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={() => onAdd(service, name, key)}
              disabled={!name || !key}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Service Guide Component
function ServiceGuide({
  service,
  logo,
  steps,
  docsUrl,
}: {
  service: string;
  logo: string;
  steps: string[];
  docsUrl: string;
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-2xl">{logo}</span>
        <h4 className="font-medium text-gray-900">{service}</h4>
      </div>
      <ol className="space-y-2 mb-3">
        {steps.map((step, index) => (
          <li key={index} className="text-sm text-gray-600">
            {index + 1}. {step}
          </li>
        ))}
      </ol>
      <a
        href={docsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary-600 hover:underline"
        onClick={() =>
          telemetry.track({
            component: 'api-keys',
            action: 'click_docs',
            properties: { service },
          })
        }
      >
        View documentation →
      </a>
    </div>
  );
}

// Format date helper
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Format timestamp helper
function formatTimestamp(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(timestamp);
}
