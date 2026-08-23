import type { Request, Response } from 'express';
import * as posService from '../../Services/Pos/index.js';
import type { CreatePosInput, UpdatePosInput } from './types.js';

export async function listPos(req: Request, res: Response): Promise<void> {
  const result = await posService.listPos(req.schoolId!);
  res.json(result);
}

export async function createPos(req: Request, res: Response): Promise<void> {
  const result = await posService.createPos(req.schoolId!, req.body as CreatePosInput);
  res.status(201).json(result);
}

export async function updatePos(req: Request, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = await posService.updatePos(req.schoolId!, id, req.body as UpdatePosInput);
  res.json(result);
}

export async function deletePos(req: Request, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = await posService.deletePos(req.schoolId!, id);
  res.json(result);
}