import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Badge } from './Badge.js';
import { Tag } from './Tag.js';
import { StatusIndicator } from './StatusIndicator.js';
import { Spinner } from './Spinner.js';
import { Skeleton } from './Skeleton.js';
import { Progress } from './Progress.js';
import { Banner } from './Banner.js';

describe('Badge', () => {
  it('rend le libellé et applique la tonalité', () => {
    render(<Badge tone="success">Actif</Badge>);
    const el = screen.getByText('Actif');
    expect(el).toBeInTheDocument();
    expect(el.className).toContain('text-success');
  });
});

describe('Tag', () => {
  it('affiche un bouton de suppression accessible et déclenche onRemove', async () => {
    const onRemove = vi.fn();
    render(<Tag onRemove={onRemove}>Vacances</Tag>);
    const btn = screen.getByRole('button', { name: /Retirer Vacances/ });
    fireEvent.click(btn);
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('sans onRemove, aucun bouton', () => {
    render(<Tag>2024</Tag>);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('StatusIndicator', () => {
  it("donne l'état en toutes lettres (pas seulement la couleur)", () => {
    render(<StatusIndicator status="down" />);
    expect(screen.getByText('Hors ligne')).toBeInTheDocument();
  });

  it('expose un aria-label quand le libellé est masqué', () => {
    render(<StatusIndicator status="up" hideLabel />);
    expect(screen.getByLabelText('En ligne')).toBeInTheDocument();
  });
});

describe('Spinner', () => {
  it('expose role=status et un libellé accessible', () => {
    render(<Spinner label="Chargement des photos" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Chargement des photos');
  });
});

describe('Skeleton', () => {
  it('est décoratif (aria-hidden) et applique les dimensions', () => {
    const { container } = render(<Skeleton width={120} height={16} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el.style.width).toBe('120px');
  });
});

describe('Progress', () => {
  it('expose les attributs ARIA en mode déterminé', () => {
    render(<Progress value={40} label="Import" />);
    const bar = screen.getByRole('progressbar', { name: 'Import' });
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it("n'expose pas de valeur en mode indéterminé", () => {
    render(<Progress label="En cours" />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
  });
});

describe('Banner', () => {
  it('utilise role=alert pour danger et role=status pour info', () => {
    const { rerender } = render(<Banner tone="danger">Erreur</Banner>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    rerender(<Banner tone="info">Info</Banner>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('déclenche onDismiss', async () => {
    const onDismiss = vi.fn();
    render(
      <Banner tone="success" onDismiss={onDismiss}>
        OK
      </Banner>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
