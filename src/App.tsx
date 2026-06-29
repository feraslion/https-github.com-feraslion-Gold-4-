import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Package, 
  Users, 
  CreditCard, 
  Settings, 
  Wifi, 
  WifiOff, 
  Bell, 
  Printer, 
  Download, 
  RefreshCw,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { 
  Customer, 
  Supplier, 
  Product, 
  Category, 
  Branch, 
  Warehouse, 
  Invoice, 
  Expense, 
  ExchangeRate, 
  SystemSettings 
} from './types';
import { 
  INITIAL_USER, 
  INITIAL_SETTINGS, 
  INITIAL_BRANCHES, 
  INITIAL_WAREHOUSES, 
  INITIAL_CATEGORIES, 
  INITIAL_EXCHANGE_RATES, 
  INITIAL_CUSTOMERS, 
  INITIAL_SUPPLIERS, 
  INITIAL_PRODUCTS, 
  INITIAL_INVOICES, 
  INITIAL_EXPENSES 
} from './data/initialData';

// Core views
import Dashboard from './components/Dashboard';
import Invoices from './components/Invoices';
import Products from './components/Products';
import Parties from './components/Parties';
import Expenses from './components/Expenses';
import SettingsManager from './components/SettingsManager';
import ThermalPrintPreview from './components/ThermalPrintPreview';

type ActiveView = 'DASHBOARD' | 'INVOICES' | 'PRODUCTS' | 'PARTIES' | 'EXPENSES' | 'SETTINGS';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('DASHBOARD');
  
  // Real-time Network connection mode simulation (Toggleable!)
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);

  // Core application database states, initialized from localStorage or defaults
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('erp_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>(() => {
    const saved = localStorage.getItem('erp_rates');
    return saved ? JSON.parse(saved) : INITIAL_EXCHANGE_RATES;
  });

  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem('erp_branches');
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
  });

  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    const saved = localStorage.getItem('erp_warehouses');
    return saved ? JSON.parse(saved) : INITIAL_WAREHOUSES;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('erp_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('erp_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('erp_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('erp_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('erp_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('erp_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  // Notifications state
  const [notifications, setNotifications] = useState<{ id: string; text: string; type: 'success' | 'warn' }[]>([
    { id: '1', text: 'تم بدء تشغيل نظام الريادة ERP بنجاح والمزامنة التلقائية مفعلة.', type: 'success' }
  ]);

  // Thermal Print modal target state
  const [thermalInvoice, setThermalInvoice] = useState<Invoice | null>(null);

  // Sync state with localstorage on change
  useEffect(() => {
    localStorage.setItem('erp_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('erp_rates', JSON.stringify(exchangeRates));
  }, [exchangeRates]);

  useEffect(() => {
    localStorage.setItem('erp_branches', JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem('erp_warehouses', JSON.stringify(warehouses));
  }, [warehouses]);

  useEffect(() => {
    localStorage.setItem('erp_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('erp_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('erp_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('erp_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('erp_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('erp_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Trigger local manual synchronization
  const triggerManualSync = () => {
    if (!isOnline) {
      addNotification('لا يمكن المزامنة أثناء وضع عدم الاتصال (Offline)!', 'warn');
      return;
    }
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      addNotification('تمت مزامنة السجلات والفواتير مع السيرفر السحابي بنجاح!', 'success');
    }, 1500);
  };

  const addNotification = (text: string, type: 'success' | 'warn' = 'success') => {
    setNotifications(prev => [{ id: Date.now().toString(), text, type }, ...prev.slice(0, 5)]);
  };

  // State Updates Handlers
  const handleAddInvoice = (newInvoice: Invoice) => {
    // 1. Add to invoices list
    setInvoices(prev => [...prev, newInvoice]);
    addNotification(`تم إصدار فاتورة جديدة رقم ${newInvoice.invoiceNumber}`, 'success');

    // 2. Adjust Product stock levels in the designated warehouse
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const itemInInvoice = newInvoice.items.find(ii => ii.productId === p.id);
        if (itemInInvoice) {
          const updatedStocks = { ...p.warehouseStocks };
          const whId = newInvoice.warehouseId;
          const currentQty = updatedStocks[whId] || 0;
          
          if (newInvoice.type === 'SALE') {
            updatedStocks[whId] = Math.max(0, currentQty - itemInInvoice.quantity);
          } else if (newInvoice.type === 'PURCHASE') {
            updatedStocks[whId] = currentQty + itemInInvoice.quantity;
          }
          return { ...p, warehouseStocks: updatedStocks };
        }
        return p;
      });
    });

    // 3. Update customer or supplier balance if not fully paid (Credit tracking!)
    const outstanding = newInvoice.grandTotal - newInvoice.amountPaid;
    if (outstanding > 0) {
      if (newInvoice.type === 'SALE') {
        setCustomers(prev => prev.map(c => c.id === newInvoice.partyId ? { ...c, balance: c.balance + outstanding } : c));
      } else if (newInvoice.type === 'PURCHASE') {
        setSuppliers(prev => prev.map(s => s.id === newInvoice.partyId ? { ...s, balance: s.balance + outstanding } : s));
      }
    }
  };

  const handleAddProduct = (newProd: Product) => {
    setProducts(prev => [...prev, newProd]);
    addNotification(`تمت إضافة منتج جديد: ${newProd.name}`, 'success');
  };

  const handleEditProduct = (updatedProd: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
    addNotification(`تم تعديل بيانات منتج: ${updatedProd.name}`, 'success');
  };

  const handleAddCategory = (newCat: Category) => {
    setCategories(prev => [...prev, newCat]);
    addNotification(`تمت إضافة تصنيف جديد: ${newCat.name}`, 'success');
  };

  const handleAddCustomer = (newCust: Customer) => {
    setCustomers(prev => [...prev, newCust]);
    addNotification(`تم تسجيل عميل جديد: ${newCust.name}`, 'success');
  };

  const handleAddSupplier = (newSupp: Supplier) => {
    setSuppliers(prev => [...prev, newSupp]);
    addNotification(`تم تسجيل مورد جديد: ${newSupp.name}`, 'success');
  };

  const handleAddExpense = (newExp: Expense) => {
    setExpenses(prev => [...prev, newExp]);
    addNotification(`تم قيد مصروف جديد بقيمة ${newExp.amount} ${newExp.currency}`, 'success');
  };

  const handleAddBranch = (newBranch: Branch) => {
    setBranches(prev => [...prev, newBranch]);
    addNotification(`تم افتتاح فرع جديد: ${newBranch.name}`, 'success');
  };

  const handleAddWarehouse = (newWh: Warehouse) => {
    setWarehouses(prev => [...prev, newWh]);
    addNotification(`تم تدشين مستودع جديد: ${newWh.name}`, 'success');
  };

  // Local State Backup & Restore (JSON serialization)
  const handleExportBackup = () => {
    const backupData = {
      settings,
      exchangeRates,
      branches,
      warehouses,
      categories,
      customers,
      suppliers,
      products,
      invoices,
      expenses
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `riyadah_erp_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addNotification('تم تصدير ملف النسخة الاحتياطية بنجاح!', 'success');
  };

  const handleImportBackup = (importedData: any) => {
    if (importedData.settings) setSettings(importedData.settings);
    if (importedData.exchangeRates) setExchangeRates(importedData.exchangeRates);
    if (importedData.branches) setBranches(importedData.branches);
    if (importedData.warehouses) setWarehouses(importedData.warehouses);
    if (importedData.categories) setCategories(importedData.categories);
    if (importedData.customers) setCustomers(importedData.customers);
    if (importedData.suppliers) setSuppliers(importedData.suppliers);
    if (importedData.products) setProducts(importedData.products);
    if (importedData.invoices) setInvoices(importedData.invoices);
    if (importedData.expenses) setExpenses(importedData.expenses);

    addNotification('تم استيراد كافة السجلات والملفات واستعادتها بنجاح!', 'success');
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#1A1A1A] selection:text-[#F9F7F2]" style={{ direction: 'rtl' }}>
      
      {/* Top Navigation / Brand Header */}
      <header className="bg-[#F9F7F2] border-b-[1.5px] border-[#1A1A1A] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-none bg-[#1A1A1A] text-[#F9F7F2] flex items-center justify-center font-serif italic font-bold text-2xl border border-[#1A1A1A]">
              ر
            </div>
            <div>
              <span className="font-serif font-extrabold text-xl text-[#1A1A1A] tracking-tight block leading-tight">نظام الريادة السحابي</span>
              <p className="text-[10px] text-[#1A1A1A]/70 uppercase tracking-widest font-sans font-bold">{settings.companyName}</p>
            </div>
          </div>

          {/* Sync & Network Simulator panel */}
          <div className="flex items-center gap-3">
            {/* Simulation of Offline/Online toggle */}
            <div className="flex items-center gap-2 border-[1.5px] border-[#1A1A1A] bg-white px-3 py-1.5 rounded-none">
              <button
                id="toggle-network-status"
                onClick={() => {
                  const targetState = !isOnline;
                  setIsOnline(targetState);
                  addNotification(targetState ? 'تم الاتصال بالشبكة بنجاح.' : 'تم الانتقال لوضع عدم الاتصال (Offline Mode).', targetState ? 'success' : 'warn');
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${isOnline ? 'bg-emerald-600 shadow-xs animate-pulse' : 'bg-rose-600'}`}
                title="تغيير حالة الاتصال بالإنترنت"
              />
              <span className="text-[10px] font-bold text-[#1A1A1A] font-sans hidden sm:inline">
                {isOnline ? 'المزامنة السحابية' : 'وضع عدم الاتصال المحلي'}
              </span>
            </div>

            {/* Sync trigger button */}
            <button
              id="sync-now-btn"
              onClick={triggerManualSync}
              className={`border-[1.5px] border-[#1A1A1A] bg-white hover:bg-[#1A1A1A] hover:text-[#F9F7F2] text-[#1A1A1A] p-2 rounded-none transition ${syncing ? 'animate-spin' : ''}`}
              title="مزامنة فورية للدفاتر"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Current System Time Badge */}
            <span className="text-[10px] font-mono border-[1.5px] border-[#1A1A1A] bg-white text-[#1A1A1A] px-3 py-1.5 rounded-none font-bold hidden md:inline">
              {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>

        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Persistent Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-white border-[1.5px] border-[#1A1A1A] rounded-none p-5 flex flex-col justify-between self-start h-auto md:h-[calc(100vh-180px)] sticky top-28 z-10 shadow-none">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-[#1A1A1A] px-1 block mb-3 py-1 border-y border-[#1A1A1A] uppercase tracking-wider text-center bg-[#F9F7F2]">مراكز العمليات والمحاسبة</span>
            
            {/* Nav: Dashboard */}
            <button
              id="nav-dashboard"
              onClick={() => setActiveView('DASHBOARD')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none text-xs font-bold transition duration-150 ${
                activeView === 'DASHBOARD' 
                  ? 'bg-[#1A1A1A] text-[#F9F7F2]' 
                  : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/5 border-b border-[#1A1A1A]/10'
              }`}
            >
              <span className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>لوحة التحكم المالية</span>
              </span>
              <span className="font-serif italic opacity-60">I</span>
            </button>

            {/* Nav: Invoices */}
            <button
              id="nav-invoices"
              onClick={() => setActiveView('INVOICES')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none text-xs font-bold transition duration-150 ${
                activeView === 'INVOICES' 
                  ? 'bg-[#1A1A1A] text-[#F9F7F2]' 
                  : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/5 border-b border-[#1A1A1A]/10'
              }`}
            >
              <span className="flex items-center gap-3">
                <Receipt className="w-4 h-4" />
                <span>المبيعات والفواتير</span>
              </span>
              <span className="font-serif italic opacity-60">II</span>
            </button>

            {/* Nav: Products */}
            <button
              id="nav-products"
              onClick={() => setActiveView('PRODUCTS')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none text-xs font-bold transition duration-150 ${
                activeView === 'PRODUCTS' 
                  ? 'bg-[#1A1A1A] text-[#F9F7F2]' 
                  : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/5 border-b border-[#1A1A1A]/10'
              }`}
            >
              <span className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>المخزون والمنتجات</span>
              </span>
              <span className="font-serif italic opacity-60">III</span>
            </button>

            {/* Nav: Partners */}
            <button
              id="nav-parties"
              onClick={() => setActiveView('PARTIES')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none text-xs font-bold transition duration-150 ${
                activeView === 'PARTIES' 
                  ? 'bg-[#1A1A1A] text-[#F9F7F2]' 
                  : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/5 border-b border-[#1A1A1A]/10'
              }`}
            >
              <span className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>العملاء والموردون</span>
              </span>
              <span className="font-serif italic opacity-60">IV</span>
            </button>

            {/* Nav: Expenses */}
            <button
              id="nav-expenses"
              onClick={() => setActiveView('EXPENSES')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none text-xs font-bold transition duration-150 ${
                activeView === 'EXPENSES' 
                  ? 'bg-[#1A1A1A] text-[#F9F7F2]' 
                  : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/5 border-b border-[#1A1A1A]/10'
              }`}
            >
              <span className="flex items-center gap-3">
                <CreditCard className="w-4 h-4" />
                <span>إدارة المصروفات</span>
              </span>
              <span className="font-serif italic opacity-60">V</span>
            </button>

            {/* Nav: Settings */}
            <button
              id="nav-settings"
              onClick={() => setActiveView('SETTINGS')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none text-xs font-bold transition duration-150 ${
                activeView === 'SETTINGS' 
                  ? 'bg-[#1A1A1A] text-[#F9F7F2]' 
                  : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/5 border-b border-[#1A1A1A]/10'
              }`}
            >
              <span className="flex items-center gap-3">
                <Settings className="w-4 h-4" />
                <span>الإعدادات والنسخ</span>
              </span>
              <span className="font-serif italic opacity-60">VI</span>
            </button>
          </div>

          {/* User Profile display card in Sidebar */}
          <div className="border-t-[1.5px] border-[#1A1A1A] pt-4 mt-4 text-xs font-sans space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-none bg-[#1A1A1A] text-[#F9F7F2] flex items-center justify-center font-bold text-xs border border-[#1A1A1A]">
                أ
              </div>
              <div>
                <span className="font-bold text-[#1A1A1A] block leading-tight">{INITIAL_USER.name}</span>
                <span className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/70 font-extrabold">المشرف العام (ADMIN)</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Primary Dynamic Main Area Content Panel */}
        <main className="flex-1 min-w-0">
          {activeView === 'DASHBOARD' && (
            <Dashboard 
              invoices={invoices}
              expenses={expenses}
              products={products}
              customers={customers}
              suppliers={suppliers}
              exchangeRates={exchangeRates}
              baseCurrency={settings.baseCurrency}
            />
          )}

          {activeView === 'INVOICES' && (
            <Invoices 
              invoices={invoices}
              customers={customers}
              suppliers={suppliers}
              products={products}
              branches={branches}
              warehouses={warehouses}
              exchangeRates={exchangeRates}
              settings={settings}
              onAddInvoice={handleAddInvoice}
              onOpenThermal={(inv) => setThermalInvoice(inv)}
            />
          )}

          {activeView === 'PRODUCTS' && (
            <Products 
              products={products}
              categories={categories}
              settings={settings}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onAddCategory={handleAddCategory}
            />
          )}

          {activeView === 'PARTIES' && (
            <Parties 
              customers={customers}
              suppliers={suppliers}
              settings={settings}
              onAddCustomer={handleAddCustomer}
              onAddSupplier={handleAddSupplier}
            />
          )}

          {activeView === 'EXPENSES' && (
            <Expenses 
              expenses={expenses}
              branches={branches}
              exchangeRates={exchangeRates}
              settings={settings}
              onAddExpense={handleAddExpense}
            />
          )}

          {activeView === 'SETTINGS' && (
            <SettingsManager 
              settings={settings}
              exchangeRates={exchangeRates}
              branches={branches}
              warehouses={warehouses}
              onSaveSettings={setSettings}
              onUpdateRates={setExchangeRates}
              onAddBranch={handleAddBranch}
              onAddWarehouse={handleAddWarehouse}
              onBackupExport={handleExportBackup}
              onBackupImport={handleImportBackup}
            />
          )}
        </main>

      </div>

      {/* Persistent Notification Bottom Banner Alerts */}
      <div className="fixed bottom-4 left-4 z-40 max-w-sm space-y-2 pointer-events-none select-none">
        {notifications.map((notif) => (
          <div 
            key={notif.id} 
            className={`p-3.5 rounded-none text-xs font-bold border-[1.5px] border-[#1A1A1A] animate-fade-in pointer-events-auto flex items-center gap-2 ${
              notif.type === 'success' ? 'bg-[#1A1A1A] text-[#F9F7F2]' : 'bg-amber-100 text-[#1A1A1A]'
            }`}
          >
            <span className={`w-2 h-2 rounded-none ${notif.type === 'success' ? 'bg-[#F9F7F2]' : 'bg-[#1A1A1A]'}`} />
            <span>{notif.text}</span>
          </div>
        ))}
      </div>

      {/* Floating Thermal Receipt Printer Dialog View */}
      {thermalInvoice && (
        <ThermalPrintPreview 
          invoice={thermalInvoice}
          settings={settings}
          onClose={() => setThermalInvoice(null)}
        />
      )}
    </div>
  );
}
