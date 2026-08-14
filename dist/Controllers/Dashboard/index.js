import * as dashboardService from '../../Services/Dashboard/index.js';
export async function getToday(req, res) {
    const result = await dashboardService.getTodayKPIs();
    res.json(result);
}
export async function getSalesChart(req, res) {
    const days = Number(req.query.days) || 7;
    const result = await dashboardService.getSalesChart(days);
    res.json(result);
}
export async function getSalesByHour(_req, res) {
    const result = await dashboardService.getSalesByHour();
    res.json(result);
}
export async function getTopProducts(req, res) {
    const limit = Number(req.query.limit) || 10;
    const result = await dashboardService.getTopProducts(limit);
    res.json(result);
}
export async function getDailyClosing(req, res) {
    const date = req.query.date;
    const result = await dashboardService.getDailyClosing(date);
    res.json(result);
}
export async function getShifts(req, res) {
    const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : undefined;
    const toDate = req.query.toDate ? new Date(req.query.toDate) : undefined;
    const result = await dashboardService.getShifts(fromDate, toDate);
    res.json(result);
}
//# sourceMappingURL=index.js.map