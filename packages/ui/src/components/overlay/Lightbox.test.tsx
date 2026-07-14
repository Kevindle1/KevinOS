import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Lightbox } from './Lightbox.js';

describe('Lightbox', () => {
  it('ne rend rien quand fermé', () => {
    render(
      <Lightbox open={false} onClose={() => {}}>
        <img alt="x" />
      </Lightbox>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('ouvert : dialogue modal + fermeture au bouton', () => {
    const onClose = vi.fn();
    render(
      <Lightbox open onClose={onClose} label="Photo">
        <img alt="photo" />
      </Lightbox>,
    );
    expect(screen.getByRole('dialog', { name: 'Photo' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Échap ferme', () => {
    const onClose = vi.fn();
    render(
      <Lightbox open onClose={onClose}>
        <img alt="photo" />
      </Lightbox>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('← / → naviguent quand fournis', () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    render(
      <Lightbox open onClose={() => {}} onPrev={onPrev} onNext={onNext}>
        <img alt="photo" />
      </Lightbox>,
    );
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(onPrev).toHaveBeenCalled();
    expect(onNext).toHaveBeenCalled();
  });
});
