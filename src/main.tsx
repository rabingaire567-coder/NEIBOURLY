import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { resolveBasename } from './lib/basename';
import './styles/base.css';
import './styles/components.css';

const container = document.getElementById('root');
if (!container) throw new Error('NEIBOURLY: #root is missing from index.html');

createRoot(container).render(
  <StrictMode>
    <BrowserRouter basename={resolveBasename()}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
