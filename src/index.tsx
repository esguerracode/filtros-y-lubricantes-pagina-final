import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// GLOBAL ERROR HANDLER (Prevent White Screen of Death)
window.onerror = function (message, source, lineno, colno, error) {
  console.error("Global Error Caught:", error);
  const errorMsg = `
    <div style="font-family: monospace; padding: 20px; background: #1a1a1a; color: #ff5555; height: 100vh; overflow: auto;">
      <h1 style="color: #ff5555;">CRITICAL ERROR</h1>
      <p style="font-size: 1.2em;">${message}</p>
      <p>Source: ${source}:${lineno}:${colno}</p>
      <pre style="background: #000; padding: 10px; border-radius: 5px; overflow-x: auto;">${error?.stack || 'No stack trace'}</pre>
    </div>
  `;
  document.body.innerHTML = errorMsg;
};

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (e) {
    console.error("Render Error:", e);
    document.body.innerHTML = `
      <div style="font-family: monospace; padding: 20px; background: #1a1a1a; color: #ff5555; height: 100vh;">
        <h1>RENDER ERROR</h1>
        <pre>${e}</pre>
      </div>
    `;
  }
} else {
  console.error("Root element not found");
  document.body.innerHTML = "<h1>FATAL: Root element not found</h1>";
}
