import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { Analytics } from '@vercel/analytics/react'
import './index.css'

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
  document.body.innerHTML += `
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 40px; border: 2px solid red; border-radius: 8px; max-width: 600px; z-index: 99999;">
      <h1 style="color: red; margin: 0 0 20px 0;">⚠️ Application Error</h1>
      <p style="margin: 0 0 10px 0;"><strong>Message:</strong> ${event.error?.message || 'Unknown error'}</p>
      <pre style="background: #f5f5f5; padding: 10px; overflow: auto; font-size: 12px;">${event.error?.stack || 'No stack trace'}</pre>
      <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Reload Page</button>
    </div>
  `;
});

// Environment validation on startup
if (!import.meta.env.DEV) {
  // Check for API keys in production
  try {
    const hasAnthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY || localStorage.getItem('anthropic_api_key');
    const hasOpenAIKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key');
    
    if (!hasAnthropicKey && !hasOpenAIKey) {
      console.warn(
        '⚠️ No API keys configured. Please add your API keys in Settings > API Keys or set VITE_ANTHROPIC_API_KEY/VITE_OPENAI_API_KEY environment variables.'
      );
    }
  } catch (e) {
    console.error('Error checking API keys:', e);
  }
}

// Ensure root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = `
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
      <h1 style="color: red;">⚠️ Root Element Missing</h1>
      <p>Cannot find element with id="root". Please check your HTML.</p>
    </div>
  `;
  throw new Error('Root element not found');
}

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
        <Analytics />
      </ErrorBoundary>
    </React.StrictMode>,
  );
} catch (error) {
  console.error('Fatal error during React initialization:', error);
  document.body.innerHTML = `
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 40px; border: 2px solid red; border-radius: 8px; max-width: 600px;">
      <h1 style="color: red; margin: 0 0 20px 0;">⚠️ Failed to Initialize App</h1>
      <p style="margin: 0 0 10px 0;"><strong>Error:</strong> ${error instanceof Error ? error.message : String(error)}</p>
      <pre style="background: #f5f5f5; padding: 10px; overflow: auto; font-size: 12px;">${error instanceof Error ? error.stack : 'No stack trace'}</pre>
      <button onclick="localStorage.clear(); location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Clear Storage & Reload</button>
    </div>
  `;
}
