import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ViteRouter from './routes';
import './globals.css';
import './fonts.css';

createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <ViteRouter />
    </StrictMode>
);
