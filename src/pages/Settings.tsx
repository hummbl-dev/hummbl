/**
 * Settings Page
 * 
 * @module pages/Settings
 * @version 1.0.0
 * @description Configure API keys and application settings
 * 
 * HUMMBL Systems
 */

import { useState, useEffect } from 'react';
import { Key, Save, Eye, EyeOff } from 'lucide-react';
import { getAPIKey, setAPIKey } from '../services/ai';

export default function Settings() {
  const [anthropicKey, setAnthropicKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load existing keys
    const existingAnthropicKey = getAPIKey('anthropic');
    const existingOpenaiKey = getAPIKey('openai');
    
    if (existingAnthropicKey) setAnthropicKey(existingAnthropicKey);
    if (existingOpenaiKey) setOpenaiKey(existingOpenaiKey);
  }, []);

  const handleSave = () => {
    if (anthropicKey) {
      setAPIKey('anthropic', anthropicKey);
    }
    if (openaiKey) {
      setAPIKey('openai', openaiKey);
    }
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Configure API keys for workflow execution
        </p>
      </div>

      <div className="card space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>API Keys</span>
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Configure your AI provider API keys to enable workflow execution. Keys are stored locally in your browser.
          </p>
        </div>

        {/* Anthropic API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Anthropic API Key (Claude)
          </label>
          <div className="relative">
            <input
              type={showAnthropicKey ? 'text' : 'password'}
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={() => setShowAnthropicKey(!showAnthropicKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showAnthropicKey ? 'Hide Anthropic API key' : 'Show Anthropic API key'}
            >
              {showAnthropicKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Get your API key from{' '}
            <a
              href="https://console.anthropic.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700"
            >
              console.anthropic.com
            </a>
          </p>
        </div>

        {/* OpenAI API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            OpenAI API Key (GPT)
          </label>
          <div className="relative">
            <input
              type={showOpenaiKey ? 'text' : 'password'}
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={() => setShowOpenaiKey(!showOpenaiKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showOpenaiKey ? 'Hide OpenAI API key' : 'Show OpenAI API key'}
            >
              {showOpenaiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Get your API key from{' '}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700"
            >
              platform.openai.com/api-keys
            </a>
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            {saved && (
              <p className="text-sm text-green-600 font-medium">
                ✓ API keys saved successfully
              </p>
            )}
          </div>
          <button
            onClick={handleSave}
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">About API Keys</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• API keys are stored locally in your browser (localStorage)</li>
          <li>• Keys are never sent to HUMMBL servers</li>
          <li>• You only need keys for the models you want to use</li>
          <li>• Workflows will use the agent's configured model</li>
        </ul>
      </div>
    </div>
  );
}
