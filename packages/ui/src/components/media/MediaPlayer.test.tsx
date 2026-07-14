import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MediaPlayer, type MediaPlayerHandle } from './MediaPlayer.js';

describe('MediaPlayer', () => {
  it('rend les contrôles (lecture, plein écran) et le titre', () => {
    render(<MediaPlayer src="/video.mp4" title="Mon film" autoPlay={false} />);
    expect(screen.getByText('Mon film')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lecture' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Plein écran' })).toBeInTheDocument();
  });

  it('le bouton fermer déclenche onClose', () => {
    const onClose = vi.fn();
    render(<MediaPlayer src="/v.mp4" onClose={onClose} autoPlay={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Fermer le lecteur' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('expose une API impérative pour KAI (sans planter)', () => {
    const ref = createRef<MediaPlayerHandle>();
    render(<MediaPlayer ref={ref} src="/v.mp4" autoPlay={false} />);
    expect(ref.current).toBeTruthy();
    // Aucune de ces commandes ne doit lever (jsdom n'implémente pas <video>).
    expect(() => {
      ref.current?.seekBy(30);
      ref.current?.seekTo(120);
      ref.current?.setRate(1.5);
      ref.current?.toggleMute();
      ref.current?.setVolume(0.1);
      ref.current?.setSubtitle('fr');
      ref.current?.toggleFullscreen();
      ref.current?.togglePiP();
      ref.current?.pause();
    }).not.toThrow();
  });
});
