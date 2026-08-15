import { SettingModel } from '../../models/Setting/index.js';
import type { SettingLean } from '../../models/Setting/index.js';
import { withId } from '../../utils/lean.js';

export async function getSettings(schoolId: string): Promise<SettingLean> {
  let settings = await SettingModel.findOne({ school: schoolId }).lean();
  
  if (!settings) {
    const defaultSettings = await SettingModel.create({ school: schoolId });
    settings = defaultSettings.toJSON() as any;
  }
  
  return withId(settings) as SettingLean;
}

export async function updateSettings(schoolId: string, data: Partial<SettingLean>): Promise<SettingLean> {
  const current = await SettingModel.findOne({ school: schoolId });
  
  if (!current) {
    const newSettings = await SettingModel.create({ ...data, school: schoolId });
    return newSettings.toJSON() as SettingLean;
  }
  
  Object.assign(current, data);
  await current.save();
  
  return current.toJSON() as SettingLean;
}