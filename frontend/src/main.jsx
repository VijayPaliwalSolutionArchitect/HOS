import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

/**
 * Application entry point
 * Renders the root App component
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
