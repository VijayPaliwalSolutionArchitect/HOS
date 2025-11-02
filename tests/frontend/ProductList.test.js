import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import ProductList from '../../frontend/src/components/ProductList';

jest.mock('axios');

describe('ProductList Component', () => {
  const mockProducts = [
    {
      _id: '1',
      name: 'Test Product 1',
      description: 'Test Description 1',
      price: 29.99,
      stock: 10,
      imageUrl: '/test-image1.jpg',
    },
    {
      _id: '2',
      name: 'Test Product 2',
      description: 'Test Description 2',
      price: 49.99,
      stock: 0,
      imageUrl: '/test-image2.jpg',
    },
  ];

  const mockOnAddToCart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    render(<ProductList onAddToCart={mockOnAddToCart} />);
    expect(screen.getByText(/Loading products/i)).toBeInTheDocument();
  });

  it('renders products after successful fetch', async () => {
    axios.get.mockResolvedValue({ data: mockProducts });
    render(<ProductList onAddToCart={mockOnAddToCart} />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    });
  });

  it('renders error message on fetch failure', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'));
    render(<ProductList onAddToCart={mockOnAddToCart} />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Network Error/i)).toBeInTheDocument();
    });
  });

  it('displays out of stock for products with zero stock', async () => {
    axios.get.mockResolvedValue({ data: mockProducts });
    render(<ProductList onAddToCart={mockOnAddToCart} />);

    await waitFor(() => {
      const outOfStockButtons = screen.getAllByText(/Out of Stock/i);
      expect(outOfStockButtons.length).toBeGreaterThan(0);
    });
  });
});
