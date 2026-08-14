import * as productsService from '../../Services/Products/index.js';
export async function listProducts(req, res) {
    const q = req.query;
    const result = await productsService.listProducts({
        search: q.search,
        type: q.type,
        active: q.active !== undefined ? q.active === 'true' : undefined,
        lowStock: q.lowStock !== undefined ? q.lowStock === 'true' : undefined,
        page: Number(q.page) || 1,
        limit: Number(q.limit) || 20,
        sortBy: q.sortBy || 'name',
        sortOrder: q.sortOrder || 'asc',
    });
    res.json(result);
}
export async function getProduct(req, res) {
    const id = req.params.id;
    const product = await productsService.getProductById(id);
    res.json(product);
}
export async function createProduct(req, res) {
    const product = await productsService.createProduct(req.body);
    res.status(201).json(product);
}
export async function updateProduct(req, res) {
    const id = req.params.id;
    const product = await productsService.updateProduct(id, req.body);
    res.json(product);
}
export async function deleteProduct(req, res) {
    const id = req.params.id;
    await productsService.deleteProduct(id);
    res.status(204).send();
}
export async function updateStock(req, res) {
    const id = req.params.id;
    const { quantity, operation } = req.body;
    const result = await productsService.updateStock(id, quantity, operation);
    res.json(result);
}
export async function getLowStock(req, res) {
    const products = await productsService.getLowStockProducts();
    res.json(products);
}
//# sourceMappingURL=index.js.map