import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CalculadoraPage from './page';
import CalculadoraEnPage from '../en/calculadora/page';

describe('Calculadora page', () => {
  it('ES: renders H1', () => {
    render(<CalculadoraPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('EN: renders H1', () => {
    render(<CalculadoraEnPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
