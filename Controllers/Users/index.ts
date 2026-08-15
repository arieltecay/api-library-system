import { Request, Response } from 'express';
import * as usersService from '../../Services/Users/index.js';

export async function listUsers(req: Request, res: Response): Promise<void> {
  const q = req.query;
  const result = await usersService.listUsers({
    schoolId: req.schoolId!,
    search: q.search as string | undefined,
    role: q.role as 'admin' | 'seller' | undefined,
    active: q.active !== undefined ? q.active === 'true' : undefined,
    page: Number(q.page) || 1,
    limit: Number(q.limit) || 20,
    sortBy: (q.sortBy as string) || 'name',
    sortOrder: (q.sortOrder as 'asc' | 'desc') || 'asc',
  });
  res.json(result);
}

export async function getUsersSummary(req: Request, res: Response): Promise<void> {
  const summary = await usersService.getUsersSummary(req.schoolId!);
  res.json(summary);
}

export async function getUser(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const result = await usersService.getUserById(req.schoolId!, id);
  res.json(result);
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const result = await usersService.createUser(req.schoolId!, req.body);
  res.status(201).json(result);
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const result = await usersService.updateUser(req.schoolId!, id, req.body);
  res.json(result);
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const result = await usersService.deleteUser(req.schoolId!, id);
  res.json(result);
}