import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SaleModel } from '../../../../models/Sale/index.js';
import { ProductModel } from '../../../../models/Product/index.js';
import { ClientModel } from '../../../../models/Client/index.js';
import { CreditMovementModel } from '../../../../models/CreditMovement/index.js';
import * as salesService from '../../../../Services/Sales/index.js';
import { NotFoundError, ConflictError, ValidationError } from '../../../../utils/errors.js';

const leanMock = vi.hoisted(() => {
  const withId = vi.fn((x: unknown) => ({ ...x as object, id: (x as { _id?: { toString: () => string } })._id?.toString() ?? 'mock-id' }));
  const withIds = vi.fn((arr: unknown[]) => arr.map((x: unknown) => ({ ...x as object, id: (x as { _id?: { toString: () => string } })._id?.toString() ?? 'mock-id' })));
  return { withId, withIds };
});

vi.mock('../../../../models/Sale/index.js');
vi.mock('../../../../models/Product/index.js');
vi.mock('../../../../models/Client/index.js');
vi.mock('../../../../models/CreditMovement/index.js');
vi.mock('../../../../utils/lean.js', () => leanMock);

describe('Sales Service - createCreditNote', () => {
  const schoolId = 'school-1';
  const adminId = 'admin-1';
  const saleId = 'sale-1';
  const productId = 'product-1';
  const clientId = 'client-1';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  interface MockSale {
    _id: string;
    number: number;
    subtotal: number;
    discount: number;
    total: number;
    amountReceived: number;
    change: number;
    paymentMethod: 'cash' | 'transfer' | 'credit';
    type: 'sale' | 'return' | 'credit_note';
    client: string;
    seller: string;
    cashShift: string;
    school: string;
    settled: boolean;
    voided: boolean;
    items: Array<{ product: string; name: string; type: 'product' | 'service'; quantity: number; unitPrice: number; unitCost: number; subtotal: number }>;
    createdAt: Date;
    save: ReturnType<typeof vi.fn>;
    toJSON: () => MockSale;
    voidReason?: string;
  }

  interface MockProduct {
    _id: string;
    name: string;
    type: 'product' | 'service';
    price: number;
    cost: number;
    stock: number;
    save: ReturnType<typeof vi.fn>;
  }

  interface MockClient {
    _id: string;
    fullName: string;
    balance: number;
    school: string;
    save: ReturnType<typeof vi.fn>;
  }

  interface MockCreditNote {
    _id: string;
    number: number;
    subtotal: number;
    discount: number;
    total: number;
    amountReceived: number;
    change: number;
    paymentMethod: 'cash' | 'transfer' | 'credit';
    type: 'credit_note';
    client: string;
    seller: string;
    cashShift: string;
    school: string;
    originalSale: string;
    settled: boolean;
    voided: boolean;
    items: Array<{ product: string; name: string; type: 'product' | 'service'; quantity: number; unitPrice: number; unitCost: number; subtotal: number }>;
    createdAt: Date;
    toJSON: () => MockCreditNote;
  }

  interface MockCreditMovement {
    _id: string;
    type: string;
    amount: number;
    balanceAfter: number;
    method: string;
    toJSON: () => MockCreditMovement;
  }

  const createMockSale = (overrides: Partial<MockSale> = {}): MockSale => ({
    _id: saleId,
    number: 1,
    subtotal: 1000,
    discount: 0,
    total: 1000,
    amountReceived: 1000,
    change: 0,
    paymentMethod: 'cash',
    type: 'sale',
    client: clientId,
    seller: 'seller-1',
    cashShift: 'shift-1',
    school: schoolId,
    settled: true,
    voided: false,
    items: [{ product: productId, name: 'Test Product', type: 'product', quantity: 1, unitPrice: 1000, unitCost: 500, subtotal: 1000 }],
    createdAt: new Date(),
    save: vi.fn().mockResolvedValue(true),
    toJSON() { return this; },
    ...overrides,
  });

  const createMockProduct = (overrides: Partial<MockProduct> = {}): MockProduct => ({
    _id: productId,
    name: 'Test Product',
    type: 'product',
    price: 1000,
    cost: 500,
    stock: 5,
    save: vi.fn().mockResolvedValue(true),
    ...overrides,
  });

  const createMockClient = (overrides: Partial<MockClient> = {}): MockClient => ({
    _id: clientId,
    fullName: 'Test Client',
    balance: 5000,
    school: schoolId,
    save: vi.fn().mockResolvedValue(true),
    ...overrides,
  });

  const createMockCreditNote = (overrides: Partial<MockCreditNote> = {}): MockCreditNote => ({
    _id: 'credit-note-1',
    number: 2,
    subtotal: 1000,
    discount: 0,
    total: 1000,
    amountReceived: 0,
    change: 0,
    paymentMethod: 'cash',
    type: 'credit_note',
    client: clientId,
    seller: adminId,
    cashShift: 'shift-1',
    school: schoolId,
    originalSale: saleId,
    settled: true,
    voided: false,
    items: [{ product: productId, name: 'Test Product', type: 'product', quantity: 1, unitPrice: 1000, unitCost: 500, subtotal: 1000 }],
    createdAt: new Date(),
    toJSON() { return this; },
    ...overrides,
  });

  const createMockCreditMovement = (overrides: Partial<MockCreditMovement> = {}): MockCreditMovement => ({
    _id: 'cm-1',
    type: 'payment',
    amount: 1000,
    balanceAfter: 4000,
    method: 'cash',
    toJSON() { return this; },
    ...overrides,
  });

  const setupTransactionMock = (): void => {
    const mockSession = {
      startTransaction: vi.fn(),
      commitTransaction: vi.fn(),
      abortTransaction: vi.fn(),
      endSession: vi.fn(),
    };
    SaleModel.db = {
      startSession: vi.fn().mockResolvedValue(mockSession),
    };
  };

  const setupFindOneMocks = (originalSale: MockSale | null): void => {
    vi.mocked(SaleModel.findOne)
      .mockResolvedValueOnce(originalSale)
      .mockReturnValueOnce({
        sort: vi.fn().mockReturnValue({
          session: vi.fn().mockResolvedValue(null),
        }),
      });
  };

  const setupProductClientMocks = (product: MockProduct, client: MockClient): void => {
    vi.mocked(ProductModel.findOne).mockReturnValue({
      session: vi.fn().mockResolvedValue(product),
    });
    vi.mocked(ClientModel.findOne).mockReturnValue({
      session: vi.fn().mockResolvedValue(client),
    });
  };

  const setupCreateMocks = (creditNote: MockCreditNote, creditMovement?: MockCreditMovement): void => {
    vi.mocked(SaleModel.create).mockResolvedValue([creditNote]);
    vi.mocked(CreditMovementModel.create).mockResolvedValue(creditMovement ? [creditMovement] : []);
  };

  it('should create credit note for cash sale and restore stock', async () => {
    setupTransactionMock();
    const originalSale = createMockSale();
    const product = createMockProduct();
    const client = createMockClient();
    const creditNote = createMockCreditNote();

    setupFindOneMocks(originalSale);
    setupProductClientMocks(product, client);
    setupCreateMocks(creditNote);

    const result = await salesService.createCreditNote(schoolId, saleId, adminId, 'Devolución por defecto');

    expect(result.sale.type).toBe('credit_note');
    expect(result.sale.paymentMethod).toBe('cash');
    expect(result.sale.total).toBe(1000);
    expect(result.sale.originalSale).toBe(saleId);
    expect(result.sale.number).toBe(2);
    expect(result.sale.settled).toBe(true);
    expect(result.sale.voided).toBe(false);
    expect(product.stock).toBe(6);
    expect(product.save).toHaveBeenCalled();
  });

  it('should create credit note for credit sale and reverse client balance', async () => {
    setupTransactionMock();
    const originalSale = createMockSale({ paymentMethod: 'credit', settled: false, amountReceived: 0, change: 0 });
    const product = createMockProduct();
    const client = createMockClient({ balance: 5000 });
    const creditNote = createMockCreditNote({ paymentMethod: 'credit' });
    const creditMovement = createMockCreditMovement();

    setupFindOneMocks(originalSale);
    setupProductClientMocks(product, client);
    setupCreateMocks(creditNote, creditMovement);

    const result = await salesService.createCreditNote(schoolId, saleId, adminId, 'Devolución por defecto');

    expect(result.sale.type).toBe('credit_note');
    expect(result.sale.paymentMethod).toBe('credit');
    expect(client.balance).toBe(4000);
    expect(CreditMovementModel.create).toHaveBeenCalled();
  });

  it('should create credit note for transfer sale', async () => {
    setupTransactionMock();
    const originalSale = createMockSale({ paymentMethod: 'transfer' });
    const product = createMockProduct();
    const client = createMockClient({ balance: 0 });
    const creditNote = createMockCreditNote({ paymentMethod: 'transfer' });

    setupFindOneMocks(originalSale);
    setupProductClientMocks(product, client);
    setupCreateMocks(creditNote);

    const result = await salesService.createCreditNote(schoolId, saleId, adminId, 'Devolución por defecto');

    expect(result.sale.type).toBe('credit_note');
    expect(result.sale.paymentMethod).toBe('transfer');
    expect(result.sale.settled).toBe(true);
  });

  it('should throw NotFoundError for non-existent sale', async () => {
    setupTransactionMock();
    const product = createMockProduct();
    const client = createMockClient();
    const creditNote = createMockCreditNote();

    setupFindOneMocks(null);
    setupProductClientMocks(product, client);
    setupCreateMocks(creditNote);

    await expect(salesService.createCreditNote(schoolId, 'non-existent', adminId)).rejects.toThrow(NotFoundError);
  });

  it('should throw ConflictError for already voided sale', async () => {
    setupTransactionMock();
    const originalSale = createMockSale({ voided: true, type: 'sale' });
    const product = createMockProduct();
    const client = createMockClient();
    const creditNote = createMockCreditNote();

    setupFindOneMocks(originalSale);
    setupProductClientMocks(product, client);
    setupCreateMocks(creditNote);

    await expect(salesService.createCreditNote(schoolId, saleId, adminId)).rejects.toThrow(ConflictError);
  });

  it('should throw ValidationError for return type', async () => {
    setupTransactionMock();
    const originalSale = createMockSale({ type: 'return', voided: false });
    const product = createMockProduct();
    const client = createMockClient();
    const creditNote = createMockCreditNote();

    setupFindOneMocks(originalSale);
    setupProductClientMocks(product, client);
    setupCreateMocks(creditNote);

    await expect(salesService.createCreditNote(schoolId, saleId, adminId)).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for credit_note type', async () => {
    setupTransactionMock();
    const originalSale = createMockSale({ type: 'credit_note', voided: false });
    const product = createMockProduct();
    const client = createMockClient();
    const creditNote = createMockCreditNote();

    setupFindOneMocks(originalSale);
    setupProductClientMocks(product, client);
    setupCreateMocks(creditNote);

    await expect(salesService.createCreditNote(schoolId, saleId, adminId)).rejects.toThrow(ValidationError);
  });

  it('should use default reason when not provided', async () => {
    setupTransactionMock();
    const originalSale = createMockSale();
    const product = createMockProduct();
    const client = createMockClient();
    const creditNote = createMockCreditNote();

    setupFindOneMocks(originalSale);
    setupProductClientMocks(product, client);
    setupCreateMocks(creditNote);

    await salesService.createCreditNote(schoolId, saleId, adminId);

    expect(originalSale.voidReason).toBe('Nota de crédito');
    expect(originalSale.voided).toBe(true);
  });
});