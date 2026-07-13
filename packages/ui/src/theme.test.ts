import { describe, it, expect, beforeEach } from 'vitest';
import { applyTheme, resolveTheme, getStoredTheme } from './theme.js';

describe('theme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
  });

  it('applique un thème explicite sur data-theme et le persiste', () => {
    applyTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(getStoredTheme()).toBe('dark');
  });

  it('retire data-theme pour « system »', () => {
    applyTheme('light');
    applyTheme('system');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(getStoredTheme()).toBe('system');
  });

  it('resolveTheme renvoie le thème explicite tel quel', () => {
    expect(resolveTheme('dark')).toBe('dark');
    expect(resolveTheme('light')).toBe('light');
  });

  it('resolveTheme(system) ne casse pas sans matchMedia', () => {
    expect(['light', 'dark']).toContain(resolveTheme('system'));
  });
});
