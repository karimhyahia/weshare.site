
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Main } from './Main';
import { LanguageProvider } from './LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <Main />
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>
);
