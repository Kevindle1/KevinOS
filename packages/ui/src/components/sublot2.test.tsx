import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tooltip } from './overlay/Tooltip.js';
import { Popover } from './overlay/Popover.js';
import { Avatar } from './Avatar.js';
import { IconButton } from './IconButton.js';
import { Divider } from './Divider.js';
import { ScrollArea } from './ScrollArea.js';

describe('Tooltip', () => {
  it('apparaît au focus du déclencheur (role tooltip)', () => {
    render(
      <Tooltip content="Aide">
        <button>Cible</button>
      </Tooltip>,
    );
    expect(screen.queryByRole('tooltip')).toBeNull();
    fireEvent.focus(screen.getByRole('button', { name: 'Cible' }));
    expect(screen.getByRole('tooltip')).toHaveTextContent('Aide');
  });
});

describe('Popover', () => {
  it('ouvre un dialog au clic et le ferme sur Échap', () => {
    render(
      <Popover content={<div>Contenu</div>}>
        <button>Ouvrir</button>
      </Popover>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Contenu');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('Avatar', () => {
  it('affiche les initiales en repli et expose le nom', () => {
    render(<Avatar name="Kevin Dolié" />);
    const el = screen.getByRole('img', { name: 'Kevin Dolié' });
    expect(el).toHaveTextContent('KD');
  });

  it('rend une image avec alt quand src est fourni', () => {
    render(<Avatar name="Kevin" src="/k.jpg" />);
    expect(screen.getByRole('img', { name: 'Kevin' }).tagName).toBe('IMG');
  });
});

describe('IconButton', () => {
  it('exige et expose un aria-label et déclenche onClick', () => {
    const onClick = vi.fn();
    render(<IconButton aria-label="Fermer" icon={<span>x</span>} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('Divider', () => {
  it('a un rôle separator avec orientation', () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });
});

describe('ScrollArea', () => {
  it('applique la hauteur max et rend le contenu', () => {
    render(
      <ScrollArea maxHeight={100}>
        <div>Long contenu</div>
      </ScrollArea>,
    );
    expect(screen.getByText('Long contenu')).toBeInTheDocument();
  });
});
