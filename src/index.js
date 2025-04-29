// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ❌ REMOVE BrowserRouter from here
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
