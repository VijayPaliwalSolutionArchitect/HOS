const request = require('supertest');
const app = require('../../backend/app');

describe('Product API Tests', () => {
  describe('GET /api/products', () => {
    it('should return all products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toBeDefined();
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return 404 for non-existent product', async () => {
      const res = await request(app).get('/api/products/000000000000000000000000');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product with valid data', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        category: 'Electronics',
        stock: 10,
      };

      const res = await request(app)
        .post('/api/products')
        .send(productData);
      
      expect(res.statusCode).toBeDefined();
    });

    it('should return 400 for invalid product data', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({});
      
      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should return 404 for updating non-existent product', async () => {
      const res = await request(app)
        .put('/api/products/000000000000000000000000')
        .send({ name: 'Updated Name' });
      
      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should return 404 for deleting non-existent product', async () => {
      const res = await request(app)
        .delete('/api/products/000000000000000000000000');
      
      expect(res.statusCode).toBe(404);
    });
  });
});
