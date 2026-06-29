import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Eye, 
  Printer, 
  Check, 
  FileText, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Download,
  Percent
} from 'lucide-react';
import { 
  Invoice, 
  InvoiceItem, 
  InvoiceType, 
  PaymentStatus, 
  PaymentMethod, 
  Customer, 
  Supplier, 
  Product, 
  Branch, 
  Warehouse, 
  ExchangeRate,
  SystemSettings 
} from '../types';

interface InvoicesProps {
  invoices: Invoice[];
  customers: Customer[];
  suppliers: Supplier[];
  products: Product[];
  branches: Branch[];
  warehouses: Warehouse[];
  exchangeRates: ExchangeRate[];
  settings: SystemSettings;
  onAddInvoice: (invoice: Invoice) => void;
  onOpenThermal: (invoice: Invoice) => void;
}

export default function Invoices({
  invoices,
  customers,
  suppliers,
  products,
  branches,
  warehouses,
  exchangeRates,
  settings,
  onAddInvoice,
  onOpenThermal
}: InvoicesProps) {
  // Navigation & Lists
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'SALE' | 'PURCHASE'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // New Invoice State Form
  const [newType, setNewType] = useState<InvoiceType>('SALE');
  const [newPartyId, setNewPartyId] = useState('');
  const [newBranchId, setNewBranchId] = useState(branches[0]?.id || '');
  const [newWarehouseId, setNewWarehouseId] = useState(warehouses[0]?.id || '');
  const [newCurrency, setNewCurrency] = useState(settings.baseCurrency);
  const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethod>('CASH');
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>('PAID');
  const [newAmountPaid, setNewAmountPaid] = useState<number>(0);
  const [newNotes, setNewNotes] = useState('');
  const [newItems, setNewItems] = useState<Omit<InvoiceItem, 'id'>[]>([]);

  // Filtering list
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.partyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'ALL' || inv.type === filterType;
      return matchSearch && matchType;
    });
  }, [invoices, searchTerm, filterType]);

  // Parties based on type (Customers for Sales, Suppliers for Purchases)
  const currentParties = useMemo(() => {
    return newType === 'SALE' ? customers : suppliers;
  }, [newType, customers, suppliers]);

  // Exchange rate selected
  const activeRateObj = useMemo(() => {
    return exchangeRates.find(r => r.code === newCurrency) || { rate: 1, symbol: '' };
  }, [exchangeRates, newCurrency]);

  // Totals calculations for the active creation form
  const formTotals = useMemo(() => {
    let subtotal = 0;
    let discountTotal = 0;
    let vatTotal = 0;

    newItems.forEach(item => {
      const rowPriceDiscounted = item.price - item.discount;
      const rowSubtotal = rowPriceDiscounted * item.quantity;
      subtotal += item.price * item.quantity;
      discountTotal += item.discount * item.quantity;
      
      // Calculate VAT Amount
      const rowVat = rowSubtotal * (item.vatRate / 100);
      vatTotal += rowVat;
    });

    const grandTotal = subtotal - discountTotal + vatTotal;

    return {
      subtotal,
      discountTotal,
      vatTotal,
      grandTotal
    };
  }, [newItems]);

  // Add Item to creation table
  const handleAddItemRow = () => {
    setNewItems(prev => [
      ...prev,
      {
        productId: '',
        productName: '',
        sku: '',
        quantity: 1,
        price: 0,
        vatRate: settings.vatPercent,
        vatAmount: 0,
        discount: 0,
        total: 0
      }
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    setNewItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateItemField = (index: number, field: keyof Omit<InvoiceItem, 'id'>, value: any) => {
    setNewItems(prev => {
      const updated = [...prev];
      const row = { ...updated[index] };

      if (field === 'productId') {
        const prod = products.find(p => p.id === value);
        if (prod) {
          row.productId = prod.id;
          row.productName = prod.name;
          row.sku = prod.sku;
          
          // Apply exchange rate to base product price if multi-currency selected
          // Active rate relative to base currency (e.g., 1 Base = activeRateObj.rate)
          const convertedPrice = prod.price * activeRateObj.rate;
          row.price = convertedPrice;
          row.vatRate = prod.vatRate;
        }
      } else {
        (row as any)[field] = value;
      }

      // Re-calculate totals for this row
      const discountVal = Number(row.discount) || 0;
      const priceVal = Number(row.price) || 0;
      const qtyVal = Number(row.quantity) || 1;
      
      const discountedUnitPrice = priceVal - discountVal;
      const baseRowTotal = discountedUnitPrice * qtyVal;
      const rowVat = baseRowTotal * (row.vatRate / 100);
      
      row.vatAmount = rowVat;
      row.total = baseRowTotal + rowVat;

      updated[index] = row;
      return updated;
    });
  };

  // Automatically update Amount Paid when status changes
  const handleStatusChange = (status: PaymentStatus) => {
    setNewPaymentStatus(status);
    if (status === 'PAID') {
      setNewAmountPaid(Math.round(formTotals.grandTotal));
    } else if (status === 'UNPAID') {
      setNewAmountPaid(0);
    }
  };

  // Submit new Invoice
  const handleSaveInvoice = () => {
    if (!newPartyId) {
      alert('الرجاء اختيار العميل أو المورد أولاً');
      return;
    }
    if (newItems.length === 0 || newItems.some(item => !item.productId)) {
      alert('الرجاء إضافة صنف واحد على الأقل وتحديده بالشكل الصحيح');
      return;
    }

    const partyObj = currentParties.find(p => p.id === newPartyId);

    const createdInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`,
      type: newType,
      date: new Date().toISOString(),
      partyId: newPartyId,
      partyName: partyObj?.name || 'عميل عام نقدي',
      branchId: newBranchId,
      warehouseId: newWarehouseId,
      items: newItems.map((item, idx) => ({ ...item, id: `ii-${Date.now()}-${idx}` })),
      subtotal: formTotals.subtotal,
      discountTotal: formTotals.discountTotal,
      vatTotal: formTotals.vatTotal,
      grandTotal: formTotals.grandTotal,
      amountPaid: newAmountPaid,
      paymentStatus: newPaymentStatus,
      paymentMethod: newPaymentMethod,
      notes: newNotes,
      currency: newCurrency,
      exchangeRate: activeRateObj.rate,
      createdBy: 'أحمد القحطاني'
    };

    onAddInvoice(createdInvoice);
    
    // Reset Form
    setShowCreateModal(false);
    setNewPartyId('');
    setNewItems([]);
    setNewNotes('');
    setNewAmountPaid(0);
    setNewPaymentStatus('PAID');
  };

  // Open creation modal with initial item
  const openCreateInvoice = (type: InvoiceType) => {
    setNewType(type);
    setNewCurrency(settings.baseCurrency);
    setNewItems([
      {
        productId: '',
        productName: '',
        sku: '',
        quantity: 1,
        price: 0,
        vatRate: settings.vatPercent,
        vatAmount: 0,
        discount: 0,
        total: 0
      }
    ]);
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b-[1.5px] border-[#1A1A1A] pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-[#1A1A1A] uppercase tracking-tighter leading-none mb-2 italic">إدارة الفواتير والمبيعات الذكية</h1>
          <p className="text-xs uppercase tracking-widest font-sans font-bold text-[#1A1A1A]/60">توليد الفواتير الإلكترونية، إدارة ضريبة VAT، والطباعة المباشرة</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            id="create-sales-invoice"
            onClick={() => openCreateInvoice('SALE')}
            className="bg-[#1A1A1A] hover:bg-[#F9F7F2] hover:text-[#1A1A1A] border-[1.5px] border-[#1A1A1A] text-[#F9F7F2] text-xs font-bold px-4 py-2.5 rounded-none flex items-center gap-2 transition duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>فاتورة مبيعات جديدة</span>
          </button>
          
          <button
            id="create-purchase-invoice"
            onClick={() => openCreateInvoice('PURCHASE')}
            className="bg-white hover:bg-[#1A1A1A] hover:text-[#F9F7F2] border-[1.5px] border-[#1A1A1A] text-[#1A1A1A] text-xs font-bold px-4 py-2.5 rounded-none flex items-center gap-2 transition duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>فاتورة مشتريات (توريد)</span>
          </button>
        </div>
      </div>

      {/* Filters and List */}
      <div className="bg-white border-[1.5px] border-[#1A1A1A] rounded-none shadow-none overflow-hidden">
        <div className="p-5 border-b border-[#1A1A1A]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-[#1A1A1A]/50" />
            <input
              id="invoice-search"
              type="text"
              placeholder="البحث برقم الفاتورة، أو اسم العميل / المورد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-[1.5px] border-[#1A1A1A] text-xs rounded-none pr-10 pl-4 py-2.5 focus:outline-none focus:bg-[#F9F7F2] font-sans font-bold"
            />
          </div>

          <div className="border-[1.5px] border-[#1A1A1A] bg-white p-0.5 rounded-none flex items-center">
            <button
              id="filter-all-invoices"
              onClick={() => setFilterType('ALL')}
              className={`text-xs px-3.5 py-1.5 rounded-none font-bold transition ${filterType === 'ALL' ? 'bg-[#1A1A1A] text-[#F9F7F2]' : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/5'}`}
            >
              الكل
            </button>
            <button
              id="filter-sale-invoices"
              onClick={() => setFilterType('SALE')}
              className={`text-xs px-3.5 py-1.5 rounded-none font-bold border-x border-[#1A1A1A] transition ${filterType === 'SALE' ? 'bg-[#1A1A1A] text-[#F9F7F2]' : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/5'}`}
            >
              المبيعات
            </button>
            <button
              id="filter-purchase-invoices"
              onClick={() => setFilterType('PURCHASE')}
              className={`text-xs px-3.5 py-1.5 rounded-none font-bold transition ${filterType === 'PURCHASE' ? 'bg-[#1A1A1A] text-[#F9F7F2]' : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/5'}`}
            >
              المشتريات
            </button>
          </div>
        </div>

        {/* Invoices List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-[#F9F7F2] text-[#1A1A1A] border-b-[1.5px] border-[#1A1A1A] font-extrabold">
                <th className="p-4">رقم الفاتورة</th>
                <th className="p-4">تاريخ الإصدار</th>
                <th className="p-4">النوع</th>
                <th className="p-4">اسم الشريك / الجهة</th>
                <th className="p-4">المجموع الفرعي</th>
                <th className="p-4">خصومات</th>
                <th className="p-4 text-center">ضريبة VAT ({settings.vatPercent}%)</th>
                <th className="p-4 text-left">المبلغ الإجمالي</th>
                <th className="p-4 text-center">حالة الدفع</th>
                <th className="p-4 text-center">خيارات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/10">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.reverse().map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F9F7F2]/40 transition duration-150">
                    <td className="p-4 font-mono font-bold text-[#1A1A1A]">{inv.invoiceNumber}</td>
                    <td className="p-4 text-[#1A1A1A]/70 font-mono">
                      {new Date(inv.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-none border ${
                        inv.type === 'SALE' ? 'bg-[#1A1A1A] text-[#F9F7F2] border-[#1A1A1A]' : 'bg-white text-[#1A1A1A] border-[#1A1A1A]'
                      }`}>
                        {inv.type === 'SALE' ? 'مبيعات' : 'مشتريات'}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-[#1A1A1A]">{inv.partyName}</td>
                    <td className="p-4 font-mono text-[#1A1A1A]/70">
                      {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: inv.currency }).format(inv.subtotal)}
                    </td>
                    <td className="p-4 font-mono text-[#8C2D19] font-bold">
                      {inv.discountTotal > 0 ? `-${new Intl.NumberFormat('ar-SA', { style: 'currency', currency: inv.currency }).format(inv.discountTotal)}` : '-'}
                    </td>
                    <td className="p-4 text-center font-mono text-[#1A1A1A]/70">
                      {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: inv.currency }).format(inv.vatTotal)}
                    </td>
                    <td className="p-4 text-left font-bold text-[#1A1A1A] font-mono">
                      {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: inv.currency }).format(inv.grandTotal)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-none border ${
                        inv.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-950 border-emerald-800' :
                        inv.paymentStatus === 'PARTIAL' ? 'bg-blue-50 text-blue-950 border-blue-800' : 'bg-rose-50 text-rose-950 border-rose-800'
                      }`}>
                        {inv.paymentStatus === 'PAID' ? 'مدفوعة كاملة' : inv.paymentStatus === 'PARTIAL' ? 'مدفوعة جزئياً' : 'غير مدفوعة'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          id={`view-details-${inv.id}`}
                          onClick={() => setSelectedInvoice(inv)}
                          className="bg-white hover:bg-[#1A1A1A] hover:text-[#F9F7F2] text-[#1A1A1A] p-2 border border-[#1A1A1A] rounded-none transition"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`print-thermal-${inv.id}`}
                          onClick={() => onOpenThermal(inv)}
                          className="bg-white hover:bg-[#1A1A1A] hover:text-[#F9F7F2] text-[#1A1A1A] p-2 border border-[#1A1A1A] rounded-none transition"
                          title="طباعة إيصال حراري"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="p-10 text-center text-gray-400 font-sans">
                    لا توجد فواتير مطابقة لخيارات البحث الحالية
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-gray-900 text-base">تفاصيل الفاتورة الإلكترونية {selectedInvoice.invoiceNumber}</h3>
                <p className="text-xs text-gray-500 mt-0.5">صادرة عن طريق المستخدم {selectedInvoice.createdBy}</p>
              </div>
              <button
                id="close-details-modal"
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-gray-900 transition"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Top Meta Columns */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="space-y-1">
                  <span className="text-gray-400 font-medium">نوع المعاملة:</span>
                  <p className="font-bold text-gray-900">{selectedInvoice.type === 'SALE' ? 'مبيعات (عملاء)' : 'مشتريات (موردين)'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 font-medium">الجهة / الشريك المستلم:</span>
                  <p className="font-bold text-gray-900 truncate">{selectedInvoice.partyName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 font-medium">العملة والاتفاق:</span>
                  <p className="font-bold text-gray-900">{selectedInvoice.currency} (سعر صرف: {selectedInvoice.exchangeRate})</p>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 font-medium">تاريخ المستند:</span>
                  <p className="font-bold text-gray-900">{new Date(selectedInvoice.date).toLocaleDateString('ar-EG')}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 font-bold">
                      <th className="p-3">اسم الصنف</th>
                      <th className="p-3">باركود SKU</th>
                      <th className="p-3 text-center">الكمية</th>
                      <th className="p-3 text-center">سعر الوحدة</th>
                      <th className="p-3 text-center">خصم الوحدة</th>
                      <th className="p-3 text-center">ضريبة VAT</th>
                      <th className="p-3 text-left">الإجمالي شامل الضريبة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selectedInvoice.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/20">
                        <td className="p-3 font-semibold text-gray-900">{item.productName}</td>
                        <td className="p-3 font-mono text-gray-400">{item.sku}</td>
                        <td className="p-3 text-center font-bold text-gray-800">{item.quantity}</td>
                        <td className="p-3 text-center font-sans">
                          {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: selectedInvoice.currency }).format(item.price)}
                        </td>
                        <td className="p-3 text-center text-rose-600 font-sans">
                          {item.discount > 0 ? `-${new Intl.NumberFormat('ar-SA', { style: 'currency', currency: selectedInvoice.currency }).format(item.discount)}` : '0'}
                        </td>
                        <td className="p-3 text-center font-sans text-gray-500">
                          {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: selectedInvoice.currency }).format(item.vatAmount)}
                        </td>
                        <td className="p-3 text-left font-bold text-gray-900 font-sans">
                          {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: selectedInvoice.currency }).format(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Notes and financial summary summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-500">ملاحظات الفاتورة:</span>
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-xs text-gray-600 min-h-[80px]">
                    {selectedInvoice.notes || 'لا توجد ملاحظات إضافية مرفقة مع هذا السند المالي.'}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl space-y-3 text-xs border border-gray-100">
                  <div className="flex justify-between text-gray-500">
                    <span>المجموع الفرعي (قبل الضريبة والخصم):</span>
                    <span className="font-bold text-gray-900">
                      {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: selectedInvoice.currency }).format(selectedInvoice.subtotal)}
                    </span>
                  </div>
                  {selectedInvoice.discountTotal > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>إجمالي الخصومات الإضافية:</span>
                      <span className="font-bold">
                        -{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: selectedInvoice.currency }).format(selectedInvoice.discountTotal)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>إجمالي ضريبة القيمة المضافة:</span>
                    <span className="font-bold text-gray-900">
                      {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: selectedInvoice.currency }).format(selectedInvoice.vatTotal)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between text-sm font-bold text-teal-800">
                    <span>المجموع الإجمالي النهائي:</span>
                    <span>
                      {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: selectedInvoice.currency }).format(selectedInvoice.grandTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-600">
                    <span>المبلغ المدفوع (سداد):</span>
                    <span className="font-bold text-emerald-600">
                      {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: selectedInvoice.currency }).format(selectedInvoice.amountPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-600">
                    <span>المبلغ المتبقي بالذمة المالية:</span>
                    <span className="font-bold text-rose-600">
                      {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: selectedInvoice.currency }).format(selectedInvoice.grandTotal - selectedInvoice.amountPaid)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-2xl">
              <button
                id="close-details-btn"
                onClick={() => setSelectedInvoice(null)}
                className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl transition"
              >
                إغلاق النافذة
              </button>
              <button
                id={`print-thermal-action-${selectedInvoice.id}`}
                onClick={() => {
                  onOpenThermal(selectedInvoice);
                  setSelectedInvoice(null);
                }}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-xs transition"
              >
                <Printer className="w-4 h-4" />
                <span>إيصال حراري (POS)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Creation Modal Drawer */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/55 z-40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-gray-100 flex flex-col max-h-[92vh]">
            {/* Form Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  إنشاء {newType === 'SALE' ? 'فاتورة مبيعات إلكترونية' : 'فاتورة شراء وتوريد'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">الامتثال التام لمتطلبات ضريبة هيئة الزكاة والجمارك للفوترة</p>
              </div>
              <button
                id="close-create-drawer"
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-900 transition text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Layout Config Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 1. Client / Supplier selection */}
                <div className="space-y-1.5 lg:col-span-2">
                  <label className="text-xs font-bold text-gray-700">
                    {newType === 'SALE' ? 'اسم العميل المعتمد:' : 'اسم المورد المعتمد:'}
                  </label>
                  <select
                    id="party-select"
                    value={newPartyId}
                    onChange={(e) => setNewPartyId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
                  >
                    <option value="">-- اختر الطرف الثاني --</option>
                    {currentParties.map(p => (
                      <option key={p.id} value={p.id}>{p.name} {p.phone ? `(${p.phone})` : ''}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Branch */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">الفرع الصادر منه:</label>
                  <select
                    id="branch-select"
                    value={newBranchId}
                    onChange={(e) => setNewBranchId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Warehouse */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">المستودع المغذي:</label>
                  <select
                    id="warehouse-select"
                    value={newWarehouseId}
                    onChange={(e) => setNewWarehouseId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
                  >
                    {warehouses.filter(w => w.branchId === newBranchId).map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Currency Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">العملة والاتفاق:</label>
                  <select
                    id="currency-select"
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                  >
                    {exchangeRates.map(r => (
                      <option key={r.code} value={r.code}>
                        {r.code} ({r.symbol}) {r.isBase ? '[الأساسية]' : `[صرف ${r.rate}]`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items Dynamic Spreadsheet Grid */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-gray-900">بنود الفاتورة وقائمة الأصناف المشمولة</h4>
                  <button
                    id="add-item-row"
                    type="button"
                    onClick={handleAddItemRow}
                    className="bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة صنف للفاتورة</span>
                  </button>
                </div>

                {/* Items Spreadsheet Panel */}
                <div className="border border-gray-100 rounded-xl overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                        <th className="p-3 w-[35%]">الصنف / المنتج</th>
                        <th className="p-3 text-center">الكمية</th>
                        <th className="p-3 text-center">السعر الفردي</th>
                        <th className="p-3 text-center">الخصم الفردي</th>
                        <th className="p-3 text-center">ضريبة VAT</th>
                        <th className="p-3 text-left">الإجمالي</th>
                        <th className="p-3 text-center">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {newItems.map((item, idx) => (
                        <tr key={idx} className="align-middle">
                          <td className="p-3">
                            <select
                              id={`item-product-${idx}`}
                              value={item.productId}
                              onChange={(e) => handleUpdateItemField(idx, 'productId', e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
                            >
                              <option value="">-- اختر صنفاً للمستودع --</option>
                              {products.map(p => {
                                const availStock = p.warehouseStocks[newWarehouseId] || 0;
                                return (
                                  <option key={p.id} value={p.id}>
                                    {p.name} - ({p.sku}) [متاح {availStock} حبة]
                                  </option>
                                );
                              })}
                            </select>
                          </td>
                          <td className="p-3 text-center">
                            <input
                              id={`item-qty-${idx}`}
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItemField(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-20 text-center bg-gray-50 border border-gray-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none font-bold"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input
                              id={`item-price-${idx}`}
                              type="number"
                              min="0"
                              value={item.price}
                              onChange={(e) => handleUpdateItemField(idx, 'price', parseFloat(e.target.value) || 0)}
                              className="w-24 text-center bg-gray-50 border border-gray-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none font-sans"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input
                              id={`item-discount-${idx}`}
                              type="number"
                              min="0"
                              value={item.discount}
                              onChange={(e) => handleUpdateItemField(idx, 'discount', parseFloat(e.target.value) || 0)}
                              className="w-20 text-center bg-gray-50 border border-gray-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none font-sans text-rose-600"
                            />
                          </td>
                          <td className="p-3 text-center text-gray-500 font-sans">
                            {item.vatRate}%
                          </td>
                          <td className="p-3 text-left font-bold text-gray-900 font-sans">
                            {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: newCurrency }).format(item.total)}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              id={`item-remove-${idx}`}
                              type="button"
                              onClick={() => handleRemoveItemRow(idx)}
                              className="text-rose-600 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Summary & Payment Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-3">
                {/* 1. Payment Settings */}
                <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-2">طريقة السداد المالي</h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-500">حالة الدفع الحالية:</label>
                    <select
                      id="form-payment-status"
                      value={newPaymentStatus}
                      onChange={(e) => handleStatusChange(e.target.value as PaymentStatus)}
                      className="w-full bg-white border border-gray-200 text-xs rounded-lg px-2 py-2 focus:outline-none"
                    >
                      <option value="PAID">مدفوعة كاملة</option>
                      <option value="PARTIAL">دفعة جزئية (آجل)</option>
                      <option value="UNPAID">غير مدفوعة (آجل بالكامل)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-500">طريقة الدفع (الوسيلة):</label>
                    <select
                      id="form-payment-method"
                      value={newPaymentMethod}
                      onChange={(e) => setNewPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full bg-white border border-gray-200 text-xs rounded-lg px-2 py-2 focus:outline-none"
                    >
                      <option value="CASH">نقدي (كاش في الصندوق)</option>
                      <option value="CARD">شبكة مدى / بطاقة ائتمان</option>
                      <option value="BANK_TRANSFER">تحويل بنكي للحساب الرئيسي</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-500">المبلغ المدفوع فعلياً ({newCurrency}):</label>
                    <input
                      id="form-amount-paid"
                      type="number"
                      min="0"
                      max={formTotals.grandTotal}
                      value={newAmountPaid}
                      disabled={newPaymentStatus === 'PAID' || newPaymentStatus === 'UNPAID'}
                      onChange={(e) => setNewAmountPaid(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-gray-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none font-sans font-bold text-emerald-700"
                    />
                  </div>
                </div>

                {/* 2. Notes & Metadata */}
                <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-2">ملاحظات وقيود الحسابات</h4>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-500">شرح أو قيود الفاتورة:</label>
                    <textarea
                      id="form-notes"
                      placeholder="اكتب هنا أي تفاصيل إضافية متعلقة بشحن المواد، شروط الدفع، خصومات العقود والاتفاقيات..."
                      rows={5}
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-xs rounded-lg px-2.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
                    />
                  </div>
                </div>

                {/* 3. Totals Breakdown Panel */}
                <div className="p-5 bg-teal-900/10 text-teal-950 rounded-2xl space-y-3.5 border border-teal-700/10 text-xs">
                  <h4 className="text-xs font-bold text-teal-900 border-b border-teal-700/10 pb-2">تفاصيل الحساب النهائي</h4>
                  
                  <div className="flex justify-between">
                    <span className="text-teal-800">إجمالي السعر الأصلي:</span>
                    <span className="font-sans font-bold">{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: newCurrency }).format(formTotals.subtotal)}</span>
                  </div>

                  {formTotals.discountTotal > 0 && (
                    <div className="flex justify-between text-rose-700">
                      <span>الخصومات الإجمالية المطبقة:</span>
                      <span className="font-sans font-bold">-{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: newCurrency }).format(formTotals.discountTotal)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-teal-800">إجمالي قيمة ضريبة VAT:</span>
                    <span className="font-sans font-bold">{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: newCurrency }).format(formTotals.vatTotal)}</span>
                  </div>

                  <div className="border-t border-teal-700/20 pt-3.5 flex justify-between text-sm font-bold text-teal-900">
                    <span>المجموع الإجمالي المطلوب:</span>
                    <span className="font-sans">{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: newCurrency }).format(formTotals.grandTotal)}</span>
                  </div>

                  <div className="text-[10px] text-teal-800/80 leading-relaxed text-right">
                    * يتم تحويل القيم تلقائياً للعملة الأساسية في الحسابات العامة لضمان اتساق الدفاتر المحاسبية.
                  </div>
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-2xl">
              <button
                id="cancel-create"
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl transition"
              >
                إلغاء المعاملة
              </button>
              <button
                id="submit-invoice-btn"
                type="button"
                onClick={handleSaveInvoice}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition"
              >
                حفظ وإصدار الفاتورة المعتمدة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
