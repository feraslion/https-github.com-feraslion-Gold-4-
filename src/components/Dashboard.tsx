import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  ShoppingBag, 
  Percent, 
  Warehouse,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { Invoice, Expense, Product, Customer, Supplier, ExchangeRate } from '../types';
import { INITIAL_SETTINGS, INITIAL_WAREHOUSES, INITIAL_AUDIT_LOGS } from '../data/initialData';


interface DashboardProps {
  invoices: Invoice[];
  expenses: Expense[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  exchangeRates: ExchangeRate[];
  baseCurrency: string;
}

export default function Dashboard({
  invoices,
  expenses,
  products,
  customers,
  suppliers,
  exchangeRates,
  baseCurrency
}: DashboardProps) {
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'7' | '30' | 'all'>('30');

  // Filtered lists
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => selectedBranch === 'all' || inv.branchId === selectedBranch);
  }, [invoices, selectedBranch]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => selectedBranch === 'all' || exp.branchId === selectedBranch);
  }, [expenses, selectedBranch]);

  // Financial calculations
  const stats = useMemo(() => {
    let totalSales = 0;
    let totalPurchases = 0;
    let totalVatCollected = 0;
    let totalVatPaid = 0;
    let totalPaidSales = 0;
    let totalUnpaidSales = 0;

    filteredInvoices.forEach(inv => {
      // Calculate amounts converted to base currency
      const multiplier = 1 / (inv.exchangeRate || 1);
      const grandTotalBase = inv.grandTotal * multiplier;
      const vatBase = inv.vatTotal * multiplier;
      const amountPaidBase = inv.amountPaid * multiplier;

      if (inv.type === 'SALE') {
        totalSales += grandTotalBase;
        totalVatCollected += vatBase;
        totalPaidSales += amountPaidBase;
        totalUnpaidSales += (grandTotalBase - amountPaidBase);
      } else if (inv.type === 'PURCHASE') {
        totalPurchases += grandTotalBase;
        totalVatPaid += vatBase;
      }
    });

    let totalExpenseAmount = 0;
    filteredExpenses.forEach(exp => {
      const multiplier = 1 / (exp.exchangeRate || 1);
      totalExpenseAmount += exp.amount * multiplier;
    });

    const netProfit = totalSales - totalPurchases - totalExpenseAmount;
    const vatNet = totalVatCollected - totalVatPaid;

    // Stock value
    let totalStockValue = 0;
    products.forEach(p => {
      const qty = Object.values(p.warehouseStocks).reduce((sum, q) => sum + q, 0);
      totalStockValue += qty * p.cost;
    });

    return {
      totalSales,
      totalPurchases,
      totalExpenseAmount,
      netProfit,
      totalVatCollected,
      totalVatPaid,
      vatNet,
      totalPaidSales,
      totalUnpaidSales,
      totalStockValue
    };
  }, [filteredInvoices, filteredExpenses, products]);

  // 1. Chart Data: Daily Sales Trend
  const salesTrendData = useMemo(() => {
    const dailyMap: { [date: string]: { sales: number; purchases: number } } = {};
    
    // Sort and fill dates
    filteredInvoices.forEach(inv => {
      const dateStr = new Date(inv.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { sales: 0, purchases: 0 };
      }
      const multiplier = 1 / (inv.exchangeRate || 1);
      const amount = inv.grandTotal * multiplier;
      if (inv.type === 'SALE') {
        dailyMap[dateStr].sales += amount;
      } else if (inv.type === 'PURCHASE') {
        dailyMap[dateStr].purchases += amount;
      }
    });

    return Object.entries(dailyMap).map(([date, data]) => ({
      name: date,
      المبيعات: Math.round(data.sales),
      المشتريات: Math.round(data.purchases)
    })).slice(-10); // Last 10 days
  }, [filteredInvoices]);

  // 2. Chart Data: Expenses by Category
  const expensePieData = useMemo(() => {
    const catMap: { [cat: string]: number } = {};
    filteredExpenses.forEach(exp => {
      const multiplier = 1 / (exp.exchangeRate || 1);
      const amount = exp.amount * multiplier;
      catMap[exp.category] = (catMap[exp.category] || 0) + amount;
    });

    const COLORS = ['#0f766e', '#0d9488', '#14b8a6', '#2dd4bf', '#99f6e4', '#ccfbf1'];

    return Object.entries(catMap).map(([name, value], idx) => ({
      name,
      value: Math.round(value),
      color: COLORS[idx % COLORS.length]
    }));
  }, [filteredExpenses]);

  // 3. Chart Data: Top Products
  const topProductsData = useMemo(() => {
    const prodQtyMap: { [name: string]: number } = {};
    filteredInvoices.filter(inv => inv.type === 'SALE').forEach(inv => {
      inv.items.forEach(item => {
        prodQtyMap[item.productName] = (prodQtyMap[item.productName] || 0) + item.quantity;
      });
    });

    return Object.entries(prodQtyMap)
      .map(([name, value]) => ({ name, الكمية: value }))
      .sort((a, b) => b.الكمية - a.الكمية)
      .slice(0, 5);
  }, [filteredInvoices]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: baseCurrency }).format(amount);
  };

  return (
    <div id="dashboard-view" className="space-y-8">
      {/* Title & Filters */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b-[1.5px] border-[#1A1A1A] pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-[#1A1A1A] uppercase tracking-tighter leading-none mb-2 italic">لوحة التحكم والتحليلات المالية</h1>
          <p className="text-xs uppercase tracking-widest font-sans font-bold text-[#1A1A1A]/60">نظرة عامة على الأداء المالي، المبيعات، المخزون، والضرائب</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Branch Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-sans font-extrabold text-[#1A1A1A]/60">الفرع:</span>
            <select
              id="branch-filter"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-white border-[1.5px] border-[#1A1A1A] text-[#1A1A1A] text-xs font-bold rounded-none px-3 py-2 focus:outline-none focus:bg-[#F9F7F2] transition"
            >
              <option value="all">كل الفروع</option>
              <option value="b-1">فرع الرياض</option>
              <option value="b-2">فرع جدة</option>
            </select>
          </div>

          {/* Time Filter */}
          <div className="border-[1.5px] border-[#1A1A1A] bg-white p-0.5 rounded-none flex items-center">
            <button
              id="btn-range-7"
              onClick={() => setTimeRange('7')}
              className={`text-xs px-3.5 py-1.5 rounded-none transition font-bold ${timeRange === '7' ? 'bg-[#1A1A1A] text-[#F9F7F2]' : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/5'}`}
            >
              آخر 7 أيام
            </button>
            <button
              id="btn-range-30"
              onClick={() => setTimeRange('30')}
              className={`text-xs px-3.5 py-1.5 rounded-none transition font-bold border-x border-[#1A1A1A] ${timeRange === '30' ? 'bg-[#1A1A1A] text-[#F9F7F2]' : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/5'}`}
            >
              آخر 30 يومًا
            </button>
            <button
              id="btn-range-all"
              onClick={() => setTimeRange('all')}
              className={`text-xs px-3.5 py-1.5 rounded-none transition font-bold ${timeRange === 'all' ? 'bg-[#1A1A1A] text-[#F9F7F2]' : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/5'}`}
            >
              الكل
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI: Sales */}
        <div id="kpi-sales" className="bg-white border-[1.5px] border-[#1A1A1A] rounded-none p-6 flex flex-col justify-between hover:bg-[#F9F7F2]/30 transition duration-150">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-sans font-extrabold text-[#1A1A1A]/60 tracking-wider">إجمالي المبيعات (الذمم المفتوحة)</p>
            <h3 className="text-3xl font-serif font-black text-[#1A1A1A] tracking-tighter my-2 leading-none">{formatCurrency(stats.totalSales)}</h3>
            <div className="flex items-center gap-1 text-emerald-800 text-xs font-bold font-sans">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+12.4% عن الشهر السابق</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1A1A1A]/10 flex justify-between items-center text-[10px] uppercase tracking-wider font-sans font-extrabold text-[#1A1A1A]/40">
            <span>مدخلات معتمدة</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* KPI: Purchases */}
        <div id="kpi-purchases" className="bg-white border-[1.5px] border-[#1A1A1A] rounded-none p-6 flex flex-col justify-between hover:bg-[#F9F7F2]/30 transition duration-150">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-sans font-extrabold text-[#1A1A1A]/60 tracking-wider">إجمالي المشتريات (التوريدات)</p>
            <h3 className="text-3xl font-serif font-black text-[#1A1A1A] tracking-tighter my-2 leading-none">{formatCurrency(stats.totalPurchases)}</h3>
            <div className="flex items-center gap-1 text-amber-800 text-xs font-bold font-sans">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+8.2% توريد مواد خام</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1A1A1A]/10 flex justify-between items-center text-[10px] uppercase tracking-wider font-sans font-extrabold text-[#1A1A1A]/40">
            <span>سندات التوريد</span>
            <ShoppingBag className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* KPI: Expenses */}
        <div id="kpi-expenses" className="bg-white border-[1.5px] border-[#1A1A1A] rounded-none p-6 flex flex-col justify-between hover:bg-[#F9F7F2]/30 transition duration-150">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-sans font-extrabold text-[#1A1A1A]/60 tracking-wider">إجمالي المصروفات الإدارية</p>
            <h3 className="text-3xl font-serif font-black text-[#1A1A1A] tracking-tighter my-2 leading-none">{formatCurrency(stats.totalExpenseAmount)}</h3>
            <div className="flex items-center gap-1 text-rose-800 text-xs font-bold font-sans">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>-3.5% ترشيد إنفاق</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1A1A1A]/10 flex justify-between items-center text-[10px] uppercase tracking-wider font-sans font-extrabold text-[#1A1A1A]/40">
            <span>التكاليف التشغيلية</span>
            <TrendingDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* KPI: Net Profit */}
        <div id="kpi-net-profit" className="bg-[#1A1A1A] text-[#F9F7F2] border-[1.5px] border-[#1A1A1A] rounded-none p-6 flex flex-col justify-between transition duration-150">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-sans font-extrabold text-[#F9F7F2]/60 tracking-wider">صافي الربح التشغيلي</p>
            <h3 className="text-3xl font-serif font-black text-[#F9F7F2] tracking-tighter my-2 leading-none">
              {formatCurrency(stats.netProfit)}
            </h3>
            <div className="flex items-center gap-1 text-emerald-300 text-xs font-bold font-sans">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>هامش ربح إيجابي {stats.totalSales > 0 ? ((stats.netProfit / stats.totalSales) * 100).toFixed(1) : 0}%</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F9F7F2]/10 flex justify-between items-center text-[10px] uppercase tracking-wider font-sans font-bold text-[#F9F7F2]/40">
            <span>الربحية الصافية</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-300" />
          </div>
        </div>
      </div>

      {/* Secondary VAT & Inventory Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* VAT Collected & Paid Card */}
        <div id="card-vat-overview" className="bg-white border-[1.5px] border-[#1A1A1A] rounded-none p-6 shadow-none hover:bg-[#F9F7F2]/30 transition">
          <div className="mb-4">
            <h3 className="text-xs uppercase tracking-widest font-sans font-extrabold py-1 border-y border-[#1A1A1A] inline-block">ضريبة القيمة المضافة (VAT - {INITIAL_SETTINGS.vatPercent}%)</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#1A1A1A]/70 font-medium">الضريبة المحصلة (المبيعات)</span>
              <span className="font-bold text-[#1A1A1A] font-mono">{formatCurrency(stats.totalVatCollected)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#1A1A1A]/70 font-medium">الضريبة المدفوعة (المشتريات)</span>
              <span className="font-bold text-[#1A1A1A] font-mono">{formatCurrency(stats.totalVatPaid)}</span>
            </div>
            <div className="border-t-[1.5px] border-[#1A1A1A] pt-3 flex justify-between items-center text-sm font-bold">
              <span className="text-[#1A1A1A] font-serif">الرصيد الضريبي المستحق للفلترة</span>
              <span className={stats.vatNet >= 0 ? 'text-[#1A1A1A] font-mono font-black' : 'text-[#8C2D19] font-mono font-black'}>
                {formatCurrency(stats.vatNet)}
              </span>
            </div>
            <p className="text-[10px] text-[#1A1A1A]/60 text-right leading-relaxed italic">
              * يتم الحساب ديناميكياً لتسهيل ملء الإقرار الضريبي لهيئة الزكاة والضريبة والجمارك.
            </p>
          </div>
        </div>

        {/* Inventory Value & Assets Card */}
        <div id="card-inventory-assets" className="bg-white border-[1.5px] border-[#1A1A1A] rounded-none p-6 shadow-none hover:bg-[#F9F7F2]/30 transition">
          <div className="mb-4">
            <h3 className="text-xs uppercase tracking-widest font-sans font-extrabold py-1 border-y border-[#1A1A1A] inline-block">المخزون والمنتجات والأصول</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#1A1A1A]/70 font-medium">عدد المنتجات الفريدة</span>
              <span className="font-bold text-[#1A1A1A]">{products.length} منتجات</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#1A1A1A]/70 font-medium">إجمالي قطع المخزون المتاحة</span>
              <span className="font-bold text-[#1A1A1A]">
                {products.reduce((acc, p) => acc + (Object.values(p.warehouseStocks) as number[]).reduce((sum: number, q: number) => sum + q, 0), 0)} حبة
              </span>
            </div>
            <div className="border-t-[1.5px] border-[#1A1A1A] pt-3 flex justify-between items-center text-sm font-bold">
              <span className="text-[#1A1A1A] font-serif">القيمة التقديرية للمخزون (بسعر التكلفة)</span>
              <span className="text-[#1A1A1A] font-mono font-black">{formatCurrency(stats.totalStockValue)}</span>
            </div>
            <div className="text-[10px] text-[#1A1A1A]/60 flex items-center gap-1 justify-end italic">
              <Warehouse className="w-3 h-3" />
              <span>موزعة على {INITIAL_WAREHOUSES.length} مستودعات نشطة</span>
            </div>
          </div>
        </div>

        {/* Customers & Suppliers Credits Balance Card */}
        <div id="card-partners-balances" className="bg-white border-[1.5px] border-[#1A1A1A] rounded-none p-6 shadow-none hover:bg-[#F9F7F2]/30 transition">
          <div className="mb-4">
            <h3 className="text-xs uppercase tracking-widest font-sans font-extrabold py-1 border-y border-[#1A1A1A] inline-block">حسابات الشركاء والذمم المدينة/الدائنة</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#1A1A1A]/70 font-medium">ذمم مدينة (عملاء لصالحنا)</span>
              <span className="font-bold text-emerald-800 font-mono">
                {formatCurrency(customers.reduce((acc, c) => acc + (c.balance > 0 ? c.balance : 0), 0))}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#1A1A1A]/70 font-medium">ذمم دائنة (موردون علينا)</span>
              <span className="font-bold text-[#8C2D19] font-mono">
                {formatCurrency(suppliers.reduce((acc, s) => acc + (s.balance > 0 ? s.balance : 0), 0))}
              </span>
            </div>
            <div className="border-t-[1.5px] border-[#1A1A1A] pt-3 flex justify-between items-center text-sm font-bold">
              <span className="text-[#1A1A1A] font-serif">صافي التدفق المتوقع تحصيله</span>
              <span className="text-[#1A1A1A] font-mono font-black">
                {formatCurrency(
                  customers.reduce((acc, c) => acc + (c.balance > 0 ? c.balance : 0), 0) - 
                  suppliers.reduce((acc, s) => acc + (s.balance > 0 ? s.balance : 0), 0)
                )}
              </span>
            </div>
            <p className="text-[10px] text-[#1A1A1A]/60 text-right leading-relaxed italic">
              * رصيد العملاء الإجمالي والموردين يوضح حالة السيولة والائتمان التجاري الحالي.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Charts & Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Daily Revenue Trend (Area Chart) */}
        <div id="chart-revenue-trend" className="bg-white border-[1.5px] border-[#1A1A1A] rounded-none p-6 shadow-none">
          <div className="flex justify-between items-center mb-6 border-b border-[#1A1A1A]/10 pb-4">
            <h3 className="text-xs uppercase tracking-widest font-sans font-extrabold">مخطط حركة المبيعات مقابل المشتريات (ريال سعودي)</h3>
            <span className="text-[10px] border border-[#1A1A1A] bg-[#1A1A1A] text-[#F9F7F2] px-2.5 py-1 rounded-none font-bold uppercase tracking-wider">مؤشر تراكمي</span>
          </div>
          <div className="h-64">
            {salesTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8C2D19" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#8C2D19" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A1A1A" strokeOpacity={0.12} />
                  <XAxis dataKey="name" stroke="#1A1A1A" fontSize={11} tickLine={false} />
                  <YAxis stroke="#1A1A1A" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ direction: 'rtl', textAlign: 'right', backgroundColor: '#F9F7F2', border: '1.5px solid #1A1A1A', borderRadius: '0px' }} 
                  />
                  <Legend verticalAlign="top" height={36} iconType="square" />
                  <Area type="monotone" dataKey="المبيعات" stroke="#1A1A1A" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="المشتريات" stroke="#8C2D19" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPurchases)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                لا توجد بيانات كافية لعرض الرسم البياني
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Expense Distribution (Pie Chart) & Top Selling Products */}
        <div id="chart-expenses-top-products" className="bg-white border-[1.5px] border-[#1A1A1A] rounded-none p-6 shadow-none grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Expenses Breakdown */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-sans font-extrabold mb-4 border-b border-[#1A1A1A]/20 pb-2">توزيع المصروفات حسب التصنيف</h4>
            <div className="h-44 flex items-center justify-center relative">
              {expensePieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensePieData.map((item, idx) => ({
                        ...item,
                        color: ['#1A1A1A', '#8C2D19', '#7F7F7F', '#B2A290', '#D1C7BD'][idx % 5]
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {expensePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#1A1A1A', '#8C2D19', '#7F7F7F', '#B2A290', '#D1C7BD'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ direction: 'rtl', textAlign: 'right', backgroundColor: '#F9F7F2', border: '1.5px solid #1A1A1A', borderRadius: '0px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-gray-400">لا توجد مصروفات مسجلة</div>
              )}
            </div>
            <div className="mt-2 space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {expensePieData.map((item, idx) => {
                const colors = ['#1A1A1A', '#8C2D19', '#7F7F7F', '#B2A290', '#D1C7BD'];
                const itemColor = colors[idx % colors.length];
                return (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-none" style={{ backgroundColor: itemColor }} />
                      <span className="text-[#1A1A1A]/80 truncate max-w-[100px] font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-[#1A1A1A] font-mono">{formatCurrency(item.value)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Products */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-sans font-extrabold mb-4 border-b border-[#1A1A1A]/20 pb-2 flex items-center justify-between">
              <span>المنتجات الأكثر مبيعاً (كمية)</span>
              <ClipboardList className="w-3.5 h-3.5" />
            </h4>
            {topProductsData.length > 0 ? (
              <div className="space-y-3 mt-2">
                {topProductsData.map((prod, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#1A1A1A] truncate max-w-[110px] font-bold">{prod.name}</span>
                      <span className="font-bold text-[#1A1A1A] font-mono border border-[#1A1A1A]/20 bg-[#F9F7F2] px-2 py-0.5 rounded-none">{prod.الكمية} حبة</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 h-2 rounded-none overflow-hidden">
                      <div 
                        className="bg-[#1A1A1A] h-2 rounded-none transition-all"
                        style={{ width: `${Math.min(100, (prod.الكمية / (topProductsData[0]?.الكمية || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                لا توجد فواتير مبيعات مسجلة حتى الآن
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recents Lists: Invoices and Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest 4 Invoices */}
        <div id="latest-invoices-panel" className="bg-white border-[1.5px] border-[#1A1A1A] rounded-none p-6 shadow-none lg:col-span-2">
          <div className="flex justify-between items-center mb-4 border-b border-[#1A1A1A]/15 pb-3">
            <h3 className="text-xs uppercase tracking-widest font-sans font-extrabold">آخر الفواتير الصادرة والواردة</h3>
            <span className="text-xs font-serif font-bold italic">إجمالي {invoices.length} فواتير</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b-[1.5px] border-[#1A1A1A] text-[#1A1A1A] font-extrabold">
                  <th className="pb-3 text-right uppercase tracking-wider">رقم الفاتورة</th>
                  <th className="pb-3 text-right uppercase tracking-wider">النوع</th>
                  <th className="pb-3 text-right uppercase tracking-wider">التاريخ</th>
                  <th className="pb-3 text-right uppercase tracking-wider">الجهة / الشريك</th>
                  <th className="pb-3 text-left uppercase tracking-wider">المبلغ الإجمالي</th>
                  <th className="pb-3 text-center uppercase tracking-wider">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]/10">
                {invoices.slice(-4).reverse().map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F9F7F2]/40 transition duration-100">
                    <td className="py-3 font-mono font-bold text-[#1A1A1A]">{inv.invoiceNumber}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-none border ${inv.type === 'SALE' ? 'bg-[#1A1A1A] text-[#F9F7F2] border-[#1A1A1A]' : 'bg-white text-[#1A1A1A] border-[#1A1A1A]'}`}>
                        {inv.type === 'SALE' ? 'مبيعات' : 'مشتريات'}
                      </span>
                    </td>
                    <td className="py-3 text-[#1A1A1A]/70 font-mono">
                      {new Date(inv.date).toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 text-[#1A1A1A] font-bold truncate max-w-[120px]">{inv.partyName}</td>
                    <td className="py-3 text-left font-bold text-[#1A1A1A] font-mono">{formatCurrency(inv.grandTotal)}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-none border ${
                        inv.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-950 border-emerald-800' :
                        inv.paymentStatus === 'PARTIAL' ? 'bg-blue-50 text-blue-950 border-blue-800' : 'bg-rose-50 text-rose-950 border-rose-800'
                      }`}>
                        {inv.paymentStatus === 'PAID' ? 'مدفوعة' : inv.paymentStatus === 'PARTIAL' ? 'جزئية' : 'غير مدفوعة'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log / Activity Log Panel */}
        <div id="activity-logs-panel" className="bg-white border-[1.5px] border-[#1A1A1A] rounded-none p-6 shadow-none">
          <h3 className="text-xs uppercase tracking-widest font-sans font-extrabold mb-4 border-b border-[#1A1A1A]/15 pb-3">سجل العمليات والتدقيق المالي</h3>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
            {INITIAL_AUDIT_LOGS.map((log) => (
              <div key={log.id} className="border-r-[2px] border-[#1A1A1A] pr-3 py-1 space-y-1 bg-[#F9F7F2]/30">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-[#1A1A1A]/50">
                    {new Date(log.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[10px] uppercase font-sans font-extrabold text-[#1A1A1A]">{log.action}</span>
                </div>
                <p className="text-xs text-[#1A1A1A]/80 leading-relaxed font-serif font-medium">{log.details}</p>
                <p className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/40 text-left font-sans font-extrabold">المسؤول: {log.user}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
