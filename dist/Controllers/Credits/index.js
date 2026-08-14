import * as creditsService from '../../Services/Credits/index.js';
export async function listCredits(req, res) {
    const q = req.query;
    const result = await creditsService.listCredits({
        search: q.search,
        overdue: q.overdue !== undefined ? q.overdue === 'true' : undefined,
        page: Number(q.page) || 1,
        limit: Number(q.limit) || 20,
        sortBy: q.sortBy || 'balance',
        sortOrder: q.sortOrder || 'desc',
    });
    res.json(result);
}
export async function getCreditsSummary(req, res) {
    const summary = await creditsService.getCreditsSummary();
    res.json(summary);
}
export async function getClientCredit(req, res) {
    const clientId = req.params.clientId;
    const q = req.query;
    const result = await creditsService.getClientCredit(clientId, Number(q.page) || 1, Number(q.limit) || 20);
    res.json(result);
}
export async function getRecentHistory(req, res) {
    const limit = Number(req.query.limit) || 5;
    const movements = await creditsService.getRecentHistory(limit);
    res.json(movements);
}
export async function settleDebt(req, res) {
    if (!req.user)
        throw new Error('Usuario no autenticado');
    const clientId = req.params.clientId;
    const { amount, method, note } = req.body;
    const result = await creditsService.settleDebt(clientId, req.user.sub, amount, method, note);
    res.json(result);
}
//# sourceMappingURL=index.js.map