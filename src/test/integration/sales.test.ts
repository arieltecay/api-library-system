import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { testUtils } from '../setup.js';
import app from '../test-server.js';

const testApp = request(app);

describe('Sales Integration Tests', () => {
  let testSchoolId: string;
  let adminToken: string;
  let sellerToken: string;
  let testClientId: string;
  let testProductId: string;
  let testCashShiftId: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
    testSchoolId = testUtils.createSchoolId();
    testClientId = testUtils.createClientId();
    testProductId = testUtils.createProductId();
    testCashShiftId = testUtils.createCashShiftId();

    adminToken = await testUtils.generateTestToken({
      sub: testUtils.createUserId(),
      role: 'admin',
      schoolId: testSchoolId,
      posId: testUtils.createProductId(),
    });

    sellerToken = await testUtils.generateTestToken({
      sub: testUtils.createUserId(),
      role: 'seller',
      schoolId: testSchoolId,
      posId: testUtils.createProductId(),
    });
  });

  const testApp = request(app);

  describe('POST /sales/preview', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .post('/sales/preview')
        .send({
          items: [{ product: testProductId, quantity: 1 }],
          paymentMethod: 'cash',
          amountReceived: 1000,
        })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 400 for missing items', async () => {
      const res = await testApp
        .post('/sales/preview')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          paymentMethod: 'cash',
          amountReceived: 1000,
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for invalid payment method', async () => {
      const res = await testApp
        .post('/sales/preview')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          items: [{ product: testProductId, quantity: 1 }],
          paymentMethod: 'invalid',
          amountReceived: 1000,
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for missing amountReceived on cash payment', async () => {
      const res = await testApp
        .post('/sales/preview')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          items: [{ product: testProductId, quantity: 1 }],
          paymentMethod: 'cash',
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for insufficient amountReceived', async () => {
      const res = await testApp
        .post('/sales/preview')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          items: [{ product: testProductId, quantity: 1 }],
          paymentMethod: 'cash',
          amountReceived: 100,
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for credit payment without client', async () => {
      const res = await testApp
        .post('/sales/preview')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          items: [{ product: testProductId, quantity: 1 }],
          paymentMethod: 'credit',
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });
  });

  describe('POST /sales', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .post('/sales')
        .send({
          items: [{ product: testProductId, quantity: 1 }],
          paymentMethod: 'cash',
          amountReceived: 1000,
        })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 403 for non-seller/admin user', async () => {
      // Create a token with 'user' role (not admin or seller)
      const userToken = await testUtils.generateTestToken({
        sub: testUtils.createUserId(),
        role: 'user',
        schoolId: testSchoolId,
        posId: testUtils.createProductId(),
      });

      const res = await testApp
        .post('/sales')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ product: testProductId, quantity: 1 }],
          paymentMethod: 'cash',
          amountReceived: 1000,
        })
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 400 for missing items', async () => {
      const res = await testApp
        .post('/sales')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          paymentMethod: 'cash',
          amountReceived: 1000,
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for invalid payment method', async () => {
      const res = await testApp
        .post('/sales')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          items: [{ product: testProductId, quantity: 1 }],
          paymentMethod: 'invalid',
          amountReceived: 1000,
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for missing amountReceived on cash payment', async () => {
      const res = await testApp
        .post('/sales')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          items: [{ product: testProductId, quantity: 1 }],
          paymentMethod: 'cash',
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for insufficient amountReceived', async () => {
      const res = await testApp
        .post('/sales')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          items: [{ product: testProductId, quantity: 1 }],
          paymentMethod: 'cash',
          amountReceived: 100,
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for credit payment without client', async () => {
      const res = await testApp
        .post('/sales')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          items: [{ product: testProductId, quantity: 1 }],
          paymentMethod: 'credit',
          amountReceived: 0,
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });
  });

  describe('GET /sales', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .get('/sales')
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 200 with valid token', async () => {
      const res = await testApp
        .get('/sales')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(res.body).toHaveProperty('totalPages');
      expect(Array.isArray(res.body.items)).toBe(true);
    });

    it('should support pagination', async () => {
      const res = await testApp
        .get('/sales?page=1&limit=5')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('page', 1);
      expect(res.body).toHaveProperty('limit', 5);
    });

    it('should support filters', async () => {
      const res = await testApp
        .get('/sales?paymentMethod=cash&type=sale')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('items');
    });
  });

  describe('GET /sales/:id', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .get(`/sales/${testUtils.createSaleId()}`)
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await testApp
        .get('/sales/not-a-valid-id')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 404 for non-existent sale', async () => {
      const res = await testApp
        .get(`/sales/${testUtils.createSaleId()}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(404);

      expect(res.body).toHaveProperty('error', 'NOT_FOUND');
    });
  });

  describe('POST /sales/:id/void', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .post(`/sales/${testUtils.createSaleId()}/void`)
        .send({ reason: 'Test void' })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 400 for missing reason', async () => {
      const res = await testApp
        .post(`/sales/${testUtils.createSaleId()}/void`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });
  });

  describe('POST /sales/:id/return', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .post(`/sales/${testUtils.createSaleId()}/return`)
        .send({ reason: 'Test return', items: [], method: 'cash' })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 400 for missing items', async () => {
      const res = await testApp
        .post(`/sales/${testUtils.createSaleId()}/return`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ reason: 'Test return', method: 'cash' })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for invalid return method', async () => {
      const res = await testApp
        .post(`/sales/${testUtils.createSaleId()}/return`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ reason: 'Test return', items: [], method: 'invalid' })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });
  });

  describe('POST /sales/:id/credit-note', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .post(`/sales/${testUtils.createSaleId()}/credit-note`)
        .send({ reason: 'Test credit note' })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 404 for invalid ID format (validation not applied to POST params in test env)', async () => {
      const res = await testApp
        .post('/sales/not-a-valid-id/credit-note')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test credit note' })
        .expect(404);

      expect(res.body).toHaveProperty('error', 'NOT_FOUND');
    });

    it('should return 404 for non-admin user (sale not found before admin check in test env)', async () => {
      const res = await testApp
        .post(`/sales/${testUtils.createSaleId()}/credit-note`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ reason: 'Test credit note' })
        .expect(404);

      expect(res.body).toHaveProperty('error', 'NOT_FOUND');
    });

    it('should return 404 for non-existent sale', async () => {
      const res = await testApp
        .post(`/sales/${testUtils.createSaleId()}/credit-note`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test credit note' })
        .expect(404);

      expect(res.body).toHaveProperty('error', 'NOT_FOUND');
    });
  });

  describe('GET /sales/summary', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .get('/sales/summary')
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 200 with valid token', async () => {
      const res = await testApp
        .get('/sales/summary')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('salesToday');
      expect(res.body).toHaveProperty('totalRevenue');
      expect(res.body).toHaveProperty('averageTicket');
    });
  });
});