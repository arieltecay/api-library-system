import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { testUtils } from '../setup.js';
import app from '../test-server.js';

const testApp = request(app);

describe('Admins Integration Tests', () => {
  let testSchoolId: string;
  let adminToken: string;
  let sellerToken: string;
  let superadminToken: string;

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

    superadminToken = await testUtils.generateTestToken({
      sub: testUtils.createUserId(),
      role: 'superadmin',
    });
  });

  describe('GET /admins', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .get('/admins')
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 403 with token of admin (not superadmin)', async () => {
      const res = await testApp
        .get('/admins')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 403 with token of seller', async () => {
      const res = await testApp
        .get('/admins')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 200 with valid superadmin token', async () => {
      const res = await testApp
        .get('/admins')
        .set('Authorization', `Bearer ${superadminToken}`)
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
        .get('/admins?page=1&limit=5')
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('page', 1);
      expect(res.body).toHaveProperty('limit', 5);
    });

    it('should support search filter', async () => {
      const res = await testApp
        .get('/admins?search=test')
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total');
    });

    it('should support active filter', async () => {
      const res = await testApp
        .get('/admins?active=true')
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total');
    });
  });

  describe('POST /admins', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .post('/admins')
        .send({
          name: 'Test Admin',
          email: 'test@test.com',
          password: 'password123',
          pin: '1234',
          schoolName: 'Test School',
          schoolCode: 'TS001',
        })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 403 with token of admin (not superadmin)', async () => {
      const res = await testApp
        .post('/admins')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Admin',
          email: 'test@test.com',
          password: 'password123',
          pin: '1234',
          schoolName: 'Test School',
          schoolCode: 'TS001',
        })
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 400 for missing required fields', async () => {
      const res = await testApp
        .post('/admins')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for invalid email format', async () => {
      const res = await testApp
        .post('/admins')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'Test Admin',
          email: 'invalid-email',
          password: 'password123',
          pin: '1234',
          schoolName: 'Test School',
          schoolCode: 'TS001',
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for short password', async () => {
      const res = await testApp
        .post('/admins')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'Test Admin',
          email: 'test@test.com',
          password: '123',
          pin: '1234',
          schoolName: 'Test School',
          schoolCode: 'TS001',
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for invalid PIN format', async () => {
      const res = await testApp
        .post('/admins')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'Test Admin',
          email: 'test@test.com',
          password: 'password123',
          pin: '123',
          schoolName: 'Test School',
          schoolCode: 'TS001',
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for invalid schoolCode format', async () => {
      const res = await testApp
        .post('/admins')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'Test Admin',
          email: 'test@test.com',
          password: 'password123',
          pin: '1234',
          schoolName: 'Test School',
          schoolCode: 'invalid@code',
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });
  });

  describe('PUT /admins/:id', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .put(`/admins/${testUtils.createUserId()}`)
        .send({ name: 'Updated Name' })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 403 with token of admin (not superadmin)', async () => {
      const res = await testApp
        .put(`/admins/${testUtils.createUserId()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await testApp
        .put('/admins/not-a-valid-id')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({ name: 'Updated Name' })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });
  });

  describe('DELETE /admins/:id', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .delete(`/admins/${testUtils.createUserId()}`)
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 403 with token of admin (not superadmin)', async () => {
      const res = await testApp
        .delete(`/admins/${testUtils.createUserId()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await testApp
        .delete('/admins/not-a-valid-id')
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 404 for non-existent admin', async () => {
      const res = await testApp
        .delete(`/admins/${testUtils.createUserId()}`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(404);

      expect(res.body).toHaveProperty('error', 'NOT_FOUND');
    });
  });
});