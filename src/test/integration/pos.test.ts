import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { testUtils } from '../setup.js';
import app from '../test-server.js';

const testApp = request(app);

describe('POS Integration Tests', () => {
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

  describe('GET /pos', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .get('/pos')
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 403 with token of seller', async () => {
      const res = await testApp
        .get('/pos')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 403 with token of superadmin', async () => {
      const res = await testApp
        .get('/pos')
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 200 with valid admin token', async () => {
      const res = await testApp
        .get('/pos')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.items)).toBe(true);
    });
  });

  describe('POST /pos', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .post('/pos')
        .send({
          name: 'Test POS',
          code: 'TP001',
        })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 403 with token of seller', async () => {
      const res = await testApp
        .post('/pos')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Test POS',
          code: 'TP001',
        })
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 403 with token of superadmin', async () => {
      const res = await testApp
        .post('/pos')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'Test POS',
          code: 'TP001',
        })
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 400 for missing required fields', async () => {
      const res = await testApp
        .post('/pos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for invalid code format', async () => {
      const res = await testApp
        .post('/pos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test POS',
          code: 'invalid@code',
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });
  });

  describe('PUT /pos/:id', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .put(`/pos/${testUtils.createUserId()}`)
        .send({ name: 'Updated Name' })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 403 with token of seller', async () => {
      const res = await testApp
        .put(`/pos/${testUtils.createUserId()}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ name: 'Updated Name' })
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 403 with token of superadmin', async () => {
      const res = await testApp
        .put(`/pos/${testUtils.createUserId()}`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({ name: 'Updated Name' })
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await testApp
        .put('/pos/not-a-valid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });
  });

  describe('DELETE /pos/:id', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .delete(`/pos/${testUtils.createUserId()}`)
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 403 with token of seller', async () => {
      const res = await testApp
        .delete(`/pos/${testUtils.createUserId()}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 403 with token of superadmin', async () => {
      const res = await testApp
        .delete(`/pos/${testUtils.createUserId()}`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await testApp
        .delete('/pos/not-a-valid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });
  });
});