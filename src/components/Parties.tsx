import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Phone, 
  Mail, 
  MapPin, 
  Hash, 
  User, 
  Building2, 
  Scale 
} from 'lucide-react';
import { Customer, Supplier, SystemSettings } from '../types';

interface PartiesProps {
  customers: Customer[];
  suppliers: Supplier[];
  settings: SystemSettings;
  onAddCustomer: (customer: Customer) => void;
  onAddSupplier: (supplier: Supplier) => void;
}

export default function Parties({
  customers,
  suppliers,
  settings,
  onAddCustomer,
  onAddSupplier
}: PartiesProps) {
  const [activeTab, setActiveTab] = useState<'CUSTOMERS' | 'SUPPLIERS'>('CUSTOMERS');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(0);

  // Filtering list
  const filteredList = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (activeTab === 'CUSTOMERS') {
      return customers.filter(c => 
        c.name.toLowerCase().includes(term) || 
        c.phone.includes(term) || 
        (c.vatNumber && c.vatNumber.includes(term))
      );
    } else {
      return suppliers.filter(s => 
        s.name.toLowerCase().includes(term) || 
        s.phone.includes(term) || 
        (s.vatNumber && s.vatNumber.includes(term))
      );
    }
  }, [activeTab, customers, suppliers, searchTerm]);

  const handleOpenModal = () => {
    setName('');
    setPhone('');
    setEmail('');
    setVatNumber('');
    setAddress('');
    setBalance(0);
    setShowModal(true);
  };

  const handleSaveParty = () => {
    if (!name || !phone) {
      alert('الرجاء إدخال الاسم ورقم الهاتف بدقة');
      return;
    }

    if (activeTab === 'CUSTOMERS') {
      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        name,
        phone,
        email,
        vatNumber,
        address,
        balance,
        createdAt: new Date().toISOString()
      };
      onAddCustomer(newCustomer);
    } else {
      const newSupplier: Supplier = {
        id: `supp-${Date.now()}`,
        name,
        phone,
        email,
        vatNumber,
        address,
        balance,
        createdAt: new Date().toISOString()
      };
      onAddSupplier(newSupplier);
    }

    setShowModal(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: settings.baseCurrency }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Title & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b-[1.5px] border-[#1A1A1A] pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-[#1A1A1A] uppercase tracking-tighter leading-none mb-2 italic">إدارة الشركاء والجهات المتعاملة</h1>
          <p className="text-xs uppercase tracking-widest font-sans font-bold text-[#1A1A1A]/60">تحديث سجلات العملاء، الموردين، الأرقام الضريبية، وحالة المديونية والذمم</p>
        </div>

        <button
          id="add-party-btn"
          onClick={handleOpenModal}
          className="bg-[#1A1A1A] hover:bg-[#F9F7F2] hover:text-[#1A1A1A] border-[1.5px] border-[#1A1A1A] text-[#F9F7F2] text-xs font-bold px-4 py-2.5 rounded-none flex items-center gap-2 transition duration-150 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{activeTab === 'CUSTOMERS' ? 'إضافة عميل جديد' : 'إضافة مورد جديد'}</span>
        </button>
      </div>

      {/* Tabs Switcher Card */}
      <div className="bg-white border-[1.5px] border-[#1A1A1A] rounded-none shadow-none overflow-hidden">
        <div className="flex border-b border-[#1A1A1A] p-1 bg-[#F9F7F2]/30">
          <button
            id="tab-customers"
            onClick={() => { setActiveTab('CUSTOMERS'); setSearchTerm(''); }}
            className={`flex-1 text-center py-2.5 rounded-none text-xs font-extrabold transition flex items-center justify-center gap-2 ${
              activeTab === 'CUSTOMERS' ? 'bg-[#1A1A1A] text-[#F9F7F2]' : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
            }`}
          >
            <User className="w-4 h-4" />
            <span>العملاء (ذمم مدينة)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-none font-bold border ${activeTab === 'CUSTOMERS' ? 'bg-white text-[#1A1A1A] border-white' : 'bg-transparent text-[#1A1A1A] border-[#1A1A1A]'}`}>{customers.length}</span>
          </button>
          
          <button
            id="tab-suppliers"
            onClick={() => { setActiveTab('SUPPLIERS'); setSearchTerm(''); }}
            className={`flex-1 text-center py-2.5 rounded-none text-xs font-extrabold border-r border-[#1A1A1A] transition flex items-center justify-center gap-2 ${
              activeTab === 'SUPPLIERS' ? 'bg-[#1A1A1A] text-[#F9F7F2]' : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>الموردون (ذمم دائنة)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-none font-bold border ${activeTab === 'SUPPLIERS' ? 'bg-white text-[#1A1A1A] border-white' : 'bg-transparent text-[#1A1A1A] border-[#1A1A1A]'}`}>{suppliers.length}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-5 border-b border-[#1A1A1A]/10">
          <div className="relative max-w-md">
            <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-[#1A1A1A]/50" />
            <input
              id="party-search"
              type="text"
              placeholder={activeTab === 'CUSTOMERS' ? "البحث باسم العميل، الهاتف، الرقم الضريبي..." : "البحث باسم المورد، الهاتف، الرقم الضريبي..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-[1.5px] border-[#1A1A1A] text-xs rounded-none pr-10 pl-4 py-2.5 focus:outline-none focus:bg-[#F9F7F2] font-sans font-bold"
            />
          </div>
        </div>

        {/* Partners Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-[#F9F7F2] text-[#1A1A1A] border-b-[1.5px] border-[#1A1A1A] font-extrabold">
                <th className="p-4">اسم الشريك التجاري</th>
                <th className="p-4">رقم الهاتف</th>
                <th className="p-4">البريد الإلكتروني</th>
                <th className="p-4">الرقم الضريبي (VAT)</th>
                <th className="p-4">العنوان والمدينة</th>
                <th className="p-4 text-left">الرصيد المحاسبي المتبقي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/10">
              {filteredList.map((p) => (
                <tr key={p.id} className="hover:bg-[#F9F7F2]/40 transition duration-150">
                  <td className="p-4 font-bold text-[#1A1A1A] flex items-center gap-3 py-5">
                    <div className="w-8 h-8 rounded-none border border-[#1A1A1A] bg-[#1A1A1A] text-[#F9F7F2] flex items-center justify-center font-bold text-xs">
                      {p.name.charAt(0)}
                    </div>
                    <span>{p.name}</span>
                  </td>
                  <td className="p-4 text-[#1A1A1A]/90 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#1A1A1A]/60" />
                      <span className="font-bold">{p.phone}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[#1A1A1A]/70 font-mono">
                    {p.email ? (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#1A1A1A]/60" />
                        <span>{p.email}</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="p-4 text-[#1A1A1A]/80 font-bold font-mono">
                    {p.vatNumber ? (
                      <div className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-[#1A1A1A]/60" />
                        <span>{p.vatNumber}</span>
                      </div>
                    ) : (
                      <span className="text-[#1A1A1A]/40 text-[10px] font-medium font-sans">غير مسجل ضريبياً</span>
                    )}
                  </td>
                  <td className="p-4 text-[#1A1A1A]/70 font-medium">
                    {p.address ? (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#1A1A1A]/60" />
                        <span>{p.address}</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="p-4 text-left font-bold font-mono">
                    <span className={`px-2 py-0.5 rounded-none text-xs border ${
                      p.balance > 0 
                        ? (activeTab === 'CUSTOMERS' ? 'bg-emerald-50 text-emerald-950 border-emerald-800' : 'bg-rose-50 text-rose-950 border-rose-800')
                        : 'bg-white text-[#1A1A1A]/50 border-[#1A1A1A]/10'
                    }`}>
                      {formatCurrency(p.balance)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partners Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="font-bold text-gray-900 text-base">
                {activeTab === 'CUSTOMERS' ? 'إضافة عميل تجاري جديد' : 'إضافة مورد معتمد جديد'}
              </h3>
              <button
                id="close-party-modal"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-900 transition text-lg"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">اسم الجهة أو الشريك:</label>
                <input
                  id="party-name-input"
                  type="text"
                  placeholder="مثال: شركة الرشيد للمقاولات المحدودة"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">رقم الهاتف النشط:</label>
                  <input
                    id="party-phone-input"
                    type="text"
                    placeholder="05xxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">الرقم الضريبي الموحد (VAT):</label>
                  <input
                    id="party-vat-input"
                    type="text"
                    placeholder="15 خانة تبدأ بـ 3"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">البريد الإلكتروني للجهة:</label>
                <input
                  id="party-email-input"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">العنوان الجغرافي بالتفصيل:</label>
                <input
                  id="party-address-input"
                  type="text"
                  placeholder="الحي، اسم الشارع، المدينة، الرمز البريدي"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">الرصيد الافتتاحي (الذمة المالية البدئية):</label>
                <input
                  id="party-balance-input"
                  type="number"
                  placeholder="0.00"
                  value={balance}
                  onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none font-sans"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-2xl">
              <button
                id="cancel-party"
                onClick={() => setShowModal(false)}
                className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl"
              >
                إلغاء
              </button>
              <button
                id="save-party-btn"
                onClick={handleSaveParty}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
              >
                إدراج الشريك ومزامنته
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
