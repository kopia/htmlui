import './utils/i18n';
import './css/index.css';
import { createRoot } from 'react-dom/client';
import React, { lazy, Suspense } from 'react';

const App = lazy(() => import('./App'))
const root = createRoot(document.getElementById('root'))
const loadingScreen = (
    <div className='loader-container'>
        <span className="loader"></span>
    </div>
)

root.render(
    <Suspense fallback={loadingScreen}>
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    </Suspense>);