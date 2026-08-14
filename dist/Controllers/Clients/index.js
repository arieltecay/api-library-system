import * as clientsService from '../../Services/Clients/index.js';
export async function listClients(req, res) {
    const q = req.query;
    const result = await clientsService.listClients({
        search: q.search,
        hasDebt: q.hasDebt !== undefined ? q.hasDebt === 'true' : undefined,
        active: q.active !== undefined ? q.active === 'true' : undefined,
        page: Number(q.page) || 1,
        limit: Number(q.limit) || 20,
        sortBy: q.sortBy || 'fullName',
        sortOrder: q.sortOrder || 'asc',
    });
    res.json(result);
}
export async function getClient(req, res) {
    const id = req.params.id;
    const client = await clientsService.getClientById(id);
    res.json(client);
}
export async function createClient(req, res) {
    const result = await clientsService.createClient(req.body);
    res.status(201).json(result);
}
export async function updateClient(req, res) {
    const id = req.params.id;
    const result = await clientsService.updateClient(id, req.body);
    res.json(result);
}
export async function deleteClient(req, res) {
    const id = req.params.id;
    await clientsService.deleteClient(id);
    res.status(204).send();
}
export async function getClientHistory(req, res) {
    const id = req.params.id;
    const q = req.query;
    const result = await clientsService.getClientHistory(id, Number(q.page) || 1, Number(q.limit) || 20);
    res.json(result);
}
export async function getDebtors(req, res) {
    const debtors = await clientsService.getDebtors();
    res.json(debtors);
}
//# sourceMappingURL=index.js.map