/**
 * Domain Models for Riyadah ERP Accounting System
 */

export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchId: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vatNumber?: string;
  address?: string;
  balance: number; // Positive means they owe us, negative means we owe them
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vatNumber?: string;
  address?: string;
  balance: number; // Positive means we owe them
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export interface Warehouse {
  id: string;
  name: string;
  branchId: string;
  location?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string; // Stock Keeping Unit / Barcode
  categoryId: string;
  price: number; // Retail Price
  cost: number; // Purchase Cost
  vatRate: number; // e.g. 15 for 15% VAT
  unit: string; // e.g. 'Pcs', 'Kg', 'Box'
  description?: string;
  warehouseStocks: { [warehouseId: string]: number }; // warehouseId -> quantity
  createdAt: string;
}

export type InvoiceType = 'SALE' | 'PURCHASE' | 'RETURN';
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID';
export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER';

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number; // unit price before tax
  vatRate: number;
  vatAmount: number;
  discount: number; // discount amount per unit
  total: number; // final total for this row
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  date: string;
  partyId: string; // Customer ID (for Sale) or Supplier ID (for Purchase)
  partyName: string;
  branchId: string;
  warehouseId: string;
  items: InvoiceItem[];
  subtotal: number; // sum of (qty * price) before tax and discount
  discountTotal: number;
  vatTotal: number;
  grandTotal: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  currency: string;
  exchangeRate: number; // Multiplier relative to base currency
  createdBy: string;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  date: string;
  branchId: string;
  description?: string;
  paymentMethod: PaymentMethod;
}

export interface ExchangeRate {
  code: string; // e.g. 'USD', 'SAR', 'YER', 'AED'
  symbol: string;
  rate: number; // Rate relative to Base Currency (e.g., 1 Base = rate target)
  isBase: boolean;
}

export interface SystemSettings {
  companyName: string;
  companyPhone: string;
  companyAddress: string;
  vatNumber: string;
  baseCurrency: string;
  themeColor: string;
  vatPercent: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}
