import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input.js';
import { SearchInput } from './SearchInput.js';
import { Textarea } from './Textarea.js';
import { Checkbox } from './Checkbox.js';
import { RadioGroup } from './Radio.js';
import { Switch } from './Switch.js';
import { Select } from './Select.js';
import { ButtonGroup } from './ButtonGroup.js';

describe('Input', () => {
  it("lie le label et expose l'erreur (role alert + aria-invalid)", () => {
    render(<Input label="Nom" error="Requis" defaultValue="" />);
    const input = screen.getByLabelText('Nom');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Requis');
  });

  it('fonctionne en non-contrôlé et notifie onValueChange', () => {
    const onValueChange = vi.fn();
    render(<Input label="Ville" defaultValue="Paris" onValueChange={onValueChange} />);
    fireEvent.change(screen.getByLabelText('Ville'), { target: { value: 'Lyon' } });
    expect(onValueChange).toHaveBeenCalledWith('Lyon');
  });

  it("relie l'aide via aria-describedby", () => {
    render(<Input label="Email" help="Nous ne le partageons jamais" />);
    const input = screen.getByLabelText('Email');
    const describedby = input.getAttribute('aria-describedby');
    expect(describedby).toBeTruthy();
    expect(document.getElementById(describedby!)).toHaveTextContent('jamais');
  });
});

describe('SearchInput', () => {
  it('soumet sur Entrée et efface sur le bouton', () => {
    const onSearch = vi.fn();
    const onClear = vi.fn();
    render(<SearchInput defaultValue="lac" onSearch={onSearch} onClear={onClear} />);
    const box = screen.getByRole('searchbox');
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(onSearch).toHaveBeenCalledWith('lac');
    fireEvent.click(screen.getByRole('button', { name: 'Effacer la recherche' }));
    expect(onClear).toHaveBeenCalledOnce();
    expect((box as HTMLInputElement).value).toBe('');
  });
});

describe('Textarea', () => {
  it('rend un champ multiligne lié au label', () => {
    render(<Textarea label="Note" defaultValue="" />);
    expect(screen.getByLabelText('Note').tagName).toBe('TEXTAREA');
  });
});

describe('Checkbox', () => {
  it('notifie onCheckedChange', () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox label="J\'accepte" onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByLabelText(/accepte/));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});

describe('RadioGroup', () => {
  it('sélectionne une option (non-contrôlé)', () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup
        label="Thème"
        options={[
          { value: 'light', label: 'Clair' },
          { value: 'dark', label: 'Sombre' },
        ]}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByLabelText('Sombre'));
    expect(onValueChange).toHaveBeenCalledWith('dark');
  });
});

describe('Switch', () => {
  it('bascule et expose aria-checked', () => {
    const onCheckedChange = vi.fn();
    render(<Switch ariaLabel="Notifications" onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole('switch', { name: 'Notifications' });
    expect(sw).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(sw);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});

describe('Select', () => {
  it('notifie onValueChange', () => {
    const onValueChange = vi.fn();
    render(
      <Select
        label="Tri"
        options={[
          { value: 'date', label: 'Date' },
          { value: 'name', label: 'Nom' },
        ]}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.change(screen.getByLabelText('Tri'), { target: { value: 'name' } });
    expect(onValueChange).toHaveBeenCalledWith('name');
  });
});

describe('ButtonGroup', () => {
  it('active un segment et notifie', () => {
    const onValueChange = vi.fn();
    render(
      <ButtonGroup
        ariaLabel="Vue"
        options={[
          { value: 'grid', label: 'Grille' },
          { value: 'list', label: 'Liste' },
        ]}
        onValueChange={onValueChange}
      />,
    );
    const list = screen.getByRole('button', { name: 'Liste' });
    fireEvent.click(list);
    expect(onValueChange).toHaveBeenCalledWith('list');
    expect(list).toHaveAttribute('aria-pressed', 'true');
  });
});
