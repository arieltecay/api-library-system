import * as cashShiftsService from '../../Services/CashShifts/index.js';
export async function openCashShift(req, res) {
    if (!req.user)
        throw new Error('Usuario no autenticado');
    const { openingAmount } = req.body;
    const cashShift = await cashShiftsService.openCashShift(req.user.sub, openingAmount);
    res.status(201).json(cashShift);
}
export async function getActiveCashShift(req, res) {
    if (!req.user)
        throw new Error('Usuario no autenticado');
    const result = await cashShiftsService.getActiveCashShiftWithDetails(req.user.sub);
    res.json(result);
}
export async function closeCashShift(req, res) {
    if (!req.user)
        throw new Error('Usuario no autenticado');
    const { id } = req.params;
    const { closingAmount, note } = req.body;
    const result = await cashShiftsService.closeCashShift(id, req.user.sub, closingAmount, note);
    res.json(result);
}
export async function getCashShift(req, res) {
    const id = req.params.id;
    const cashShift = await cashShiftsService.getCashShiftById(id);
    res.json(cashShift);
}
export async function listCashShifts(req, res) {
    const query = req.query;
    const fromDate = query.fromDate ? new Date(query.fromDate) : undefined;
    const toDate = query.toDate ? new Date(query.toDate) : undefined;
    const hasDifference = query.hasDifference !== undefined ? query.hasDifference === 'true' : undefined;
    const result = await cashShiftsService.listCashShifts({
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 20,
        sortBy: query.sortBy || 'openedAt',
        sortOrder: query.sortOrder || 'desc',
        sellerId: query.sellerId,
        status: query.status,
        hasDifference,
        fromDate,
        toDate,
    });
    res.json(result);
}
export async function getDailySummary(req, res) {
    const date = req.query.date ? new Date(req.query.date) : undefined;
    const summary = await cashShiftsService.getDailySummary(date);
    res.json(summary);
}
//# sourceMappingURL=index.js.map