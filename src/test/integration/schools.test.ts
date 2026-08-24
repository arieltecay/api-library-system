import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { testUtils } from '../setup.js';
import app from '../test-server.js';

const testApp = request(app);

describe('Schools Integration Tests', () => {
  let testSchoolId: string;
  let adminToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
    testSchoolId = testUtils.createSchoolId();
    adminToken = await testUtils.generateTestToken({
      sub: testUtils.createUserId(),
      role: 'admin',
      schoolId: testSchoolId,
      posId: testUtils.createProductId(),
    });
  });

  describe('GET /schools/public', () => {
    it('should return list of active schools without authentication', async () => {
      const res = await testApp
        .get('/schools/public')
        .expect(200);

      expect(res.body).toHaveProperty('items');
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBeGreaterThan(0);
      expect(res.body.items[0]).toHaveProperty('id');
      expect(res.body.items[0]).toHaveProperty('name');
      expect(res.body.items[0]).toHaveProperty('slug');
    });
  });

  describe('GET /schools/public/:slug', () => {
    it('should return school by slug without authentication', async () => {
      const res = await testApp
        .get('/schools/public/libreria')
        .expect(200);

      expect(res.body).toHaveProperty('id', 'school-1');
      expect(res.body).toHaveProperty('name', 'Escuela Principal');
      expect(res.body).toHaveProperty('slug', 'libreria');
    });

    it('should return 404 for non-existent slug', async () => {
      const res = await testApp
        .get('/schools/public/noexiste')
        .expect(404);

      expect(res.body).toHaveProperty('error', 'NOT_FOUND');
    });

    it('should return 400 for invalid slug format', async () => {
      const res = await testApp
        .get('/schools/public/invalid_slug!')
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });
  });

  describe('POST /schools (protected)', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .post('/schools')
        .send({
          name: 'Nueva Escuela',
          code: 'NE1',
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
        .post('/schools')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Nueva Escuela',
          code: 'NE1',
        })
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 400 for missing required fields', async () => {
      const res = await testApp
        .post('/schools')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should create school with auto-generated slug from name', async () => {
      const res = await testApp
        .post('/schools')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Mi Nueva Escuela',
          code: 'MNE1',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id', 'new-school-id');
      expect(res.body).toHaveProperty('name', 'Mi Nueva Escuela');
      expect(res.body).toHaveProperty('code', 'MNE1');
      expect(res.body).toHaveProperty('slug');
      expect(typeof res.body.slug).toBe('string');
    });

    it('should create school with explicit slug', async () => {
      const res = await testApp
        .post('/schools')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Otra Escuela',
          code: 'OE1',
          slug: 'mi-slug-personalizado',
        })
        .expect(201);

      expect(res.body).toHaveProperty('slug', 'mi-slug-personalizado');
    });

    it('should return 409 for duplicate slug', async () => {
      const res = await testApp
        .post('/schools')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Escuela Duplicada',
          code: 'ED1',
          slug: 'libreria',
        })
        .expect(409);

      expect(res.body).toHaveProperty('error', 'CONFLICT_ERROR');
      expect(res.body.message).toContain('slug');
    });
  });

  describe('PATCH /schools/:id (protected)', () => {
    it('should return 401 for missing token', async () => {
      const res = await testApp
        .patch(`/schools/${testUtils.createSchoolId()}`)
        .send({ name: 'Updated' })
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
        .patch(`/schools/${testUtils.createSchoolId()}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ name: 'Updated' })
        .expect(403);

      expect(res.body).toHaveProperty('error', 'AUTHORIZATION_ERROR');
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await testApp
        .patch('/schools/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated' })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 409 for duplicate slug on update', async () => {
      const res = await testApp
        .patch(`/schools/${testUtils.createSchoolId()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ slug: 'libreria' })
        .expect(409);

      expect(res.body).toHaveProperty('error', 'CONFLICT_ERROR');
      expect(res.body.message).toContain('slug');
    });

    it('should update school with new slug', async () => {
      const res = await testApp
        .patch(`/schools/${testUtils.createSchoolId()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ slug: 'nuevo-slug-unico' })
        .expect(200);

      expect(res.body).toHaveProperty('slug', 'nuevo-slug-unico');
    });
  });
});