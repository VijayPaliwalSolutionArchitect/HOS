import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../frontend/src/App';

describe('App Component', () => {
  it('renders the app header', () => {
    render(<App />);
    const headerElement = screen.getByText(/E-commerce Store/i);
    expect(headerElement).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<App />);
    const homeLink = screen.getByText(/Home/i);
    const checkoutLink = screen.getByText(/Checkout/i);
    expect(homeLink).toBeInTheDocument();
    expect(checkoutLink).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(<App />);
    const footerElement = screen.getByText(/All rights reserved/i);
    expect(footerElement).toBeInTheDocument();
  });
});
