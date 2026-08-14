import { SettingModel } from '../../models/Setting/index.js';
import { withId } from '../../utils/lean.js';
export async function getSettings() {
    let settings = await SettingModel.findOne().lean();
    if (!settings) {
        const defaultSettings = await SettingModel.create({});
        settings = defaultSettings.toJSON();
    }
    return withId(settings);
}
export async function updateSettings(data) {
    const current = await SettingModel.findOne();
    if (!current) {
        const newSettings = await SettingModel.create(data);
        return newSettings.toJSON();
    }
    Object.assign(current, data);
    await current.save();
    return current.toJSON();
}
//# sourceMappingURL=index.js.map