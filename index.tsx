
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Main } from './Main';
import { LanguageProvider } from './LanguageContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <Main />
    </LanguageProvider>
  </React.StrictMode>
);
