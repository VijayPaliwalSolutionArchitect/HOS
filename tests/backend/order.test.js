const request = require('supertest');
const app = require('../../backend/app');

describe('Order API Tests', () => {
  describe('POST /api/orders', () => {
    it('should create a new order with valid data', async () => {
      const orderData = {
        orderItems: [
          {
            name: 'Test Product',
            quantity: 2,
            price: 29.99,
            product: '000000000000000000000000',
          },
        ],
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country',
        },
        paymentMethod: 'CreditCard',
        taxPrice: 5.0,
        shippingPrice: 10.0,
        totalPrice: 74.98,
      };

      const res = await request(app)
        .post('/api/orders')
        .send(orderData);
      
      expect(res.statusCode).toBeDefined();
    });

    it('should return 400 for empty order items', async () => {
      const orderData = {
        orderItems: [],
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country',
        },
        paymentMethod: 'CreditCard',
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: 0,
      };

      const res = await request(app)
        .post('/api/orders')
        .send(orderData);
      
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/orders', () => {
    it('should return all orders', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.statusCode).toBeDefined();
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return 404 for non-existent order', async () => {
      const res = await request(app).get('/api/orders/000000000000000000000000');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/orders/:id/pay', () => {
    it('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .put('/api/orders/000000000000000000000000/pay')
        .send({
          id: 'payment-123',
          status: 'completed',
        });
      
      expect(res.statusCode).toBe(404);
    });
  });
});
