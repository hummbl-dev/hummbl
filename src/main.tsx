import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { Analytics } from '@vercel/analytics/react'
import './index.css'

// Environment validation on startup
if (!import.meta.env.DEV) {
  // Check for API keys in production
  const hasAnthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY || localStorage.getItem('anthropic_api_key');
  const hasOpenAIKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key');
  
  if (!hasAnthropicKey && !hasOpenAIKey) {
    console.warn(
      '⚠️ No API keys configured. Please add your API keys in Settings > API Keys or set VITE_ANTHROPIC_API_KEY/VITE_OPENAI_API_KEY environment variables.'
    );
  }
} else {
  console.log('🔧 Running in development mode');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      <Analytics />
    </ErrorBoundary>
  </React.StrictMode>,
)
