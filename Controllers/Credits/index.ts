import { Request, Response } from 'express';
import * as creditsService from '../../Services/Credits/index.js';
import { AuthenticationError } from '../../utils/errors.js';

export async function listCredits(req: Request, res: Response): Promise<void> {
  const q = req.query;
  const result = await creditsService.listCredits({
    schoolId: req.schoolId!,
    search: q.search as string | undefined,
    overdue: q.overdue !== undefined ? q.overdue === 'true' : undefined,
    page: Number(q.page) || 1,
    limit: Number(q.limit) || 20,
    sortBy: (q.sortBy as string) || 'balance',
    sortOrder: (q.sortOrder as 'asc' | 'desc') || 'desc',
  });
  res.json(result);
}

export async function getCreditsSummary(req: Request, res: Response): Promise<void> {
  const summary = await creditsService.getCreditsSummary(req.schoolId!);
  res.json(summary);
}

export async function getClientCredit(req: Request, res: Response): Promise<void> {
  const clientId = req.params.clientId as string;
  const q = req.query;
  const result = await creditsService.getClientCredit(req.schoolId!, clientId, Number(q.page) || 1, Number(q.limit) || 20);
  res.json(result);
}

export async function getRecentHistory(req: Request, res: Response): Promise<void> {
  const limit = Number(req.query.limit) || 5;
  const movements = await creditsService.getRecentHistory(req.schoolId!, limit);
  res.json(movements);
}

export async function settleDebt(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AuthenticationError('Usuario no autenticado');
  const clientId = req.params.clientId as string;
  const { amount, method, note } = req.body;
  const result = await creditsService.settleDebt(req.schoolId!, clientId, req.user.sub, amount, method, note);
  res.status(200).json({ message: 'Deuda saldada correctamente', data: result });
}