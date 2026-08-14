import { Request, Response } from 'express';
import * as dashboardService from '../../Services/Dashboard/index.js';

export async function getToday(req: Request, res: Response): Promise<void> {
  const result = await dashboardService.getTodayKPIs();
  res.json(result);
}

export async function getSalesChart(req: Request, res: Response): Promise<void> {
  const days = Number(req.query.days) || 7;
  const result = await dashboardService.getSalesChart(days);
  res.json(result);
}

export async function getSalesByHour(_req: Request, res: Response): Promise<void> {
  const result = await dashboardService.getSalesByHour();
  res.json(result);
}

export async function getTopProducts(req: Request, res: Response): Promise<void> {
  const limit = Number(req.query.limit) || 10;
  const result = await dashboardService.getTopProducts(limit);
  res.json(result);
}

export async function getDailyClosing(req: Request, res: Response): Promise<void> {
  const date = req.query.date as string | undefined;
  const result = await dashboardService.getDailyClosing(date);
  res.json(result);
}

export async function getShifts(req: Request, res: Response): Promise<void> {
  const fromDate = req.query.fromDate ? new Date(req.query.fromDate as string) : undefined;
  const toDate = req.query.toDate ? new Date(req.query.toDate as string) : undefined;
  const result = await dashboardService.getShifts(fromDate, toDate);
  res.json(result);
}
