import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ImpactoPage from './page';
import ImpactoEnPage from '../en/impacto/page';

describe('Impacto page', () => {
  it('ES: renders H1', () => {
    render(<ImpactoPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('EN: renders H1', () => {
    render(<ImpactoEnPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
