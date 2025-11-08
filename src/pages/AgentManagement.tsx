import { useState } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import { Plus, Trash2, Edit, X, Save } from 'lucide-react';
import { AgentRole } from '../types/workflow';

export default function AgentManagement() {
  const agents = useWorkflowStore((state) => state.agents);
  const addAgent = useWorkflowStore((state) => state.addAgent);
  const updateAgent = useWorkflowStore((state) => state.updateAgent);
  const deleteAgent = useWorkflowStore((state) => state.deleteAgent);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'custom' as AgentRole,
    description: '',
    capabilities: [] as string[],
    model: 'claude-3-sonnet',
    temperature: 0.7,
    maxTokens: 4096,
  });
  const [capabilityInput, setCapabilityInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateAgent(editingId, formData);
    } else {
      addAgent(formData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: 'custom',
      description: '',
      capabilities: [],
      model: 'claude-3-sonnet',
      temperature: 0.7,
      maxTokens: 4096,
    });
    setCapabilityInput('');
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (agent) {
      setFormData({
        name: agent.name,
        role: agent.role,
        description: agent.description,
        capabilities: agent.capabilities,
        model: agent.model || 'claude-3-sonnet',
        temperature: agent.temperature || 0.7,
        maxTokens: agent.maxTokens || 4096,
      });
      setEditingId(agentId);
      setShowForm(true);
    }
  };

  const handleDelete = (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      deleteAgent(agentId);
    }
  };

  const handleAddCapability = () => {
    if (capabilityInput.trim() && !formData.capabilities.includes(capabilityInput.trim())) {
      setFormData({
        ...formData,
        capabilities: [...formData.capabilities, capabilityInput.trim()],
      });
      setCapabilityInput('');
    }
  };

  const handleRemoveCapability = (capability: string) => {
    setFormData({
      ...formData,
      capabilities: formData.capabilities.filter((c) => c !== capability),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agent Management</h1>
          <p className="text-gray-600 mt-1">
            Configure and manage your AI agents
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Agent</span>
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {editingId ? 'Edit Agent' : 'Create New Agent'}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="label">
                Agent Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="e.g., Research Assistant"
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="label">
                Role *
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as AgentRole })}
                className="input-field"
                required
              >
                <option value="researcher">Researcher</option>
                <option value="analyst">Analyst</option>
                <option value="executor">Executor</option>
                <option value="reviewer">Reviewer</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Describe the agent's purpose and responsibilities..."
              required
            />
          </div>

          <div>
            <label className="label">Capabilities</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={capabilityInput}
                onChange={(e) => setCapabilityInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCapability())}
                className="input-field"
                placeholder="e.g., web_search, data_analysis..."
              />
              <button
                type="button"
                onClick={handleAddCapability}
                className="btn-secondary"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {formData.capabilities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.capabilities.map((capability) => (
                  <span
                    key={capability}
                    className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm flex items-center space-x-1"
                  >
                    <span>{capability}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCapability(capability)}
                      className="hover:text-primary-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="model" className="label">
                Model
              </label>
              <select
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="input-field"
              >
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                <option value="claude-3-haiku">Claude 3 Haiku</option>
              </select>
            </div>

            <div>
              <label htmlFor="temperature" className="label">
                Temperature ({formData.temperature})
              </label>
              <input
                type="range"
                id="temperature"
                min="0"
                max="1"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="maxTokens" className="label">
                Max Tokens
              </label>
              <input
                type="number"
                id="maxTokens"
                value={formData.maxTokens}
                onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                className="input-field"
                min="1"
                max="200000"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={resetForm}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>{editingId ? 'Update Agent' : 'Create Agent'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Agent List */}
      {agents.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">No agents configured yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-primary-600 hover:text-primary-700 mt-2 inline-block"
          >
            Create your first agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{agent.name}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mt-1 inline-block">
                    {agent.role}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(agent.id)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(agent.id)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">{agent.description}</p>

              {agent.capabilities.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Capabilities</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 3).map((capability) => (
                      <span
                        key={capability}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {capability}
                      </span>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <span className="px-2 py-1 text-gray-500 text-xs">
                        +{agent.capabilities.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 border-t border-gray-200 pt-3 space-y-1">
                <div className="flex justify-between">
                  <span>Model:</span>
                  <span className="font-medium">{agent.model || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Temperature:</span>
                  <span className="font-medium">{agent.temperature || 'N/A'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
