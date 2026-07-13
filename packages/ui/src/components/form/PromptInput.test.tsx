import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptInput } from './PromptInput.js';

describe('PromptInput', () => {
  it('envoie le texte rogné avec Entrée et vide la zone (non-contrôlé)', () => {
    const onSubmit = vi.fn();
    render(<PromptInput onSubmit={onSubmit} />);
    const area = screen.getByRole('textbox', { name: 'Message à KAI' });
    fireEvent.change(area, { target: { value: '  Bonjour KAI  ' } });
    fireEvent.keyDown(area, { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith('Bonjour KAI');
    expect((area as HTMLTextAreaElement).value).toBe('');
  });

  it("n'envoie pas sur un message vide", () => {
    const onSubmit = vi.fn();
    render(<PromptInput onSubmit={onSubmit} />);
    const area = screen.getByRole('textbox', { name: 'Message à KAI' });
    fireEvent.change(area, { target: { value: '   ' } });
    fireEvent.keyDown(area, { key: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('Maj+Entrée insère un saut de ligne au lieu d’envoyer', () => {
    const onSubmit = vi.fn();
    render(<PromptInput onSubmit={onSubmit} />);
    const area = screen.getByRole('textbox', { name: 'Message à KAI' });
    fireEvent.change(area, { target: { value: 'ligne 1' } });
    fireEvent.keyDown(area, { key: 'Enter', shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('envoie via le bouton (labellisé, désactivé si vide)', () => {
    const onSubmit = vi.fn();
    render(<PromptInput onSubmit={onSubmit} />);
    const send = screen.getByRole('button', { name: 'Envoyer' });
    expect(send).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox', { name: 'Message à KAI' }), {
      target: { value: 'Salut' },
    });
    expect(send).toBeEnabled();
    fireEvent.click(send);
    expect(onSubmit).toHaveBeenCalledWith('Salut');
  });

  it('ne vide pas la zone en mode contrôlé', () => {
    const onSubmit = vi.fn();
    render(<PromptInput value="fixe" onSubmit={onSubmit} />);
    const area = screen.getByRole('textbox', { name: 'Message à KAI' });
    fireEvent.keyDown(area, { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith('fixe');
    expect((area as HTMLTextAreaElement).value).toBe('fixe');
  });

  it('busy : le bouton d’envoi est désactivé', () => {
    render(<PromptInput value="coucou" busy onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Envoyer' })).toBeDisabled();
  });
});
