import { SettingModel } from '../../models/Setting/index.js';
import type { SettingLean } from '../../models/Setting/index.js';
import { withId } from '../../utils/lean.js';

export async function getSettings(): Promise<SettingLean> {
  let settings = await SettingModel.findOne().lean();
  
  if (!settings) {
    const defaultSettings = await SettingModel.create({});
    settings = defaultSettings.toJSON() as any;
  }
  
  return withId(settings) as SettingLean;
}

export async function updateSettings(data: Partial<SettingLean>): Promise<SettingLean> {
  const current = await SettingModel.findOne();
  
  if (!current) {
    const newSettings = await SettingModel.create(data);
    return newSettings.toJSON() as SettingLean;
  }
  
  Object.assign(current, data);
  await current.save();
  
  return current.toJSON() as SettingLean;
}
