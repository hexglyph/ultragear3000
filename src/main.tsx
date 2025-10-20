import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './ui/App';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Elemento root não encontrado');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
