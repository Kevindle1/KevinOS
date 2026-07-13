import { describe, it, expect } from 'vitest';
import { photoTools } from './photos.js';

describe('photoTools (contrat KAI de KOS Vision)', () => {
  it("expose des noms d'outils stables et préfixés « photos. »", () => {
    const names = photoTools.map((t) => t.name);
    expect(names).toContain('photos.browse');
    expect(names).toContain('photos.search');
    expect(names).toContain('photos.usage');
    for (const n of names) {
      expect(n.startsWith('photos.')).toBe(true);
    }
  });

  it('chaque outil déclare une description et un schéma de paramètres objet', () => {
    for (const tool of photoTools) {
      expect(tool.description.length).toBeGreaterThan(0);
      expect((tool.parameters as { type?: string }).type).toBe('object');
    }
  });

  it("l'outil de recherche exige le paramètre « text »", () => {
    const search = photoTools.find((t) => t.name === 'photos.search');
    expect(search).toBeDefined();
    expect((search!.parameters as { required?: string[] }).required).toContain('text');
  });
});
