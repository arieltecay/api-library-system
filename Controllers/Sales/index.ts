import { Request, Response } from 'express';
import * as salesService from '../../Services/Sales/index.js';

export async function previewSale(req: Request, res: Response): Promise<void> {
  const { items, clientId, discount, paymentMethod, amountReceived } = req.body;
  const result = await salesService.previewSale(req.schoolId!, items, clientId, discount, paymentMethod, amountReceived);
  res.json(result);
}

export async function createSale(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new Error('Usuario no autenticado');
  const { items, clientId, discount, paymentMethod, amountReceived } = req.body;

  const { CashShiftModel } = await import('../../models/CashShift/index.js');
  const activeShift = await CashShiftModel.findOne({ seller: req.user.sub, school: req.schoolId, status: 'open' }).lean();
  if (!activeShift) {
    throw new Error('No hay turno de caja abierto para este vendedor');
  }

  const result = await salesService.createSale(
    req.schoolId!,
    req.user.sub,
    activeShift._id.toString(),
    items,
    clientId,
    discount,
    paymentMethod,
    amountReceived
  );
  res.status(201).json(result);
}

export async function listSales(req: Request, res: Response): Promise<void> {
  const q = req.query;
  const fromDate = q.fromDate ? new Date(q.fromDate as string) : undefined;
  const toDate = q.toDate ? new Date(q.toDate as string) : undefined;
  const result = await salesService.listSales({
    schoolId: req.schoolId!,
    clientId: q.clientId as string | undefined,
    sellerId: q.sellerId as string | undefined,
    paymentMethod: q.paymentMethod as 'cash' | 'transfer' | 'credit' | undefined,
    type: q.type as 'sale' | 'return' | undefined,
    voided: q.voided !== undefined ? q.voided === 'true' : undefined,
    fromDate,
    toDate,
    search: q.search as string | undefined,
    page: Number(q.page) || 1,
    limit: Number(q.limit) || 20,
    sortBy: (q.sortBy as string) || 'createdAt',
    sortOrder: (q.sortOrder as 'asc' | 'desc') || 'desc',
  });
  res.json(result);
}

export async function getSale(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const sale = await salesService.getSaleById(req.schoolId!, id);
  res.json(sale);
}

export async function getSalesSummary(req: Request, res: Response): Promise<void> {
  const summary = await salesService.getSalesSummary(req.schoolId!);
  res.json(summary);
}

export async function voidSale(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new Error('Usuario no autenticado');
  const id = req.params.id as string;
  const { reason } = req.body;
  const sale = await salesService.voidSale(req.schoolId!, id, req.user.sub, reason);
  res.json(sale);
}

export async function returnSale(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new Error('Usuario no autenticado');
  const id = req.params.id as string;
  const { reason, items, method } = req.body;
  const result = await salesService.returnSale(req.schoolId!, id, req.user.sub, reason, items, method);
  res.json(result);
}