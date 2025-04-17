import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ViteRouter from './routes';
import './globals.css';
import './fonts.css';
import Providers from './providers';

createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <Providers>
            <ViteRouter />
        </Providers>
    </StrictMode>
);
