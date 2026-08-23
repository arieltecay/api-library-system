import type { Request, Response } from 'express';
import * as adminsService from '../../Services/Admins/index.js';
import type { ListAdminsInput, CreateAdminInput, UpdateAdminInput } from './types.js';

export async function listAdmins(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as ListAdminsInput;
  const result = await adminsService.listAdmins({
    search: query.search,
    active: query.active,
    page: query.page ?? 1,
    limit: query.limit ?? 20,
  });
  res.json(result);
}

export async function createAdmin(req: Request, res: Response): Promise<void> {
  const body = req.body as CreateAdminInput;
  const result = await adminsService.createAdmin(body);
  res.status(201).json(result);
}

export async function updateAdmin(req: Request, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const body = req.body as UpdateAdminInput;
  const result = await adminsService.updateAdmin(id, body);
  res.json(result);
}

export async function deleteAdmin(req: Request, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = await adminsService.deleteAdmin(id);
  res.json(result);
}