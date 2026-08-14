import * as usersService from '../../Services/Users/index.js';
export async function listUsers(req, res) {
    const q = req.query;
    const result = await usersService.listUsers({
        search: q.search,
        role: q.role,
        active: q.active !== undefined ? q.active === 'true' : undefined,
        page: Number(q.page) || 1,
        limit: Number(q.limit) || 20,
        sortBy: q.sortBy || 'name',
        sortOrder: q.sortOrder || 'asc',
    });
    res.json(result);
}
export async function getUsersSummary(_req, res) {
    const summary = await usersService.getUsersSummary();
    res.json(summary);
}
export async function getUser(req, res) {
    const id = req.params.id;
    const result = await usersService.getUserById(id);
    res.json(result);
}
export async function createUser(req, res) {
    const result = await usersService.createUser(req.body);
    res.status(201).json(result);
}
export async function updateUser(req, res) {
    const id = req.params.id;
    const result = await usersService.updateUser(id, req.body);
    res.json(result);
}
export async function deleteUser(req, res) {
    const id = req.params.id;
    const result = await usersService.deleteUser(id);
    res.json(result);
}
//# sourceMappingURL=index.js.map