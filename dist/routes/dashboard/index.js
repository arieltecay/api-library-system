import { Router } from 'express';
import { validate } from '../../middleware/validation.js';
import * as dashboardController from '../../Controllers/Dashboard/index.js';
import { todaySchema, salesChartSchema, topProductsSchema, dailyClosingSchema, shiftsSchema } from '../../Controllers/Dashboard/types.js';
import { authMiddleware, requireAdmin } from '../../middleware/auth.js';
const router = Router();
router.use(authMiddleware, requireAdmin);
router.get('/today', validate(todaySchema), dashboardController.getToday);
router.get('/sales-chart', validate(salesChartSchema), dashboardController.getSalesChart);
router.get('/sales-by-hour', validate(todaySchema), dashboardController.getSalesByHour);
router.get('/top-products', validate(topProductsSchema), dashboardController.getTopProducts);
router.get('/daily-closing', validate(dailyClosingSchema), dashboardController.getDailyClosing);
router.get('/shifts', validate(shiftsSchema), dashboardController.getShifts);
export default router;
//# sourceMappingURL=index.js.map