import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store } from './store';
import ThemeModeProvider from './theme/ThemeModeProvider';
import AuthProvider from './context/AuthProvider';
import CustomLoader from './components/CustomLoader';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeModeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
          <CustomLoader />
          <ToastContainer position="top-right" autoClose={4000} theme="colored" />
        </AuthProvider>
      </ThemeModeProvider>
    </Provider>
  </StrictMode>,
);
