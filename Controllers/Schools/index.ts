import { Request, Response } from 'express';
import * as schoolsService from '../../Services/Schools/index.js';

export async function listSchools(req: Request, res: Response): Promise<void> {
  const q = req.query;
  const result = await schoolsService.listSchools({
    search: q.search as string | undefined,
    active: q.active !== undefined ? q.active === 'true' : undefined,
    page: Number(q.page) || 1,
    limit: Number(q.limit) || 20,
    sortBy: (q.sortBy as string) || 'name',
    sortOrder: (q.sortOrder as 'asc' | 'desc') || 'asc',
  });
  res.json(result);
}

export async function getSchool(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const school = await schoolsService.getSchoolById(id);
  res.json(school);
}

export async function createSchool(req: Request, res: Response): Promise<void> {
  const school = await schoolsService.createSchool(req.body);
  res.status(201).json(school);
}

export async function updateSchool(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const school = await schoolsService.updateSchool(id, req.body);
  res.json(school);
}

export async function deleteSchool(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  await schoolsService.deleteSchool(id);
  res.status(204).send();
}