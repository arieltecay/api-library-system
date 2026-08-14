import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { logger } from './utils/logger.js';
import authRoutes from './routes/auth/index.js';
import usersRoutes from './routes/users/index.js';
import productsRoutes from './routes/products/index.js';
import clientsRoutes from './routes/clients/index.js';
import salesRoutes from './routes/sales/index.js';
import cashShiftsRoutes from './routes/cash-shifts/index.js';
import creditsRoutes from './routes/credits/index.js';
import dashboardRoutes from './routes/dashboard/index.js';
import settingsRoutes from './routes/settings/index.js';
const app = express();
app.use(cors({
    origin: [env.FRONTEND_POS_URL, env.FRONTEND_ADMIN_URL],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/products', productsRoutes);
app.use('/clients', clientsRoutes);
app.use('/sales', salesRoutes);
app.use('/cash-shifts', cashShiftsRoutes);
app.use('/credits', creditsRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/settings', settingsRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
async function start() {
    await connectDB();
    app.listen(env.PORT, () => {
        logger.info(`🚀 Server running on port ${env.PORT} (${env.NODE_ENV})`);
    });
}
start().catch((error) => {
    logger.error('Failed to start server', { error });
    process.exit(1);
});
export { app };
//# sourceMappingURL=server.js.map