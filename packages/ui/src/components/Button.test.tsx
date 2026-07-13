import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button.js';

describe('Button', () => {
  it('rend le libellé et le variant primary par défaut', () => {
    render(<Button>Enregistrer</Button>);
    const btn = screen.getByRole('button', { name: 'Enregistrer' });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toContain('bg-accent');
  });

  it('applique le variant demandé', () => {
    render(<Button variant="danger">Supprimer</Button>);
    expect(screen.getByRole('button').className).toContain('bg-danger');
  });

  it('désactive et marque aria-busy en chargement', () => {
    render(<Button loading>Envoi</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });
});
