import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Démonte le DOM rendu entre chaque test (évite l'accumulation de composants).
afterEach(() => {
  cleanup();
});
