import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { testUtils } from '../setup.js';
import app from '../test-server.js';

const testApp = request(app);

describe('CashShifts Integration Tests', () => {
  let testSchoolId: string;
  let adminToken: string;
  let sellerToken: string;
  let testCashShiftId: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
    testSchoolId = testUtils.createSchoolId();

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

  describe('POST /cash-shifts (open)', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .post('/cash-shifts')
        .send({ openingAmount: 1000 })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 403 for non-seller/admin user', async () => {
      const userToken = await testUtils.generateTestToken({
        sub: testUtils.createUserId(),
        role: 'user',
        schoolId: testUtils.createSchoolId(),
        posId: testUtils.createProductId(),
      });

      const res = await testApp
        .post('/cash-shifts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ openingAmount: 1000 })
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 400 for missing openingAmount', async () => {
      const res = await testApp
        .post('/cash-shifts')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for invalid openingAmount', async () => {
      const res = await testApp
        .post('/cash-shifts')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ openingAmount: -100 })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for zero openingAmount', async () => {
      const res = await testApp
        .post('/cash-shifts')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ openingAmount: 0 })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });
  });

  describe('GET /cash-shifts/active', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .get('/cash-shifts/active')
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 200 with valid token', async () => {
      const res = await testApp
        .get('/cash-shifts/active')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('cashShift');
      expect(res.body).toHaveProperty('aggregated');
    });
  });

  describe('POST /cash-shifts/:id/close', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .post(`/cash-shifts/${testUtils.createCashShiftId()}/close`)
        .send({ closingAmount: 1500 })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await testApp
        .post('/cash-shifts/not-a-valid-id/close')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ closingAmount: 1500 })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for missing closingAmount', async () => {
      const res = await testApp
        .post(`/cash-shifts/${testUtils.createCashShiftId()}/close`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for negative closingAmount', async () => {
      const res = await testApp
        .post(`/cash-shifts/${testUtils.createCashShiftId()}/close`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ closingAmount: -100 })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });
  });

  describe('GET /cash-shifts', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .get('/cash-shifts')
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 200 with valid token', async () => {
      const res = await testApp
        .get('/cash-shifts')
        .set('Authorization', `Bearer ${adminToken}`)
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
        .get('/cash-shifts?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('page', 1);
      expect(res.body).toHaveProperty('limit', 5);
    });

    it('should support status filter', async () => {
      const res = await testApp
        .get('/cash-shifts?status=open')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('items');
    });
  });

  describe('GET /cash-shifts/:id', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .get(`/cash-shifts/${testUtils.createCashShiftId()}`)
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await testApp
        .get('/cash-shifts/not-a-valid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 404 for non-existent cash shift', async () => {
      const res = await testApp
        .get(`/cash-shifts/${testUtils.createCashShiftId()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(res.body).toHaveProperty('error', 'NOT_FOUND');
    });
  });

  describe('GET /cash-shifts/daily-summary', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .get('/cash-shifts/daily-summary')
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 200 with valid token', async () => {
      const res = await testApp
        .get('/cash-shifts/daily-summary')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('date');
      expect(res.body).toHaveProperty('totalOpening');
      expect(res.body).toHaveProperty('cashSales');
      expect(res.body).toHaveProperty('totalExpected');
      expect(res.body).toHaveProperty('finalCount');
      expect(res.body).toHaveProperty('difference');
    });

    it('should support date query parameter', async () => {
      const res = await testApp
        .get('/cash-shifts/daily-summary?date=2024-01-15')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('date');
    });
  });

  describe('POST /cash-shifts/:id/movements', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .post(`/cash-shifts/${testUtils.createCashShiftId()}/movements`)
        .send({
          type: 'in',
          category: 'lunch',
          amount: 500,
          description: 'Almuerzo',
        })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await testApp
        .post('/cash-shifts/not-a-valid-id/movements')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'in',
          category: 'lunch',
          amount: 500,
          description: 'Almuerzo',
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for missing type', async () => {
      const res = await testApp
        .post(`/cash-shifts/${testUtils.createCashShiftId()}/movements`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          category: 'lunch',
          amount: 500,
          description: 'Almuerzo',
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for invalid type', async () => {
      const res = await testApp
        .post(`/cash-shifts/${testUtils.createCashShiftId()}/movements`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'invalid',
          category: 'lunch',
          amount: 500,
          description: 'Almuerzo',
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for missing category', async () => {
      const res = await testApp
        .post(`/cash-shifts/${testUtils.createCashShiftId()}/movements`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'in',
          amount: 500,
          description: 'Almuerzo',
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for missing amount', async () => {
      const res = await testApp
        .post(`/cash-shifts/${testUtils.createCashShiftId()}/movements`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'in',
          category: 'lunch',
          description: 'Almuerzo',
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for negative amount', async () => {
      const res = await testApp
        .post(`/cash-shifts/${testUtils.createCashShiftId()}/movements`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          type: 'in',
          category: 'lunch',
          amount: -500,
          description: 'Almuerzo',
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });
  });

  describe('GET /cash-shifts/:id/movements', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .get(`/cash-shifts/${testUtils.createCashShiftId()}/movements`)
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await testApp
        .get('/cash-shifts/not-a-valid-id/movements')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });
  });
});