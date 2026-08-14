import * as salesService from '../../Services/Sales/index.js';
export async function previewSale(req, res) {
    const { items, clientId, discount, paymentMethod, amountReceived } = req.body;
    const result = await salesService.previewSale(items, clientId, discount, paymentMethod, amountReceived);
    res.json(result);
}
export async function createSale(req, res) {
    if (!req.user)
        throw new Error('Usuario no autenticado');
    const { items, clientId, discount, paymentMethod, amountReceived } = req.body;
    const { CashShiftModel } = await import('../../models/CashShift/index.js');
    const activeShift = await CashShiftModel.findOne({ seller: req.user.sub, status: 'open' }).lean();
    if (!activeShift) {
        throw new Error('No hay turno de caja abierto para este vendedor');
    }
    const result = await salesService.createSale(req.user.sub, activeShift._id.toString(), items, clientId, discount, paymentMethod, amountReceived);
    res.status(201).json(result);
}
export async function listSales(req, res) {
    const q = req.query;
    const fromDate = q.fromDate ? new Date(q.fromDate) : undefined;
    const toDate = q.toDate ? new Date(q.toDate) : undefined;
    const result = await salesService.listSales({
        clientId: q.clientId,
        sellerId: q.sellerId,
        paymentMethod: q.paymentMethod,
        type: q.type,
        voided: q.voided !== undefined ? q.voided === 'true' : undefined,
        fromDate,
        toDate,
        search: q.search,
        page: Number(q.page) || 1,
        limit: Number(q.limit) || 20,
        sortBy: q.sortBy || 'createdAt',
        sortOrder: q.sortOrder || 'desc',
    });
    res.json(result);
}
export async function getSale(req, res) {
    const id = req.params.id;
    const sale = await salesService.getSaleById(id);
    res.json(sale);
}
export async function voidSale(req, res) {
    if (!req.user)
        throw new Error('Usuario no autenticado');
    const id = req.params.id;
    const { reason } = req.body;
    const sale = await salesService.voidSale(id, req.user.sub, reason);
    res.json(sale);
}
export async function returnSale(req, res) {
    if (!req.user)
        throw new Error('Usuario no autenticado');
    const id = req.params.id;
    const { reason, items, method } = req.body;
    const result = await salesService.returnSale(id, req.user.sub, reason, items, method);
    res.json(result);
}
//# sourceMappingURL=index.js.map