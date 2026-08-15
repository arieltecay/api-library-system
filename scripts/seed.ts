import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from '../config/env.js';
import { UserModel } from '../models/User/index.js';
import { ProductModel } from '../models/Product/index.js';
import { ClientModel } from '../models/Client/index.js';
import { SaleModel } from '../models/Sale/index.js';
import { CashShiftModel } from '../models/CashShift/index.js';
import { CreditMovementModel } from '../models/CreditMovement/index.js';
import { SchoolModel } from '../models/School/index.js';
import { PosModel } from '../models/Pos/index.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(section: string, count: number): void {
  console.log(`  ${section}: ${count} registros`);
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - randomInt(0, daysAgo));
  d.setHours(randomInt(7, 19), randomInt(0, 59), 0, 0);
  return d;
}

function pickPayment(): 'cash' | 'transfer' | 'credit' {
  const r = Math.random();
  if (r < 0.6) return 'cash';
  if (r < 0.85) return 'transfer';
  return 'credit';
}

// ---------------------------------------------------------------------------
// Productos
// ---------------------------------------------------------------------------

interface ProductSeed {
  name: string;
  description: string;
  type: 'product' | 'service';
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
  unit?: 'unit' | 'sheet' | 'binding';
}

function buildProducts(): ProductSeed[] {
  return [
    // ---- Cuadernos y libretas ----
    { name: 'Cuaderno rayado A4 48 hojas', description: 'Cuaderno escolar rayado A4', type: 'product', price: 4500, cost: 2800, stock: 120, minStock: 20, unit: 'unit' },
    { name: 'Cuaderno rayado A4 96 hojas', description: 'Cuaderno escolar rayado A4', type: 'product', price: 6200, cost: 3900, stock: 85, minStock: 20, unit: 'unit' },
    { name: 'Cuaderno cuadriculado A4 48 hojas', description: 'Cuaderno escolar cuadriculado A4', type: 'product', price: 4500, cost: 2800, stock: 95, minStock: 20, unit: 'unit' },
    { name: 'Cuaderno cuadriculado A4 96 hojas', description: 'Cuaderno escolar cuadriculado A4', type: 'product', price: 6500, cost: 4000, stock: 70, minStock: 15, unit: 'unit' },
    { name: 'Cuaderno espiral A5 48 hojas', description: 'Cuaderno espiral A5', type: 'product', price: 3800, cost: 2200, stock: 60, minStock: 10, unit: 'unit' },
    { name: 'Cuaderno tapa dura A5 200 hojas', description: 'Cuaderno tapa dura A5', type: 'product', price: 8900, cost: 5400, stock: 40, minStock: 10, unit: 'unit' },
    { name: 'Libreta adhesiva A6 50 hojas', description: 'Libreta adhesiva A6', type: 'product', price: 2500, cost: 1400, stock: 150, minStock: 30, unit: 'unit' },
    { name: 'Block de dibujo A4 40 hojas', description: 'Block de dibujo blanco A4', type: 'product', price: 3200, cost: 1900, stock: 80, minStock: 15, unit: 'unit' },
    { name: 'Block de dibujo A3 40 hojas', description: 'Block de dibujo blanco A3', type: 'product', price: 5200, cost: 3100, stock: 35, minStock: 10, unit: 'unit' },

    // ---- Lapices y lapiceras ----
    { name: 'Lapices HB x12', description: 'Caja de 12 lapices HB', type: 'product', price: 5500, cost: 3200, stock: 40, minStock: 10, unit: 'unit' },
    { name: 'Lapices negros x50', description: 'Caja de 50 lapices negros', type: 'product', price: 18000, cost: 11000, stock: 15, minStock: 5, unit: 'unit' },
    { name: 'Lapicera boligrafo azul x10', description: 'Pack de 10 boligrafos azules', type: 'product', price: 4200, cost: 2500, stock: 100, minStock: 20, unit: 'unit' },
    { name: 'Lapicera boligrafo negra x10', description: 'Pack de 10 boligrafos negros', type: 'product', price: 4200, cost: 2500, stock: 90, minStock: 20, unit: 'unit' },
    { name: 'Lapicera gel 0.5mm azul x5', description: 'Pack de 5 gel azules finas', type: 'product', price: 3800, cost: 2200, stock: 75, minStock: 15, unit: 'unit' },
    { name: 'Lapicera gel 0.7mm roja x5', description: 'Pack de 5 gel rojas', type: 'product', price: 3800, cost: 2200, stock: 60, minStock: 15, unit: 'unit' },
    { name: 'Marcador grueso negro', description: 'Marcador permanente grueso negro', type: 'product', price: 1800, cost: 1000, stock: 200, minStock: 30, unit: 'unit' },
    { name: 'Marcadores colores x6', description: 'Set de 6 marcadores de colores', type: 'product', price: 9500, cost: 5800, stock: 45, minStock: 10, unit: 'unit' },
    { name: 'Resaltador amarillo', description: 'Resaltador fluorescente amarillo', type: 'product', price: 1500, cost: 800, stock: 180, minStock: 30, unit: 'unit' },
    { name: 'Resaltadores colores x4', description: 'Pack de 4 resaltadores de colores', type: 'product', price: 5500, cost: 3200, stock: 70, minStock: 15, unit: 'unit' },

    // ---- Hojas y resmas ----
    { name: 'Resma A4 75gr blanca', description: 'Resma 500 hojas A4 75 gramos', type: 'product', price: 12000, cost: 8000, stock: 30, minStock: 10, unit: 'unit' },
    { name: 'Resma A4 90gr blanca', description: 'Resma 500 hojas A4 90 gramos', type: 'product', price: 16500, cost: 11000, stock: 18, minStock: 5, unit: 'unit' },
    { name: 'Hojas A4 x100', description: 'Pack de 100 hojas A4 blancas', type: 'product', price: 3000, cost: 1800, stock: 250, minStock: 50, unit: 'unit' },
    { name: 'Hojas oficio x100', description: 'Pack de 100 hojas oficio blancas', type: 'product', price: 2800, cost: 1600, stock: 220, minStock: 50, unit: 'unit' },
    { name: 'Hojas rayadas x100', description: 'Pack de 100 hojas rayadas', type: 'product', price: 3200, cost: 1900, stock: 140, minStock: 30, unit: 'unit' },
    { name: 'Hojas cuadriculadas x100', description: 'Pack de 100 hojas cuadriculadas', type: 'product', price: 3200, cost: 1900, stock: 130, minStock: 30, unit: 'unit' },
    { name: 'Hojas de colores x50', description: 'Pack de 50 hojas de colores variados', type: 'product', price: 3500, cost: 2100, stock: 90, minStock: 20, unit: 'unit' },

    // ---- Cartucheras y organizadores ----
    { name: 'Cartuchera escolar 2 compartimentos', description: 'Cartuchera tela 2 compartimentos', type: 'product', price: 8500, cost: 5000, stock: 35, minStock: 10, unit: 'unit' },
    { name: 'Cartuchera grande 3 compartimentos', description: 'Cartuchera grande 3 compartimentos', type: 'product', price: 13500, cost: 8000, stock: 20, minStock: 5, unit: 'unit' },
    { name: 'Sacapuntas metalico', description: 'Sacapuntas metalico con deposito', type: 'product', price: 1800, cost: 900, stock: 150, minStock: 30, unit: 'unit' },
    { name: 'Sacapuntas electrico a pilas', description: 'Sacapuntas electrico a pilas', type: 'product', price: 15000, cost: 9000, stock: 12, minStock: 5, unit: 'unit' },
    { name: 'Gomas de borrar x10', description: 'Pack de 10 gomas blancas', type: 'product', price: 2500, cost: 1400, stock: 180, minStock: 30, unit: 'unit' },
    { name: 'Regla plastica 30cm', description: 'Regla plastica transparente 30cm', type: 'product', price: 1500, cost: 800, stock: 200, minStock: 30, unit: 'unit' },
    { name: 'Regla metalica 50cm', description: 'Regla metalica 50cm', type: 'product', price: 4500, cost: 2700, stock: 40, minStock: 10, unit: 'unit' },
    { name: 'Compas metalico', description: 'Compas metalico con minas de repuesto', type: 'product', price: 5500, cost: 3300, stock: 60, minStock: 15, unit: 'unit' },
    { name: 'Tijera escolar 13cm', description: 'Tijera escolar punta roma 13cm', type: 'product', price: 2500, cost: 1500, stock: 80, minStock: 20, unit: 'unit' },
    { name: 'Tijera office 18cm', description: 'Tijera office metalica 18cm', type: 'product', price: 6500, cost: 3900, stock: 25, minStock: 5, unit: 'unit' },

    // ---- Pegamento y adhesivos ----
    { name: 'Pegamento barra 21gr', description: 'Pegamento en barra 21 gramos', type: 'product', price: 1800, cost: 1000, stock: 200, minStock: 40, unit: 'unit' },
    { name: 'Pegamento barra 40gr', description: 'Pegamento en barra 40 gramos', type: 'product', price: 2800, cost: 1600, stock: 120, minStock: 25, unit: 'unit' },
    { name: 'Pegamento liquido 100ml', description: 'Pegamento liquido 100 ml', type: 'product', price: 3500, cost: 2100, stock: 80, minStock: 20, unit: 'unit' },
    { name: 'Cinta adhesiva transparente', description: 'Cinta adhesiva transparente 20m', type: 'product', price: 1500, cost: 800, stock: 250, minStock: 40, unit: 'unit' },
    { name: 'Cinta de embalar 50m', description: 'Cinta de embalar marron 50m', type: 'product', price: 3200, cost: 1900, stock: 90, minStock: 20, unit: 'unit' },

    // ---- Mochilas ----
    { name: 'Mochila escolar 20L', description: 'Mochila escolar 20L negra', type: 'product', price: 35000, cost: 22000, stock: 15, minStock: 5, unit: 'unit' },
    { name: 'Mochila urbana 25L', description: 'Mochila urbana 25L con tablet', type: 'product', price: 48000, cost: 30000, stock: 10, minStock: 5, unit: 'unit' },
    { name: 'Mochila infantil 15L', description: 'Mochila infantil 15L con estampado', type: 'product', price: 28000, cost: 17000, stock: 8, minStock: 3, unit: 'unit' },

    // ---- Carpetas y separadores ----
    { name: 'Carpeta oficio 3 solapas', description: 'Carpeta oficio 3 solapas de carton', type: 'product', price: 6500, cost: 3900, stock: 50, minStock: 10, unit: 'unit' },
    { name: 'Carpeta oficio 5 solapas', description: 'Carpeta oficio 5 solapas de carton', type: 'product', price: 8500, cost: 5100, stock: 40, minStock: 10, unit: 'unit' },
    { name: 'Separadores oficio x10', description: 'Separadores plastificados oficio x10', type: 'product', price: 4500, cost: 2700, stock: 75, minStock: 15, unit: 'unit' },
    { name: 'Folder con clips A4', description: 'Folder con clips tamaño A4', type: 'product', price: 3500, cost: 2100, stock: 100, minStock: 20, unit: 'unit' },
    { name: 'Folder con clips oficio', description: 'Folder con clips tamaño oficio', type: 'product', price: 3800, cost: 2300, stock: 85, minStock: 20, unit: 'unit' },

    // ---- Servicios ----
    { name: 'Anillado simple A4', description: 'Anillado simple A4 hasta 50 hojas', type: 'service', price: 2000, stock: 9999, unit: 'binding' },
    { name: 'Anillado doble A4', description: 'Anillado doble A4 hasta 100 hojas', type: 'service', price: 3200, stock: 9999, unit: 'binding' },
    { name: 'Anillado oficio', description: 'Anillado oficio hasta 50 hojas', type: 'service', price: 2200, stock: 9999, unit: 'binding' },
    { name: 'Engargolado A4', description: 'Engargolado A4 hasta 200 hojas', type: 'service', price: 4800, stock: 9999, unit: 'binding' },
    { name: 'Engargolado oficio', description: 'Engargolado oficio hasta 200 hojas', type: 'service', price: 5200, stock: 9999, unit: 'binding' },
    { name: 'Fotocopia simple faz', description: 'Fotocopia simple faz blanco y negro', type: 'service', price: 150, stock: 9999, unit: 'sheet' },
    { name: 'Fotocopia doble faz', description: 'Fotocopia doble faz por hoja', type: 'service', price: 250, stock: 9999, unit: 'sheet' },
    { name: 'Fotocopia color A4', description: 'Fotocopia color tamaño A4', type: 'service', price: 800, stock: 9999, unit: 'sheet' },
    { name: 'Plastificado A4', description: 'Plastizado tamaño A4', type: 'service', price: 2500, stock: 9999, unit: 'unit' },
    { name: 'Plastificado oficio', description: 'Plastizado tamaño oficio', type: 'service', price: 3000, stock: 9999, unit: 'unit' },
    { name: 'Impresion A4 color', description: 'Impresion color A4 por hoja', type: 'service', price: 1000, stock: 9999, unit: 'sheet' },
    { name: 'Encuadernacion rustica', description: 'Encuadernacion rustica hasta 150 hojas', type: 'service', price: 12000, stock: 9999, unit: 'unit' },
    { name: 'Impresion A4 blanco y negro', description: 'Impresion b/n A4 por hoja', type: 'service', price: 500, stock: 9999, unit: 'sheet' },

    // ---- Miscelaneos ----
    { name: 'Calculadora cientifica', description: 'Calculadora cientifica 240 funciones', type: 'product', price: 15000, cost: 9000, stock: 25, minStock: 5, unit: 'unit' },
    { name: 'Calculadora escolar', description: 'Calculadora escolar 8 digitos', type: 'product', price: 5500, cost: 3300, stock: 60, minStock: 10, unit: 'unit' },
    { name: 'Cinta metrica 5m', description: 'Cinta metrica 5 metros metalica', type: 'product', price: 7500, cost: 4500, stock: 30, minStock: 5, unit: 'unit' },
    { name: 'Pizarra blanca A2', description: 'Pizarra blanca tamaño A2', type: 'product', price: 22000, cost: 13500, stock: 5, minStock: 2, unit: 'unit' },
    { name: 'Marcadores pizarra negros x5', description: 'Pack 5 marcadores pizarra negros', type: 'product', price: 6500, cost: 3900, stock: 40, minStock: 10, unit: 'unit' },
    { name: 'Clips x100', description: 'Caja de 100 clips metalicos', type: 'product', price: 2200, cost: 1300, stock: 180, minStock: 30, unit: 'unit' },
    { name: 'Clips bulldog x50', description: 'Caja de 50 clips bulldog', type: 'product', price: 4500, cost: 2700, stock: 90, minStock: 20, unit: 'unit' },

    // ---- Low stock products (for testing alerts) ----
    { name: 'Corrector liquido 20ml', description: 'Corrector liquido 20ml', type: 'product', price: 2200, cost: 1300, stock: 3, minStock: 15, unit: 'unit' },
    { name: 'Tiza blanca x6', description: 'Pack de 6 tizas blancas', type: 'product', price: 1800, cost: 1000, stock: 1, minStock: 10, unit: 'unit' },
    { name: 'Tiza de colores x6', description: 'Pack de 6 tizas de colores', type: 'product', price: 2500, cost: 1500, stock: 0, minStock: 10, unit: 'unit' },
  ];
}

// ---------------------------------------------------------------------------
// Clientes
// ---------------------------------------------------------------------------

const FIRST_NAMES = [
  'Juan','Maria','Carlos','Lucia','Pedro','Ana','Diego','Sofia','Martin','Valeria',
  'Andres','Camila','Fernando','Florencia','Gonzalo','Julieta','Rodrigo','Mariana',
  'Tomas','Agustina','Pablo','Micaela','Federico','Carolina','Bruno','Lorena','Nicolas',
  'Daniela','Sebastian','Antonella','Matias','Genesis','Santiago','Mia','Ignacio','Renata',
];
const LAST_NAMES = [
  'Gomez','Fernandez','Lopez','Martinez','Perez','Romero','Sanchez','Sosa','Torres','Vargas',
  'Acosta','Benitez','Medina','Ruiz','Castro','Ojeda','Nunez','Aguirre','Molina','Ortiz',
  'Silva','Cabrera','Ferreira','Pereyra','Vega','Caceres','Leiva','Godoy','Sandoval','Rios',
];
const PHONE_PREFIX = ['11','341','351','381','221','421','261'];

function buildClients(): Array<{ fullName: string; dni: string; phone?: string }> {
  const clients: Array<{ fullName: string; dni: string; phone?: string }> = [];
  const usedDnis = new Set<string>();
  for (let i = 0; i < 35; i++) {
    let dni = String(randomInt(10000000, 45000000));
    while (usedDnis.has(dni)) {
      dni = String(randomInt(10000000, 45000000));
    }
    usedDnis.add(dni);
    const first = randomFrom(FIRST_NAMES);
    const last = randomFrom(LAST_NAMES);
    const full = `${first} ${last}`;
    const hasPhone = Math.random() < 0.7;
    const phone = hasPhone
      ? `${randomFrom(PHONE_PREFIX)}${randomInt(1000000, 9999999)}`
      : undefined;
    clients.push({ fullName: full, dni, phone });
  }
  // Default client
  clients.push({ fullName: 'Cliente General', dni: '0', phone: undefined });
  return clients;
}

// ---------------------------------------------------------------------------
// Main seed
// ---------------------------------------------------------------------------

async function seedAll(): Promise<void> {
  console.log('\n====================================');
  console.log('  Library System - Seed DB');
  console.log('====================================');

  // Connect
  console.log('\nConectando a MongoDB...');
  const dbName = env.MONGODB_URI.split('/').pop()?.split('?')[0] ?? 'unknown';
  console.log(`  BD: ${dbName}`);
  await mongoose.connect(env.MONGODB_URI);
  console.log('  Conexion exitosa.');

  // Reset
  console.log('\nLimpiando colecciones...');
  const [u, p, c, s, sh, cm, sc, po] = await Promise.all([
    UserModel.deleteMany({}),
    ProductModel.deleteMany({}),
    ClientModel.deleteMany({}),
    SaleModel.deleteMany({}),
    CashShiftModel.deleteMany({}),
    CreditMovementModel.deleteMany({}),
    SchoolModel.deleteMany({}),
    PosModel.deleteMany({}),
  ]);
  console.log(`  Eliminados: ${u.deletedCount} users, ${p.deletedCount} products, ${c.deletedCount} clients, ${s.deletedCount} sales, ${sh.deletedCount} shifts, ${cm.deletedCount} movements, ${sc.deletedCount} schools, ${po.deletedCount} pos`);

  // Create School and Pos first
  console.log('\n[0/6] Creando escuela y POS...');
  const school = await SchoolModel.create({
    name: 'Escuela Principal',
    code: 'EP1',
    address: 'Av. Principal 123',
    phone: '11 1234-5678',
    email: 'admin@escuela.edu',
    active: true,
  });
  const pos = await PosModel.create({
    name: 'POS Principal',
    code: 'POS1',
    school: school._id,
    active: true,
  });
  console.log(`  Escuela: ${school.name} (${school._id})`);
  console.log(`  POS: ${pos.name} (${pos._id})`);

  // 1. Users
  console.log('\n[1/6] Creando usuarios...');
  const users = await seedUsers(school._id, pos._id);
  log('Usuarios', users.length);

  // 2. Products
  console.log('\n[2/6] Creando productos...');
  const products = await seedProducts(school._id);
  log('Productos', products.length);

  // 3. Clients
  console.log('\n[3/6] Creando clientes...');
  const clients = await seedClients(school._id);
  log('Clientes', clients.length);

  // 4. Cash Shifts
  console.log('\n[4/6] Creando turnos de caja...');
  const cashShifts = await seedCashShifts(school._id, users);
  log('Turnos', cashShifts.length);

  // 5. Sales
  console.log('\n[5/6] Creando ventas...');
  const creditSales = await seedSales(school._id, products, clients, users, cashShifts);
  log('Ventas con credito', creditSales.length);

  // 6. Credit Movements
  console.log('\n[6/6] Creando movimientos de credito...');
  const movementsCount = await seedCreditMovements(school._id, creditSales, clients, users);
  log('Movimientos', movementsCount);

  console.log('\n====================================');
  console.log('  Seed completo!');
  console.log(`  BD: ${dbName}`);
  console.log('====================================\n');
}

// ---------------------------------------------------------------------------
// seedUsers
// ---------------------------------------------------------------------------

async function seedUsers(schoolId: mongoose.Types.ObjectId, posId: mongoose.Types.ObjectId): Promise<Array<{ id: string; role: 'admin' | 'seller' }>> {
  const passwordHash = await bcrypt.hash('admin123', env.BCRYPT_ROUNDS);
  const pinHashAdmin = await bcrypt.hash('1234', env.BCRYPT_ROUNDS);
  const pinHashSeller1 = await bcrypt.hash('1111', env.BCRYPT_ROUNDS);
  const pinHashSeller2 = await bcrypt.hash('2222', env.BCRYPT_ROUNDS);
  const pinHashSeller3 = await bcrypt.hash('3333', env.BCRYPT_ROUNDS);

  const usersData = [
    { name: 'Administrador', email: 'admin@librarysystem.com', passwordHash, pinHash: pinHashAdmin, role: 'admin', active: true, lastLoginAt: new Date(), school: schoolId, pos: posId },
    { name: 'Maria Vendedora', email: 'maria@librarysystem.com', passwordHash, pinHash: await bcrypt.hash('1111', env.BCRYPT_ROUNDS), role: 'seller', active: true, lastLoginAt: new Date(), school: schoolId, pos: posId },
    { name: 'Carlos Vendedor', email: 'carlos@librarysystem.com', passwordHash, pinHash: await bcrypt.hash('2222', env.BCRYPT_ROUNDS), role: 'seller', active: true, lastLoginAt: new Date(), school: schoolId, pos: posId },
    { name: 'Lucia Vendedora', email: 'lucia@librarysystem.com', passwordHash, pinHash: await bcrypt.hash('3333', env.BCRYPT_ROUNDS), role: 'seller', active: true, lastLoginAt: null, school: schoolId, pos: posId },
  ];

  await UserModel.collection.insertMany(usersData);
  const docs = await UserModel.find({}).sort({ email: 1 }).lean();
  return docs.map(d => ({ id: d._id.toString(), role: d.role }));
}

// ---------------------------------------------------------------------------
// seedProducts
// ---------------------------------------------------------------------------

async function seedProducts(schoolId: mongoose.Types.ObjectId) {
  const rawData = buildProducts();
  let prodSeq = 0;
  let srvSeq = 0;
  const cleaned = rawData.map(p => {
    const seq = p.type === 'service' ? ++srvSeq : ++prodSeq;
    const prefix = p.type === 'service' ? 'SRV' : 'PRD';
    return {
      code: `${prefix}-${String(seq).padStart(3, '0')}`,
      name: p.name,
      description: p.description,
      type: p.type,
      price: p.price,
      cost: p.cost,
      stock: p.stock,
      minStock: p.minStock,
      unit: p.unit,
      active: true,
      school: schoolId,
    };
  });
  await ProductModel.collection.insertMany(cleaned);
  return await ProductModel.find({}).lean();
}

// ---------------------------------------------------------------------------
// seedClients
// ---------------------------------------------------------------------------

async function seedClients(schoolId: mongoose.Types.ObjectId) {
  const rawClients = buildClients();
  await ClientModel.collection.insertMany(
    rawClients.map(c => ({
      fullName: c.fullName,
      dni: c.dni,
      phone: c.phone,
      isDefault: c.dni === '0',
      balance: 0,
      active: true,
      school: schoolId,
    })),
  );
  return await ClientModel.find({}).lean();
}

// ---------------------------------------------------------------------------
// seedCashShifts
// ---------------------------------------------------------------------------

interface ShiftResult { id: string; sellerId: string; openedAt: Date; status: 'open' | 'closed'; }

async function seedCashShifts(schoolId: mongoose.Types.ObjectId, users: Array<{ id: string; role: 'admin' | 'seller' }>): Promise<ShiftResult[]> {
  const sellers = users.filter(u => u.role === 'seller');

  // 25 closed shifts over last 30 days
  const closedShiftsData = [];
  for (let i = 0; i < 25; i++) {
    const seller = randomFrom(sellers);
    const openedAt = randomDate(30);
    const closedAt = new Date(openedAt.getTime() + randomInt(4, 10) * 60 * 60 * 1000);
    const openingAmount = randomFrom([2000, 3000, 5000, 8000, 10000]);
    const closingAmount = openingAmount + randomInt(5000, 50000);
    const expectedAmount = closingAmount;
    const difference = Math.round((Math.random() - 0.5) * 1000);

    closedShiftsData.push({
      seller: new mongoose.Types.ObjectId(seller.id),
      school: schoolId,
      openedAt,
      closedAt,
      openingAmount,
      closingAmount,
      expectedAmount,
      difference,
      status: 'closed',
    });
  }

  await CashShiftModel.collection.insertMany(closedShiftsData);

  // 1 open shift for active seller
  const activeSeller = randomFrom(sellers);
  const nowOpen = new Date();
  nowOpen.setHours(8, 0, 0, 0);
  await CashShiftModel.collection.insertOne({
    seller: new mongoose.Types.ObjectId(activeSeller.id),
    school: schoolId,
    openedAt: nowOpen,
    openingAmount: 5000,
    status: 'open',
  });

  const all = await CashShiftModel.find({}).sort({ openedAt: -1 }).lean();
  return all.map(s => ({
    id: s._id.toString(),
    sellerId: s.seller.toString(),
    openedAt: s.openedAt,
    status: s.status,
  }));
}

// ---------------------------------------------------------------------------
// seedSales
// ---------------------------------------------------------------------------

interface CreditSaleResult { saleId: mongoose.Types.ObjectId; clientId: string; total: number; createdAt: Date; }

async function seedSales(
  schoolId: mongoose.Types.ObjectId,
  products: any[],
  clients: any[],
  users: Array<{ id: string; role: 'admin' | 'seller' }>,
  cashShifts: ShiftResult[],
): Promise<CreditSaleResult[]> {
  const sellers = users.filter(u => u.role === 'seller');
  const defaultClient = clients.find((c: any) => c.dni === '0') ?? clients[0];
  const realClients = clients.filter((c: any) => c.dni !== '0');

  const closedShifts = cashShifts.filter(s => s.status === 'closed');
  const openShifts = cashShifts.filter(s => s.status === 'open');

  const TOTAL_SALES = 220;
  const salesToInsert: any[] = [];
  const creditSales: CreditSaleResult[] = [];
  const clientBalanceMap = new Map<string, number>();
  realClients.forEach((c: any) => clientBalanceMap.set(c._id.toString(), 0));

  for (let i = 0; i < TOTAL_SALES; i++) {
    const useOpen = i < 10;
    const shift = useOpen
      ? randomFrom(openShifts)
      : randomFrom(closedShifts.length > 0 ? closedShifts : cashShifts);
    if (!shift) continue;

    // 80% default client, 20% real client
    const isRealClient = Math.random() < 0.2 && realClients.length > 0;
    const client = isRealClient ? randomFrom(realClients) : defaultClient;
    if (!client) continue;

    // Select 1-5 items
    const numItems = randomInt(1, 5);
    const usedProductIds = new Set<string>();
    const items: any[] = [];

    for (let j = 0; j < numItems; j++) {
      let product = randomFrom(products);
      if (!product) continue;
      let attempts = 0;
      while (usedProductIds.has(product._id.toString()) && attempts < 5) {
        product = randomFrom(products);
        attempts++;
      }
      if (!product) continue;
      usedProductIds.add(product._id.toString());

      const isPhotocopy = product.name.includes('Fotocopia') || product.name.includes('Impresion');
      const quantity = isPhotocopy ? randomInt(10, 100) : randomInt(1, 5);

      items.push({
        product: product._id,
        name: product.name,
        type: product.type,
        quantity,
        unitPrice: product.price,
        subtotal: product.price * quantity,
      });
    }

    if (items.length === 0) continue;

    const subtotal = items.reduce((sum, it) => sum + it.subtotal, 0);
    const discount = Math.random() < 0.15 ? Math.round(subtotal * 0.05) : 0;
    const total = subtotal - discount;
    const paymentMethod = pickPayment();
    const amountReceived = paymentMethod === 'credit' ? total : Math.ceil(total / 1000) * 1000;
    const change = Math.max(0, amountReceived - total);

    // Date
    let saleDate: Date;
    if (useOpen) {
      saleDate = new Date();
      saleDate.setHours(randomInt(8, 18), randomInt(0, 59), 0, 0);
    } else {
      saleDate = new Date(shift.openedAt);
      saleDate.setHours(shift.openedAt.getHours() + randomInt(0, 6), randomInt(0, 59));
    }

    const isVoided = Math.random() < 0.03;

    salesToInsert.push({
      number: i + 1,
      items,
      subtotal,
      discount,
      total,
      amountReceived,
      change,
      paymentMethod,
      type: 'sale',
      client: client._id,
      seller: new mongoose.Types.ObjectId(shift.sellerId),
      cashShift: new mongoose.Types.ObjectId(shift.id),
      school: schoolId,
      settled: paymentMethod !== 'credit',
      settledAt: paymentMethod !== 'credit' ? saleDate : undefined,
      voided: isVoided,
      voidedAt: isVoided ? new Date(saleDate.getTime() + 3600000) : undefined,
      voidReason: isVoided ? 'Error de cobro' : undefined,
      createdAt: saleDate,
      updatedAt: saleDate,
    });

    // Track credit sales for movements
    if (paymentMethod === 'credit' && !isVoided) {
      const clientId = client._id.toString();
      const currentBal = clientBalanceMap.get(clientId) ?? 0;
      const newBal = currentBal + total;
      clientBalanceMap.set(clientId, newBal);
    }
  }

  // Bulk insert all sales
  await SaleModel.collection.insertMany(salesToInsert);

  // Fetch inserted sales to get their _ids
  const insertedSales = await SaleModel.find({}).lean();

  // Apply balance updates to clients
  for (const [clientId, balance] of clientBalanceMap.entries()) {
    if (balance > 0) {
      await ClientModel.updateOne({ _id: clientId }, { $set: { balance } });
    }
  }

  // Build credit sale results for movements
  for (const sale of insertedSales) {
    if (sale.paymentMethod === 'credit' && !sale.voided) {
      creditSales.push({
        saleId: sale._id as mongoose.Types.ObjectId,
        clientId: sale.client.toString(),
        total: sale.total,
        createdAt: sale.createdAt,
      });
    }
  }

  return creditSales;
}

// ---------------------------------------------------------------------------
// seedCreditMovements
// ---------------------------------------------------------------------------

async function seedCreditMovements(
  schoolId: mongoose.Types.ObjectId,
  creditSales: CreditSaleResult[],
  clients: any[],
  users: Array<{ id: string; role: 'admin' | 'seller' }>,
): Promise<number> {
  const admin = users.find(u => u.role === 'admin');
  if (!admin) return 0;

  const clientsById = new Map(clients.map((c: any) => [c._id.toString(), c]));
  const clientGroupedSales = new Map<string, CreditSaleResult[]>();

  for (const sale of creditSales) {
    if (!clientGroupedSales.has(sale.clientId)) {
      clientGroupedSales.set(sale.clientId, []);
    }
    clientGroupedSales.get(sale.clientId)!.push(sale);
  }

  const movements: any[] = [];

  for (const [clientId, sales] of clientGroupedSales.entries()) {
    const client = clientsById.get(clientId);
    if (!client) continue;

    const sortedSales = sales.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const firstSale = sortedSales[0]!;
    const totalDebt = sales.reduce((sum, s) => sum + s.total, 0);

    // Debt movement
    movements.push({
      client: new mongoose.Types.ObjectId(clientId),
      sale: firstSale.saleId,
      school: schoolId,
      type: 'debt',
      amount: totalDebt,
      balanceAfter: totalDebt,
      note: 'Deuda generada por ventas a credito',
      admin: new mongoose.Types.ObjectId(admin.id),
      createdAt: new Date(firstSale.createdAt),
      updatedAt: new Date(firstSale.createdAt),
    });

    // 30% of clients with debt make a partial payment
    if (Math.random() < 0.3) {
      const paymentAmount = Math.round(totalDebt * 0.5);
      const paymentDate = new Date(firstSale.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
      const remainingBalance = totalDebt - paymentAmount;

      movements.push({
        client: new mongoose.Types.ObjectId(clientId),
        sale: firstSale.saleId,
        school: schoolId,
        type: 'payment',
        amount: paymentAmount,
        balanceAfter: remainingBalance,
        method: Math.random() < 0.5 ? 'cash' : 'transfer',
        note: 'Pago parcial de deuda',
        admin: new mongoose.Types.ObjectId(admin.id),
        createdAt: paymentDate,
        updatedAt: paymentDate,
      });

      // Update client balance to reflect partial payment
      await ClientModel.updateOne({ _id: clientId }, { $set: { balance: remainingBalance } });
    }
  }

  if (movements.length > 0) {
    await CreditMovementModel.collection.insertMany(movements);
  }

  return movements.length;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

seedAll()
  .then(() => {
    console.log('Script terminado correctamente.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error en el seed:', err);
    process.exit(1);
  });
