import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ThemeModeProvider from './theme/ThemeModeProvider';
import AuthProvider from './context/AuthContext';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeModeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeModeProvider>
  </StrictMode>,
);
