import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { testUtils } from '../setup.js';
import app from '../test-server.js';

const testApp = request(app);

describe('Clients Integration Tests', () => {
  let testSchoolId: string;
  let adminToken: string;
  let sellerToken: string;
  let testClientId: string;

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

  describe('POST /clients', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .post('/clients')
        .send({
          fullName: 'Test Client',
          dni: '12345678',
          phone: '1122334455',
        })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 403 for non-admin user', async () => {
      const sellerToken = await testUtils.generateTestToken({
        sub: testUtils.createUserId(),
        role: 'seller',
        schoolId: testSchoolId,
        posId: testUtils.createProductId(),
      });

      const res = await testApp
        .post('/clients')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          fullName: 'Test Client',
          dni: '12345678',
          phone: '1122334455',
        })
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 400 for missing required fields', async () => {
      const res = await testApp
        .post('/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for invalid DNI format', async () => {
      const res = await testApp
        .post('/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Test Client',
          dni: 'invalid',
          phone: '1122334455',
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for invalid phone format', async () => {
      const res = await testApp
        .post('/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Test Client',
          dni: '12345678',
          phone: 'invalid',
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });
  });

  describe('GET /clients', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .get('/clients')
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 200 with valid token', async () => {
      const res = await testApp
        .get('/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(res.body).toHaveProperty('totalPages');
      expect(Array.isArray(res.body.items)).toBe(true);
    });

    it('should support search query parameter', async () => {
      const res = await testApp
        .get('/clients?search=Juan')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('items');
    });

    it('should support pagination', async () => {
      const res = await testApp
        .get('/clients?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('page', 1);
      expect(res.body).toHaveProperty('limit', 5);
    });

    it('should support isDefault filter', async () => {
      const res = await testApp
        .get('/clients?isDefault=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('items');
    });
  });

  describe('GET /clients/:id', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .get(`/clients/${testUtils.createClientId()}`)
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await testApp
        .get('/clients/not-a-valid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 404 for non-existent client', async () => {
      const res = await testApp
        .get(`/clients/${testUtils.createClientId()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(res.body).toHaveProperty('error', 'NOT_FOUND');
    });
  });

  describe('PATCH /clients/:id', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .patch(`/clients/${testUtils.createClientId()}`)
        .send({ fullName: 'Updated Name' })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 403 for non-admin user', async () => {
      const sellerToken = await testUtils.generateTestToken({
        sub: testUtils.createUserId(),
        role: 'seller',
        schoolId: testUtils.createSchoolId(),
        posId: testUtils.createProductId(),
      });

      const res = await testApp
        .patch(`/clients/${testUtils.createClientId()}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ fullName: 'Updated Name' })
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await testApp
        .patch('/clients/not-a-valid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ fullName: 'Updated Name' })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });
  });

  describe('DELETE /clients/:id', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .delete(`/clients/${testUtils.createClientId()}`)
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 403 for non-admin user', async () => {
      const sellerToken = await testUtils.generateTestToken({
        sub: testUtils.createUserId(),
        role: 'seller',
        schoolId: testUtils.createSchoolId(),
        posId: testUtils.createProductId(),
      });

      const res = await testApp
        .delete(`/clients/${testUtils.createClientId()}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await testApp
        .delete('/clients/not-a-valid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });
  });

  describe('GET /clients/search', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .get('/clients/search?q=Juan')
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 200 with valid token', async () => {
      const res = await testApp
        .get('/clients/search?q=Juan')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('items');
      expect(Array.isArray(res.body.items)).toBe(true);
    });

    it('should return empty array for empty query', async () => {
      const res = await testApp
        .get('/clients/search?q=')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.items).toEqual([]);
    });
  });
});