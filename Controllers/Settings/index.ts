import { Request, Response } from 'express';
import * as settingsService from '../../Services/Settings/index.js';

export async function getSettings(req: Request, res: Response): Promise<void> {
  const result = await settingsService.getSettings(req.schoolId!);
  res.json(result);
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  const result = await settingsService.updateSettings(req.schoolId!, req.body);
  res.json(result);
}