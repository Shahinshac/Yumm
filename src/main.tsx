import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

// Initialize Native Google Auth
GoogleAuth.initialize({
  clientId: '946437330680-9r4mutghresee1heq36ailmtrh7drtv1.apps.googleusercontent.com',
  scopes: ['profile', 'email'],
  grantOfflineAccess: true,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
