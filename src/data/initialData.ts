import { 
  Customer, 
  Supplier, 
  Category, 
  Branch, 
  Warehouse, 
  Product, 
  Invoice, 
  Expense, 
  ExchangeRate, 
  SystemSettings, 
  AuditLog,
  UserProfile
} from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'u-1',
  name: 'أحمد القحطاني',
  email: 'ahmed@riyadah.com',
  role: 'ADMIN',
  branchId: 'b-1'
};

export const INITIAL_SETTINGS: SystemSettings = {
  companyName: 'شركة الريادة التجارية المحدودة',
  companyPhone: '+966 11 400 5000',
  companyAddress: 'الرياض - طريق الملك فهد - برج الريادة',
  vatNumber: '310248596300003',
  baseCurrency: 'SAR',
  themeColor: '#0f766e', // Teal 700
  vatPercent: 15
};

export const INITIAL_BRANCHES: Branch[] = [
  { id: 'b-1', name: 'الفرع الرئيسي - الرياض', address: 'طريق الملك فهد، الرياض', phone: '+966 11 400 5001' },
  { id: 'b-2', name: 'فرع المنطقة الغربية - جدة', address: 'طريق الملك عبدالعزيز، جدة', phone: '+966 12 600 5002' }
];

export const INITIAL_WAREHOUSES: Warehouse[] = [
  { id: 'w-1', name: 'المستودع المركزي', branchId: 'b-1', location: 'مخرج 18، الرياض' },
  { id: 'w-2', name: 'مستودع جدة الفرعي', branchId: 'b-2', location: 'حي الشرفية، جدة' },
  { id: 'w-3', name: 'صالة عرض الملز', branchId: 'b-1', location: 'حي الملز، الرياض' }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'c-1', name: 'أجهزة إلكترونية', description: 'أجهزة لابتوب، هواتف، شاشات وملحقاتها' },
  { id: 'c-2', name: 'مستلزمات مكتبية', description: 'طاولات، كراسي، أدوات قرطاسية' },
  { id: 'c-3', name: 'شبكات واتصالات', description: 'راوترات، كوابل، مقويات إشارة' }
];

export const INITIAL_EXCHANGE_RATES: ExchangeRate[] = [
  { code: 'SAR', symbol: 'ر.س', rate: 1, isBase: true },
  { code: 'USD', symbol: '$', rate: 3.75, isBase: false }, // 1 USD = 3.75 SAR
  { code: 'AED', symbol: 'د.إ', rate: 1.02, isBase: false }, // 1 AED = 1.02 SAR
  { code: 'YER', symbol: 'ر.ي', rate: 0.015, isBase: false } // 1 YER = 0.015 SAR
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'مؤسسة الحلول الرقمية',
    phone: '0551234567',
    email: 'info@digitalsolutions.com',
    vatNumber: '300524185600003',
    address: 'العليا، الرياض',
    balance: 4500, // They owe us 4500
    createdAt: '2026-06-01T10:00:00Z'
  },
  {
    id: 'cust-2',
    name: 'شركة الأمل للمقاولات',
    phone: '0569876543',
    email: 'contact@alamal.sa',
    vatNumber: '300958641200003',
    address: 'الروابي، جدة',
    balance: 0,
    createdAt: '2026-06-05T14:30:00Z'
  },
  {
    id: 'cust-3',
    name: 'العميل النقدي (عميل عام)',
    phone: '0500000000',
    balance: 0,
    createdAt: '2026-06-01T08:00:00Z'
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'supp-1',
    name: 'شركة التقنية العالمية للموزعين',
    phone: '0112223333',
    email: 'sales@globaltech.com',
    vatNumber: '310452398500003',
    address: 'المنطقة الصناعية، الرياض',
    balance: 12500, // We owe them 12500
    createdAt: '2026-06-01T09:00:00Z'
  },
  {
    id: 'supp-2',
    name: 'مصنع الأثاث المكتبي الحديث',
    phone: '0125556666',
    email: 'info@modernfurniture.com',
    vatNumber: '310852147300003',
    address: 'المدينة الصناعية، جدة',
    balance: 0,
    createdAt: '2026-06-10T11:00:00Z'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'لابتوب ديل كور آي 7 (Dell Core i7)',
    sku: '6901234567890',
    categoryId: 'c-1',
    price: 4500,
    cost: 3200,
    vatRate: 15,
    unit: 'حبة',
    description: 'Dell Latitude 5420, 16GB RAM, 512GB SSD',
    warehouseStocks: { 'w-1': 15, 'w-2': 8, 'w-3': 3 },
    createdAt: '2026-06-01T12:00:00Z'
  },
  {
    id: 'p-2',
    name: 'شاشة سامسونج منحنية 27 بوصة',
    sku: '8806090123456',
    categoryId: 'c-1',
    price: 1200,
    cost: 850,
    vatRate: 15,
    unit: 'حبة',
    description: 'Samsung Curved LED Gaming Monitor C27',
    warehouseStocks: { 'w-1': 22, 'w-2': 10, 'w-3': 5 },
    createdAt: '2026-06-02T09:30:00Z'
  },
  {
    id: 'p-3',
    name: 'كرسي مكتب طبي مريح متحرك',
    sku: '6952211003344',
    categoryId: 'c-2',
    price: 650,
    cost: 400,
    vatRate: 15,
    unit: 'حبة',
    description: 'كرسي مريح داعم للظهر مع مساند رأس مريحة',
    warehouseStocks: { 'w-1': 12, 'w-2': 0, 'w-3': 4 },
    createdAt: '2026-06-11T15:00:00Z'
  },
  {
    id: 'p-4',
    name: 'راوتر تي بي لينك لاسلكي (AX3000 Wi-Fi 6)',
    sku: '6935364006228',
    categoryId: 'c-3',
    price: 380,
    cost: 250,
    vatRate: 15,
    unit: 'حبة',
    description: 'TP-Link Archer AX50 Dual Band Wi-Fi 6 Router',
    warehouseStocks: { 'w-1': 30, 'w-2': 15, 'w-3': 10 },
    createdAt: '2026-06-05T10:00:00Z'
  }
];

// Let's pre-generate realistic transactions over the last few days of June 2026
export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-0001',
    type: 'SALE',
    date: '2026-06-25T10:30:00Z',
    partyId: 'cust-1',
    partyName: 'مؤسسة الحلول الرقمية',
    branchId: 'b-1',
    warehouseId: 'w-1',
    items: [
      {
        id: 'ii-1',
        productId: 'p-1',
        productName: 'لابتوب ديل كور آي 7 (Dell Core i7)',
        sku: '6901234567890',
        quantity: 2,
        price: 4500,
        vatRate: 15,
        vatAmount: 1350, // 9000 * 0.15
        discount: 0,
        total: 10350 // (9000 + 1350)
      },
      {
        id: 'ii-2',
        productId: 'p-2',
        productName: 'شاشة سامسونج منحنية 27 بوصة',
        sku: '8806090123456',
        quantity: 1,
        price: 1200,
        vatRate: 15,
        vatAmount: 180,
        discount: 100,
        total: 1265 // (1200 - 100) * 1.15 = 1100 * 1.15 = 1265
      }
    ],
    subtotal: 10200, // 9000 + 1200
    discountTotal: 100,
    vatTotal: 1515, // 1350 + (1100 * 0.15 = 165)
    grandTotal: 11615,
    amountPaid: 7115,
    paymentStatus: 'PARTIAL',
    paymentMethod: 'BANK_TRANSFER',
    notes: 'تم استلام الدفعة الأولى كتحويل بنكي والمتبقي في الحساب الافتراضي الآجل',
    currency: 'SAR',
    exchangeRate: 1,
    createdBy: 'أحمد القحطاني'
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-0002',
    type: 'SALE',
    date: '2026-06-26T15:45:00Z',
    partyId: 'cust-3',
    partyName: 'العميل النقدي (عميل عام)',
    branchId: 'b-1',
    warehouseId: 'w-3',
    items: [
      {
        id: 'ii-3',
        productId: 'p-4',
        productName: 'راوتر تي بي لينك لاسلكي (AX3000 Wi-Fi 6)',
        sku: '6935364006228',
        quantity: 3,
        price: 380,
        vatRate: 15,
        vatAmount: 171,
        discount: 0,
        total: 1311 // 1140 * 1.15
      }
    ],
    subtotal: 1140,
    discountTotal: 0,
    vatTotal: 171,
    grandTotal: 1311,
    amountPaid: 1311,
    paymentStatus: 'PAID',
    paymentMethod: 'CASH',
    notes: 'مبيعات مباشرة كاش من صالة العرض',
    currency: 'SAR',
    exchangeRate: 1,
    createdBy: 'أحمد القحطاني'
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-0003',
    type: 'PURCHASE',
    date: '2026-06-24T11:00:00Z',
    partyId: 'supp-1',
    partyName: 'شركة التقنية العالمية للموزعين',
    branchId: 'b-1',
    warehouseId: 'w-1',
    items: [
      {
        id: 'ii-4',
        productId: 'p-1',
        productName: 'لابتوب ديل كور آي 7 (Dell Core i7)',
        sku: '6901234567890',
        quantity: 5,
        price: 3200, // Purchase Cost
        vatRate: 15,
        vatAmount: 2400,
        discount: 0,
        total: 18400
      }
    ],
    subtotal: 16000,
    discountTotal: 0,
    vatTotal: 2400,
    grandTotal: 18400,
    amountPaid: 18400,
    paymentStatus: 'PAID',
    paymentMethod: 'BANK_TRANSFER',
    notes: 'فاتورة شراء وتوريد كمبيوترات للمستودع الرئيسي',
    currency: 'SAR',
    exchangeRate: 1,
    createdBy: 'أحمد القحطاني'
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2026-0004',
    type: 'SALE',
    date: '2026-06-28T09:15:00Z',
    partyId: 'cust-2',
    partyName: 'شركة الأمل للمقاولات',
    branchId: 'b-2',
    warehouseId: 'w-2',
    items: [
      {
        id: 'ii-5',
        productId: 'p-3',
        productName: 'كرسي مكتب طبي مريح متحرك',
        sku: '6952211003344',
        quantity: 10,
        price: 650,
        vatRate: 15,
        vatAmount: 975,
        discount: 50, // 50 SAR discount per chair
        total: 6900 // (650 - 50) * 10 = 6000 * 1.15 = 6900
      }
    ],
    subtotal: 6500,
    discountTotal: 500,
    vatTotal: 900, // 6000 * 0.15
    grandTotal: 6900,
    amountPaid: 6900,
    paymentStatus: 'PAID',
    paymentMethod: 'CARD',
    notes: 'تأثيث فرع جدة لشركة الأمل',
    currency: 'SAR',
    exchangeRate: 1,
    createdBy: 'أحمد القحطاني'
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    title: 'إيجار معرض الملز - النصف الأول',
    category: 'إيجارات',
    amount: 15000,
    currency: 'SAR',
    exchangeRate: 1,
    date: '2026-06-01T12:00:00Z',
    branchId: 'b-1',
    description: 'إيجار سنوي لمعرض الملز - دفعة ربع سنوية',
    paymentMethod: 'BANK_TRANSFER'
  },
  {
    id: 'exp-2',
    title: 'فاتورة الكهرباء لشهر مايو',
    category: 'مرافق عامة',
    amount: 1850,
    currency: 'SAR',
    exchangeRate: 1,
    date: '2026-06-10T10:00:00Z',
    branchId: 'b-1',
    description: 'فاتورة كهرباء فرع الملز والمستودع الرئيسي',
    paymentMethod: 'CARD'
  },
  {
    id: 'exp-3',
    title: 'أدوات مكتبية وقرطاسية',
    category: 'قرطاسية وضيافة',
    amount: 350,
    currency: 'SAR',
    exchangeRate: 1,
    date: '2026-06-18T14:00:00Z',
    branchId: 'b-2',
    description: 'أوراق ومستلزمات طباعة لفرع جدة',
    paymentMethod: 'CASH'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-06-28T09:15:00Z',
    user: 'أحمد القحطاني',
    action: 'إنشاء فاتورة مبيعات',
    details: 'إنشاء فاتورة مبيعات INV-2026-0004 بقيمة 6900 ر.س'
  },
  {
    id: 'log-2',
    timestamp: '2026-06-26T15:45:00Z',
    user: 'أحمد القحطاني',
    action: 'إنشاء فاتورة مبيعات',
    details: 'إنشاء فاتورة مبيعات INV-2026-0002 بقيمة 1311 ر.س'
  },
  {
    id: 'log-3',
    timestamp: '2026-06-25T10:30:00Z',
    user: 'أحمد القحطاني',
    action: 'إنشاء فاتورة مبيعات',
    details: 'إنشاء فاتورة مبيعات INV-2026-0001 بقيمة 11615 ر.س'
  },
  {
    id: 'log-4',
    timestamp: '2026-06-24T11:00:00Z',
    user: 'أحمد القحطاني',
    action: 'إنشاء فاتورة مشتريات',
    details: 'إنشاء فاتورة مشتريات INV-2026-0003 بقيمة 18400 ر.س'
  }
];
