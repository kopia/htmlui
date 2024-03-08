import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './css/index.css';
import './utils/18ns';

const root = createRoot(document.getElementById('root'))
root.render(<App />);
