import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GlassAlertProvider } from 'glass-alert-animation';
import { GlassAlertBridge } from './utils/toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlassAlertProvider>
      <GlassAlertBridge />
      <App />
    </GlassAlertProvider>
  </StrictMode>
)
