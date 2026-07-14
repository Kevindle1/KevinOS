import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentPreview, documentIcon } from './DocumentPreview.js';

describe('DocumentPreview', () => {
  it('affiche le texte inline (on reste dans KevinOS)', () => {
    render(<DocumentPreview name="cv.md" kind="markdown" mode="text" text="# Mon CV" />);
    expect(screen.getByText('cv.md')).toBeInTheDocument();
    expect(screen.getByText('# Mon CV')).toBeInTheDocument();
  });

  it('rend une image via l’URL du Core', () => {
    render(
      <DocumentPreview name="photo.png" kind="image" mode="image" url="/api/v1/drive/x/raw" />,
    );
    const img = screen.getByRole('img', { name: 'photo.png' });
    expect(img).toHaveAttribute('src', '/api/v1/drive/x/raw');
  });

  it('mode download : propose le téléchargement', () => {
    const onDownload = vi.fn();
    render(
      <DocumentPreview name="budget.xlsx" kind="excel" mode="download" onDownload={onDownload} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Télécharger le document' }));
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it('documentIcon donne une icône par nature', () => {
    expect(documentIcon('pdf')).toBeTruthy();
    expect(documentIcon('image')).not.toBe(documentIcon('pdf'));
  });
});
