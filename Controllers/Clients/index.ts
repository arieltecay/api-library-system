import { Request, Response } from 'express';
import * as clientsService from '../../Services/Clients/index.js';

export async function listClients(req: Request, res: Response): Promise<void> {
  const q = req.query;
  const result = await clientsService.listClients({
    schoolId: req.schoolId!,
    search: q.search as string | undefined,
    hasDebt: q.hasDebt !== undefined ? q.hasDebt === 'true' : undefined,
    active: q.active !== undefined ? q.active === 'true' : undefined,
    page: Number(q.page) || 1,
    limit: Number(q.limit) || 20,
    sortBy: (q.sortBy as string) || 'fullName',
    sortOrder: (q.sortOrder as 'asc' | 'desc') || 'asc',
  });
  res.json(result);
}

export async function getClient(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const client = await clientsService.getClientById(req.schoolId!, id);
  res.json(client);
}

export async function createClient(req: Request, res: Response): Promise<void> {
  const result = await clientsService.createClient(req.schoolId!, req.body);
  res.status(201).json(result);
}

export async function updateClient(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const result = await clientsService.updateClient(req.schoolId!, id, req.body);
  res.json(result);
}

export async function deleteClient(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  await clientsService.deleteClient(req.schoolId!, id);
  res.status(204).send();
}

export async function getClientHistory(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const q = req.query;
  const result = await clientsService.getClientHistory(req.schoolId!, id, Number(q.page) || 1, Number(q.limit) || 20);
  res.json(result);
}

export async function getDebtors(req: Request, res: Response): Promise<void> {
  const debtors = await clientsService.getDebtors(req.schoolId!);
  res.json(debtors);
}