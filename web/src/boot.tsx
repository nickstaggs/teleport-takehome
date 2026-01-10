import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppWrapper } from './AppWrapper';
import { ClientProvider } from './utils/ClientContext';

const container = document.getElementById('container');

createRoot(container!).render(
  <StrictMode>
    <ClientProvider>
      <AppWrapper />
    </ClientProvider>
  </StrictMode>
);
