import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { testUtils } from '../setup.js';
import app from '../test-server.js';

const testApp = request(app);

describe('Users Integration Tests', () => {
  let testSchoolId: string;
  let adminToken: string;
  let sellerToken: string;

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

  describe('POST /users', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .post('/users')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123',
          role: 'seller',
        })
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
        .post('/users')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123',
          role: 'seller',
        })
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 400 for missing required fields', async () => {
      const res = await testApp
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for invalid email format', async () => {
      const res = await testApp
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
          role: 'seller',
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for short password', async () => {
      const res = await testApp
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: '123',
          role: 'seller',
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 for invalid role', async () => {
      const res = await testApp
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123',
          role: 'invalid',
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });
  });

  describe('GET /users', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .get('/users')
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 403 for non-admin user', async () => {
      const res = await testApp
        .get('/users')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 200 with valid admin token', async () => {
      const res = await testApp
        .get('/users')
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
        .get('/users?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('page', 1);
      expect(res.body).toHaveProperty('limit', 5);
    });
  });

  describe('GET /users/:id', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .get(`/users/${testUtils.createUserId()}`)
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 403 for non-admin user', async () => {
      const res = await testApp
        .get(`/users/${testUtils.createUserId()}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await testApp
        .get('/users/not-a-valid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await testApp
        .get(`/users/${testUtils.createUserId()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(res.body).toHaveProperty('error', 'NOT_FOUND');
    });
  });

  describe('PATCH /users/:id', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .patch(`/users/${testUtils.createUserId()}`)
        .send({ name: 'Updated Name' })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 403 for non-admin user', async () => {
      const res = await testApp
        .patch(`/users/${testUtils.createUserId()}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ name: 'Updated Name' })
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await testApp
        .patch('/users/not-a-valid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .delete(`/users/${testUtils.createUserId()}`)
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 403 for non-admin user', async () => {
      const res = await testApp
        .delete(`/users/${testUtils.createUserId()}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await testApp
        .delete('/users/not-a-valid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });
  });

  describe('POST /users/:id/change-password', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .post(`/users/${testUtils.createUserId()}/change-password`)
        .send({ currentPassword: 'old', newPassword: 'new' })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'AUTHENTICATION_ERROR');
    });

    it('should return 403 for non-admin user', async () => {
      const res = await testApp
        .post(`/users/${testUtils.createUserId()}/change-password`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ currentPassword: 'old', newPassword: 'new' })
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 400 for missing fields', async () => {
      const res = await testApp
        .post(`/users/${testUtils.createUserId()}/change-password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });
  });
});