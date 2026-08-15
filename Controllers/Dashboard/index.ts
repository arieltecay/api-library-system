import { Request, Response } from 'express';
import * as dashboardService from '../../Services/Dashboard/index.js';

export async function getToday(req: Request, res: Response): Promise<void> {
  const result = await dashboardService.getTodayKPIs(req.schoolId!);
  res.json(result);
}

export async function getSalesChart(req: Request, res: Response): Promise<void> {
  const days = Number(req.query.days) || 7;
  const result = await dashboardService.getSalesChart(req.schoolId!, days);
  res.json(result);
}

export async function getSalesByHour(req: Request, res: Response): Promise<void> {
  const result = await dashboardService.getSalesByHour(req.schoolId!);
  res.json(result);
}

export async function getTopProducts(req: Request, res: Response): Promise<void> {
  const limit = Number(req.query.limit) || 10;
  const result = await dashboardService.getTopProducts(req.schoolId!, limit);
  res.json(result);
}

export async function getDailyClosing(req: Request, res: Response): Promise<void> {
  const date = req.query.date as string | undefined;
  const result = await dashboardService.getDailyClosing(req.schoolId!, date);
  res.json(result);
}

export async function getShifts(req: Request, res: Response): Promise<void> {
  const fromDate = req.query.fromDate ? new Date(req.query.fromDate as string) : undefined;
  const toDate = req.query.toDate ? new Date(req.query.toDate as string) : undefined;
  const result = await dashboardService.getShifts(req.schoolId!, fromDate, toDate);
  res.json(result);
}