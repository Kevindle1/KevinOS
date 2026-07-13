import { describe, it, expect, vi } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { InsightCard } from './InsightCard.js';
import { TypingText } from './TypingText.js';

describe('InsightCard', () => {
  it('affiche label, valeur et méta', () => {
    render(<InsightCard icon="📷" label="Photos" value="148 nouvelles" meta="aujourd’hui" />);
    expect(screen.getByText('Photos')).toBeInTheDocument();
    expect(screen.getByText('148 nouvelles')).toBeInTheDocument();
    expect(screen.getByText('aujourd’hui')).toBeInTheDocument();
  });

  it('non-actionnable : ce n’est pas un bouton', () => {
    render(<InsightCard label="Serveur" value="Actif" />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('actionnable : rendue en bouton et déclenche onActivate', () => {
    const onActivate = vi.fn();
    render(<InsightCard label="Stockage" value="1,2 To" onActivate={onActivate} />);
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(onActivate).toHaveBeenCalledTimes(1);
  });
});

describe('TypingText', () => {
  it('expose le texte complet aux lecteurs d’écran dès le départ', () => {
    const { container } = render(<TypingText text="Bonsoir Kevin" />);
    expect(container.querySelector('[aria-label="Bonsoir Kevin"]')).toBeTruthy();
  });

  it('révèle tout le texte au fil du temps puis appelle onDone', () => {
    vi.useFakeTimers();
    try {
      const onDone = vi.fn();
      const { container } = render(<TypingText text="Bonsoir" cps={100} onDone={onDone} />);
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(container.textContent).toContain('Bonsoir');
      expect(onDone).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
