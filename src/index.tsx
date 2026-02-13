import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Volvemos a importar App
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
