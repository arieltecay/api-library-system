import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validation.js';
import * as schoolsController from '../../Controllers/Schools/index.js';
import { authMiddleware, requireAdmin } from '../../middleware/auth.js';

const router = Router();

const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido'),
  }),
});

const slugParamSchema = z.object({
  params: z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug inválido'),
  }),
});

const createSchoolSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nombre requerido').max(100),
    code: z.string().min(1, 'Código requerido').max(20).toUpperCase(),
    slug: z.string().max(150).optional(),
    address: z.string().max(200).optional(),
    phone: z.string().max(30).optional(),
    email: z.string().email('Email inválido').max(150).optional(),
  }),
});

const updateSchoolSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido'),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    code: z.string().min(1).max(20).toUpperCase().optional(),
    slug: z.string().max(150).optional(),
    address: z.string().max(200).optional(),
    phone: z.string().max(30).optional(),
    email: z.string().email('Email inválido').max(150).optional(),
    active: z.boolean().optional(),
  }),
});

const listSchoolsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    active: z.coerce.boolean().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['name', 'code', 'slug', 'createdAt']).default('name'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  }),
});

// Endpoint público para login - lista escuelas activas sin autenticación
router.get('/public', schoolsController.listPublicSchools);

// Endpoint público para login por slug - resuelve negocio por slug
router.get('/public/:slug', validate(slugParamSchema), schoolsController.getPublicSchoolBySlug);

// Rutas protegidas
router.use(authMiddleware);

router.get('/', validate(listSchoolsSchema), schoolsController.listSchools);
router.get('/:id', validate(idParamSchema), schoolsController.getSchool);
router.post('/', requireAdmin, validate(createSchoolSchema), schoolsController.createSchool);
router.patch('/:id', requireAdmin, validate(updateSchoolSchema), schoolsController.updateSchool);
router.delete('/:id', requireAdmin, validate(idParamSchema), schoolsController.deleteSchool);

export default router;