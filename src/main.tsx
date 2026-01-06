import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import ErrorBoundary from './ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

// Global error handlers to help capture runtime errors during development
if (typeof window !== 'undefined') {
  window.addEventListener('error', (ev) => {
    try {
      const prev = localStorage.getItem('deepa_last_error') || '';
      localStorage.setItem('deepa_last_error', prev + '\n' + String(ev.error || ev.message));
    } catch {}
    // eslint-disable-next-line no-console
    console.error('Global error captured:', ev.error || ev.message, ev);
  });

  window.addEventListener('unhandledrejection', (ev) => {
    try {
      const prev = localStorage.getItem('deepa_last_error') || '';
      localStorage.setItem('deepa_last_error', prev + '\n' + String(ev.reason || ev));
    } catch {}
    // eslint-disable-next-line no-console
    console.error('Unhandled rejection captured:', ev.reason || ev);
  });
}
