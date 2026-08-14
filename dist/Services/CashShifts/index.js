import { CashShiftModel } from '../../models/CashShift/index.js';
import { SaleModel } from '../../models/Sale/index.js';
import { NotFoundError, ConflictError, ValidationError } from '../../utils/errors.js';
import { withId, withIds } from '../../utils/lean.js';
export async function openCashShift(sellerId, openingAmount) {
    const existing = await CashShiftModel.findOne({ seller: sellerId, status: 'open' }).lean();
    if (existing) {
        throw new ConflictError('Ya tienes un turno abierto');
    }
    const cashShift = await CashShiftModel.create({
        seller: sellerId,
        openingAmount,
        status: 'open',
    });
    return cashShift.toJSON();
}
export async function getActiveCashShift(sellerId) {
    const cashShift = await CashShiftModel.findOne({ seller: sellerId, status: 'open' }).lean();
    return cashShift ? withId(cashShift) : null;
}
export async function closeCashShift(cashShiftId, sellerId, closingAmount, note) {
    const cashShift = await CashShiftModel.findById(cashShiftId);
    if (!cashShift) {
        throw new NotFoundError('Turno no encontrado');
    }
    if (cashShift.seller.toString() !== sellerId) {
        throw new Error('No autorizado para cerrar este turno');
    }
    if (cashShift.status === 'closed') {
        throw new ConflictError('El turno ya está cerrado');
    }
    // Calculate expected amount
    const sales = await SaleModel.find({
        cashShift: cashShift._id,
        voided: false,
        type: 'sale',
    }).lean();
    const cashSales = sales.filter(s => s.paymentMethod === 'cash');
    const cashTotal = cashSales.reduce((sum, s) => sum + s.total, 0);
    const expectedAmount = cashShift.openingAmount + cashTotal;
    const difference = closingAmount - expectedAmount;
    // Validate difference
    if (difference !== 0 && !note) {
        throw new ValidationError('Se requiere un motivo cuando hay diferencia en el arqueo');
    }
    cashShift.closingAmount = closingAmount;
    cashShift.expectedAmount = expectedAmount;
    cashShift.difference = difference;
    cashShift.status = 'closed';
    cashShift.closedAt = new Date();
    cashShift.note = note;
    await cashShift.save();
    return {
        cashShift: cashShift.toJSON(),
        expectedAmount,
        difference,
    };
}
export async function getCashShiftById(id) {
    const cashShift = await CashShiftModel.findById(id).lean();
    if (!cashShift) {
        throw new NotFoundError('Turno no encontrado');
    }
    return withId(cashShift);
}
export async function listCashShifts(params) {
    const filter = {};
    if (params.sellerId)
        filter.seller = params.sellerId;
    if (params.status)
        filter.status = params.status;
    if (params.hasDifference === true)
        filter['$expr'] = { $ne: ['$difference', 0] };
    if (params.fromDate || params.toDate) {
        filter.openedAt = {};
        if (params.fromDate)
            filter.openedAt.$gte = params.fromDate;
        if (params.toDate)
            filter.openedAt.$lte = params.toDate;
    }
    const sort = { [params.sortBy]: params.sortOrder === 'asc' ? 1 : -1 };
    const [items, total] = await Promise.all([
        CashShiftModel.find(filter)
            .populate({ path: 'seller', select: 'name' })
            .sort(sort)
            .skip((params.page - 1) * params.limit)
            .limit(params.limit)
            .lean(),
        CashShiftModel.countDocuments(filter),
    ]);
    // Obtener el número de secuencia global de cada turno (posición histórica)
    const allShifts = await CashShiftModel.find({}).sort({ openedAt: 1 }).select('_id').lean();
    const shiftNumberMap = new Map(allShifts.map((s, i) => [String(s._id), i + 1]));
    return {
        items: withIds(items).map(s => ({
            ...s,
            sellerName: s.seller?.name ?? 'Desconocido',
            shiftNumber: shiftNumberMap.get(s.id) ?? 0,
        })),
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
    };
}
export async function getActiveCashShiftWithDetails(sellerId) {
    const cashShift = await CashShiftModel.findOne({ seller: sellerId, status: 'open' }).lean();
    if (!cashShift) {
        return { cashShift: null, aggregated: null };
    }
    const sales = await SaleModel.find({
        cashShift: cashShift._id,
        voided: false,
        type: 'sale',
    }).lean();
    const cashSales = sales.filter(s => s.paymentMethod === 'cash');
    const transferSales = sales.filter(s => s.paymentMethod === 'transfer');
    const creditSales = sales.filter(s => s.paymentMethod === 'credit');
    const cashTotal = cashSales.reduce((sum, s) => sum + s.total, 0);
    const transferTotal = transferSales.reduce((sum, s) => sum + s.total, 0);
    const creditTotal = creditSales.reduce((sum, s) => sum + s.total, 0);
    const salesCount = sales.length;
    const productsSold = sales.reduce((sum, s) => sum + s.items.reduce((isum, i) => isum + i.quantity, 0), 0);
    const avgTicket = salesCount > 0 ? sales.reduce((sum, s) => sum + s.total, 0) / salesCount : 0;
    const expectedCash = cashShift.openingAmount + cashTotal;
    return {
        cashShift: withId(cashShift),
        aggregated: {
            cashTotal,
            transferTotal,
            creditTotal,
            salesCount,
            productsSold,
            avgTicket,
            expectedCash,
        },
    };
}
export async function getDailySummary(date) {
    const target = date ?? new Date();
    const start = new Date(target);
    start.setHours(0, 0, 0, 0);
    const end = new Date(target);
    end.setHours(23, 59, 59, 999);
    const [shifts, sales, creditMovements] = await Promise.all([
        CashShiftModel.find({ openedAt: { $gte: start, $lte: end } })
            .populate({ path: 'seller', select: 'name' })
            .lean(),
        SaleModel.find({ createdAt: { $gte: start, $lte: end }, voided: false }).lean(),
        // Importamos dinámicamente para evitar circularidad
        import('../../models/CreditMovement/index.js').then(m => m.CreditMovementModel.find({ createdAt: { $gte: start, $lte: end }, type: 'payment' }).lean()),
    ]);
    const totalOpening = shifts.reduce((s, sh) => s + sh.openingAmount, 0);
    const cashSalesTotal = sales
        .filter(s => s.paymentMethod === 'cash')
        .reduce((s, sale) => s + sale.total, 0);
    const returnsTotal = sales
        .filter(s => s.type === 'return')
        .reduce((s, sale) => s + sale.total, 0);
    const creditPaymentsTotal = creditMovements.reduce((s, m) => s + m.amount, 0);
    const totalExpected = totalOpening + cashSalesTotal - returnsTotal + creditPaymentsTotal;
    const closedShifts = shifts.filter(s => s.status === 'closed');
    const finalCount = closedShifts.reduce((s, sh) => s + (sh.closingAmount ?? 0), 0);
    const difference = finalCount - totalExpected;
    const shiftsWithDifference = closedShifts.filter(sh => sh.difference !== 0 && sh.difference != null).length;
    const pendingShifts = shifts
        .filter(s => s.status === 'open')
        .map(s => ({ sellerName: s.seller?.name ?? 'Desconocido', id: String(s._id) }));
    return {
        date: start.toISOString().split('T')[0],
        totalOpening,
        cashSales: cashSalesTotal,
        returns: returnsTotal,
        creditPayments: creditPaymentsTotal,
        totalExpected,
        finalCount,
        difference,
        shiftsWithDifference,
        totalShifts: shifts.length,
        pendingShifts,
    };
}
//# sourceMappingURL=index.js.map