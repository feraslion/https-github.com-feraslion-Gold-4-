import { useState, useMemo } from 'react';
import { Plus, Search, Trash2, Calendar, FileText, DollarSign, Wallet } from 'lucide-react';
import { Expense, Branch, ExchangeRate, PaymentMethod, SystemSettings } from '../types';

interface ExpensesProps {
  expenses: Expense[];
  branches: Branch[];
  exchangeRates: ExchangeRate[];
  settings: SystemSettings;
  onAddExpense: (expense: Expense) => void;
}

export default function Expenses({
  expenses,
  branches,
  exchangeRates,
  settings,
  onAddExpense
}: ExpensesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('إيجارات');
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState(settings.baseCurrency);
  const [branchId, setBranchId] = useState(branches[0]?.id || '');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

  // Filtering list
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (exp.description && exp.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchBranch = selectedBranch === 'all' || exp.branchId === selectedBranch;
      return matchSearch && matchBranch;
    });
  }, [expenses, searchTerm, selectedBranch]);

  // Sum total converted to base currency
  const totalBaseExpenses = useMemo(() => {
    return filteredExpenses.reduce((acc, exp) => {
      const multiplier = 1 / (exp.exchangeRate || 1);
      return acc + (exp.amount * multiplier);
    }, 0);
  }, [filteredExpenses]);

  const activeRateObj = useMemo(() => {
    return exchangeRates.find(r => r.code === currency) || { rate: 1 };
  }, [exchangeRates, currency]);

  const handleSaveExpense = () => {
    if (!title || amount <= 0) {
      alert('الرجاء إدخال عنوان ومبلغ صالح للمصروف');
      return;
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      title,
      category,
      amount,
      currency,
      exchangeRate: activeRateObj.rate,
      date: new Date().toISOString(),
      branchId,
      description,
      paymentMethod
    };

    onAddExpense(newExpense);
    setShowModal(false);

    // Reset Form
    setTitle('');
    setAmount(0);
    setDescription('');
  };

  const formatCurrency = (val: number, currCode?: string) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: currCode || settings.baseCurrency }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Title & Stats Grid */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b-[1.5px] border-[#1A1A1A] pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-[#1A1A1A] uppercase tracking-tighter leading-none mb-2 italic">إدارة ومتابعة المصروفات التشغيلية</h1>
          <p className="text-xs uppercase tracking-widest font-sans font-bold text-[#1A1A1A]/60">رصد النفقات، الإيجارات، فواتير الخدمات وتحويل العملات</p>
        </div>

        <button
          id="add-expense-btn"
          onClick={() => setShowModal(true)}
          className="bg-[#1A1A1A] hover:bg-[#F9F7F2] hover:text-[#1A1A1A] border-[1.5px] border-[#1A1A1A] text-[#F9F7F2] text-xs font-bold px-4 py-2.5 rounded-none flex items-center gap-2 transition duration-150 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل سند صرف ومصروف</span>
        </button>
      </div>

      {/* Stats and Filter Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border-[1.5px] border-[#1A1A1A] p-6 rounded-none flex items-center justify-between sm:col-span-2">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-sans font-extrabold text-[#1A1A1A]/60 tracking-wider">إجمالي النفقات للمصروفات المختارة</span>
            <h4 className="text-3xl font-serif font-extrabold text-[#8C2D19]">{formatCurrency(totalBaseExpenses)}</h4>
            <p className="text-[10px] text-[#1A1A1A]/50 italic">محسوبة بالعملة الأساسية للمؤسسة ر.س</p>
          </div>
          <div className="w-12 h-12 border border-[#8C2D19] bg-rose-50 text-[#8C2D19] flex items-center justify-center rounded-none font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border-[1.5px] border-[#1A1A1A] p-6 rounded-none space-y-2 flex flex-col justify-center">
          <span className="text-xs uppercase tracking-wider font-sans font-extrabold text-[#1A1A1A]/60">فلترة فروع الصرف:</span>
          <select
            id="expense-branch-filter"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full bg-white border border-[#1A1A1A] text-[#1A1A1A] text-xs font-bold rounded-none px-3 py-2.5 focus:outline-none"
          >
            <option value="all">كل الفروع</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table list */}
      <div className="bg-white border-[1.5px] border-[#1A1A1A] rounded-none shadow-none overflow-hidden">
        <div className="p-5 border-b border-[#1A1A1A]/10">
          <div className="relative max-w-md">
            <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-[#1A1A1A]/50" />
            <input
              id="expense-search"
              type="text"
              placeholder="البحث بعنوان النفقة، سند الصرف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-[1.5px] border-[#1A1A1A] text-xs rounded-none pr-10 pl-4 py-2.5 focus:outline-none focus:bg-[#F9F7F2] font-sans font-bold"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-[#F9F7F2] text-[#1A1A1A] border-b-[1.5px] border-[#1A1A1A] font-extrabold">
                <th className="p-4">عنوان المصروف</th>
                <th className="p-4">التصنيف</th>
                <th className="p-4">تاريخ السند</th>
                <th className="p-4">الفرع المسجل عليه</th>
                <th className="p-4">طريقة الصرف</th>
                <th className="p-4 text-center">المبلغ الفعلي المدفوع</th>
                <th className="p-4 text-left">المكافئ المالي بـ {settings.baseCurrency}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/10">
              {filteredExpenses.map((exp) => {
                const branchObj = branches.find(b => b.id === exp.branchId);
                const multiplier = 1 / (exp.exchangeRate || 1);
                const baseAmount = exp.amount * multiplier;

                return (
                  <tr key={exp.id} className="hover:bg-[#F9F7F2]/40 transition duration-150">
                    <td className="p-4">
                      <div className="font-bold text-[#1A1A1A] text-sm">{exp.title}</div>
                      {exp.description && <p className="text-[10px] text-[#1A1A1A]/60 mt-0.5 truncate max-w-[200px] italic">{exp.description}</p>}
                    </td>
                    <td className="p-4">
                      <span className="border border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A] px-2.5 py-1 text-[10px] font-extrabold rounded-none">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-4 text-[#1A1A1A]/70 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#1A1A1A]/60" />
                        <span>{new Date(exp.date).toLocaleDateString('ar-EG')}</span>
                      </div>
                    </td>
                    <td className="p-4 text-[#1A1A1A] font-bold truncate max-w-[120px]">{branchObj?.name || 'الفرع الرئيسي'}</td>
                    <td className="p-4">
                      <span className="border border-[#1A1A1A]/20 bg-white text-[#1A1A1A]/80 px-2.5 py-1 text-[10px] font-extrabold rounded-none">
                        {exp.paymentMethod === 'CASH' ? 'كاش نقدي' : exp.paymentMethod === 'CARD' ? 'شبكة مدى' : 'تحويل بنكي'}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold font-mono text-[#1A1A1A]">
                      {formatCurrency(exp.amount, exp.currency)}
                    </td>
                    <td className="p-4 text-left font-bold text-[#8C2D19] font-mono">
                      {formatCurrency(baseAmount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="font-bold text-gray-900 text-base">تسجيل سند صرف نفقات جديد</h3>
              <button
                id="close-expense-modal"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-900 transition text-lg"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">عنوان المصروف (شرح مقتضب):</label>
                <input
                  id="expense-title-input"
                  type="text"
                  placeholder="مثال: شراء أوراق طابعات الفواتير وملحقاتها"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">تصنيف المصروف:</label>
                  <select
                    id="expense-cat-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-2.5 py-2.5 focus:outline-none"
                  >
                    <option value="إيجارات">إيجارات ومعارض</option>
                    <option value="مرافق عامة">كهرباء ومياه ومرافق</option>
                    <option value="قرطاسية وضيافة">قرطاسية، طباعة وضيافة</option>
                    <option value="برمجيات واتصالات">اشتراكات برامج وإنترنت</option>
                    <option value="رواتب وأجور">أجور ورواتب مؤقتة</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">وسيلة الصرف المالية:</label>
                  <select
                    id="expense-method-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-2.5 py-2.5 focus:outline-none"
                  >
                    <option value="CASH">صندوق الكاش (الصندوق)</option>
                    <option value="CARD">شبكة المحل (بطاقة مدى)</option>
                    <option value="BANK_TRANSFER">حساب التحويل الرئيسي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">المبلغ الفعلي للصرف:</label>
                  <input
                    id="expense-amount-input"
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none font-sans font-bold text-rose-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">عملة السداد والصرف:</label>
                  <select
                    id="expense-curr-select"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-2.5 py-2.5 focus:outline-none"
                  >
                    {exchangeRates.map(r => (
                      <option key={r.code} value={r.code}>{r.code} ({r.symbol})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">يسجل على الفرع:</label>
                <select
                  id="expense-branch-select"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-2.5 py-2.5 focus:outline-none"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">ملاحظات أو شرح إضافي:</label>
                <textarea
                  id="expense-desc-input"
                  placeholder="مثال: فاتورة ضريبية مرفقة لشراء علب حبر لفرع جدة"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-2xl">
              <button
                id="cancel-expense"
                onClick={() => setShowModal(false)}
                className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl"
              >
                إلغاء
              </button>
              <button
                id="save-expense-btn"
                onClick={handleSaveExpense}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
              >
                تأكيد وقيد المصروف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
