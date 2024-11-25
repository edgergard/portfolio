import React from 'react';
import ReactDOM from 'react-dom/client';
import { Root } from './Root.tsx';
import './i18n.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
