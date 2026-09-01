import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ServiciosPage from './page';
import ServiciosEnPage from '../en/servicios/page';

describe('Servicios page', () => {
  it('ES: renders H1', () => {
    render(<ServiciosPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('EN: renders H1', () => {
    render(<ServiciosEnPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
