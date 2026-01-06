import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppWrapper } from './AppWrapper';

const container = document.getElementById('container');

createRoot(container!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>
);
