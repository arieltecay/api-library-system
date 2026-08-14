import * as settingsService from '../../Services/Settings/index.js';
export async function getSettings(_req, res) {
    const result = await settingsService.getSettings();
    res.json(result);
}
export async function updateSettings(req, res) {
    const result = await settingsService.updateSettings(req.body);
    res.json(result);
}
//# sourceMappingURL=index.js.map