import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Percent, 
  FileText, 
  Download, 
  Upload, 
  Check, 
  Globe, 
  Plus, 
  Trash2,
  Warehouse,
  Coins
} from 'lucide-react';
import { 
  SystemSettings, 
  ExchangeRate, 
  Branch, 
  Warehouse as WarehouseType 
} from '../types';

interface SettingsManagerProps {
  settings: SystemSettings;
  exchangeRates: ExchangeRate[];
  branches: Branch[];
  warehouses: WarehouseType[];
  onSaveSettings: (settings: SystemSettings) => void;
  onUpdateRates: (rates: ExchangeRate[]) => void;
  onAddBranch: (branch: Branch) => void;
  onAddWarehouse: (warehouse: WarehouseType) => void;
  onBackupExport: () => void;
  onBackupImport: (importedData: any) => void;
}

export default function SettingsManager({
  settings,
  exchangeRates,
  branches,
  warehouses,
  onSaveSettings,
  onUpdateRates,
  onAddBranch,
  onAddWarehouse,
  onBackupExport,
  onBackupImport
}: SettingsManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'GENERAL' | 'CURRENCIES' | 'BRANCHES' | 'BACKUP'>('GENERAL');
  
  // General settings state
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [companyPhone, setCompanyPhone] = useState(settings.companyPhone);
  const [companyAddress, setCompanyAddress] = useState(settings.companyAddress);
  const [vatNumber, setVatNumber] = useState(settings.vatNumber);
  const [vatPercent, setVatPercent] = useState(settings.vatPercent);

  // New currency state
  const [newCurrCode, setNewCurrCode] = useState('');
  const [newCurrSymbol, setNewCurrSymbol] = useState('');
  const [newCurrRate, setNewCurrRate] = useState(1);

  // New branch state
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddr, setNewBranchAddr] = useState('');
  const [newBranchPhone, setNewBranchPhone] = useState('');

  // New Warehouse state
  const [newWhName, setNewWhName] = useState('');
  const [newWhBranchId, setNewWhBranchId] = useState(branches[0]?.id || '');
  const [newWhLoc, setNewWhLoc] = useState('');

  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveGeneral = () => {
    onSaveSettings({
      companyName,
      companyPhone,
      companyAddress,
      vatNumber,
      baseCurrency: settings.baseCurrency,
      themeColor: settings.themeColor,
      vatPercent
    });
    alert('تم حفظ إعدادات المنشأة العامة بنجاح!');
  };

  const handleAddCurrency = () => {
    if (!newCurrCode || !newCurrSymbol) return;
    const updated = [
      ...exchangeRates,
      { code: newCurrCode.toUpperCase(), symbol: newCurrSymbol, rate: newCurrRate, isBase: false }
    ];
    onUpdateRates(updated);
    setNewCurrCode('');
    setNewCurrSymbol('');
    setNewCurrRate(1);
  };

  const handleAddBranchLocal = () => {
    if (!newBranchName) return;
    onAddBranch({
      id: `b-${Date.now()}`,
      name: newBranchName,
      address: newBranchAddr,
      phone: newBranchPhone
    });
    setNewBranchName('');
    setNewBranchAddr('');
    setNewBranchPhone('');
  };

  const handleAddWhLocal = () => {
    if (!newWhName) return;
    onAddWarehouse({
      id: `w-${Date.now()}`,
      name: newWhName,
      branchId: newWhBranchId,
      location: newWhLoc
    });
    setNewWhName('');
    setNewWhLoc('');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (files && files.length > 0) {
      fileReader.readAsText(files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.settings && parsed.invoices) {
            onBackupImport(parsed);
            setImportStatus('تم استيراد قاعدة البيانات بنجاح تام ومزامنة المستندات!');
            setTimeout(() => setImportStatus(null), 4000);
          } else {
            setImportStatus('الملف المختار غير صالح لتنسيق النظام!');
          }
        } catch (err) {
          setImportStatus('فشلت قراءة الملف؛ تأكد من رفع ملف JSON حقيقي');
        }
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b-[1.5px] border-[#1A1A1A] pb-6">
        <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-[#1A1A1A] uppercase tracking-tighter leading-none mb-2 italic">الإعدادات وإدارة قواعد البيانات</h1>
        <p className="text-xs uppercase tracking-widest font-sans font-bold text-[#1A1A1A]/60">تحديث الملف الضريبي، العملات، الفروع والمستودعات والنسخ الاحتياطي</p>
      </div>

      {/* Grid Layout (Vertical Sub-tabs on the left, Content on the right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sub-tabs Side list */}
        <div className="bg-white border-[1.5px] border-[#1A1A1A] rounded-none p-4 space-y-1 self-start">
          <button
            id="subtab-general"
            onClick={() => setActiveSubTab('GENERAL')}
            className={`w-full text-right px-4 py-2.5 rounded-none text-xs font-extrabold flex items-center gap-2 transition ${
              activeSubTab === 'GENERAL' ? 'bg-[#1A1A1A] text-[#F9F7F2]' : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>بيانات المنشأة والضريبة</span>
          </button>
          
          <button
            id="subtab-currencies"
            onClick={() => setActiveSubTab('CURRENCIES')}
            className={`w-full text-right px-4 py-2.5 rounded-none text-xs font-extrabold flex items-center gap-2 transition ${
              activeSubTab === 'CURRENCIES' ? 'bg-[#1A1A1A] text-[#F9F7F2]' : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>العملات وأسعار الصرف</span>
          </button>

          <button
            id="subtab-branches"
            onClick={() => setActiveSubTab('BRANCHES')}
            className={`w-full text-right px-4 py-2.5 rounded-none text-xs font-extrabold flex items-center gap-2 transition ${
              activeSubTab === 'BRANCHES' ? 'bg-[#1A1A1A] text-[#F9F7F2]' : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
            }`}
          >
            <Warehouse className="w-4 h-4" />
            <span>إدارة الفروع والمستودعات</span>
          </button>

          <button
            id="subtab-backup"
            onClick={() => setActiveSubTab('BACKUP')}
            className={`w-full text-right px-4 py-2.5 rounded-none text-xs font-extrabold flex items-center gap-2 transition ${
              activeSubTab === 'BACKUP' ? 'bg-[#1A1A1A] text-[#F9F7F2]' : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>النسخ الاحتياطي والاستعادة</span>
          </button>
        </div>

        {/* Right Content Panel */}
        <div className="lg:col-span-3 bg-white border-[1.5px] border-[#1A1A1A] rounded-none p-6 shadow-none">
          {/* TAB 1: General Company Info */}
          {activeSubTab === 'GENERAL' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-[#1A1A1A] border-b border-[#1A1A1A]/10 pb-2">بيانات الملف التعريفي الضريبي للمؤسسة</h3>
                <p className="text-[11px] text-[#1A1A1A]/60 mt-1 leading-relaxed italic">تنعكس هذه البيانات تلقائياً على ترويسة الفواتير الحرارية والرمز الضريبي QR متطلبات هيئة الزكاة والجمارك.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider font-sans font-extrabold text-[#1A1A1A]/70">الاسم القانوني للشركة / المحل التجاري:</label>
                  <input
                    id="settings-company-name"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-transparent border border-[#1A1A1A] text-xs rounded-none px-3 py-2.5 focus:outline-none focus:bg-[#F9F7F2] font-sans font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider font-sans font-extrabold text-[#1A1A1A]/70">رقم الهاتف الرسمي للتواصل:</label>
                  <input
                    id="settings-company-phone"
                    type="text"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    className="w-full bg-transparent border border-[#1A1A1A] text-xs rounded-none px-3 py-2.5 focus:outline-none focus:bg-[#F9F7F2] font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider font-sans font-extrabold text-[#1A1A1A]/70">العنوان الجغرافي الرئيسي والموقع:</label>
                <input
                  id="settings-company-address"
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="w-full bg-transparent border border-[#1A1A1A] text-xs rounded-none px-3 py-2.5 focus:outline-none focus:bg-[#F9F7F2] font-sans font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider font-sans font-extrabold text-[#1A1A1A]/70">الرقم الضريبي الموحد (15 رقم):</label>
                  <input
                    id="settings-company-vat"
                    type="text"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    className="w-full bg-transparent border border-[#1A1A1A] text-xs rounded-none px-3 py-2.5 focus:outline-none focus:bg-[#F9F7F2] font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider font-sans font-extrabold text-[#1A1A1A]/70">نسبة ضريبة القيمة المضافة (%) :</label>
                  <input
                    id="settings-company-vat-percent"
                    type="number"
                    value={vatPercent}
                    onChange={(e) => setVatPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent border border-[#1A1A1A] text-xs rounded-none px-3 py-2.5 focus:outline-none focus:bg-[#F9F7F2] font-sans font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  id="save-general-settings"
                  onClick={handleSaveGeneral}
                  className="bg-[#1A1A1A] hover:bg-[#F9F7F2] hover:text-[#1A1A1A] border-[1.5px] border-[#1A1A1A] text-[#F9F7F2] text-xs font-bold px-5 py-2.5 rounded-none transition duration-150"
                >
                  حفظ البيانات المعتمدة
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Currency Settings */}
          {activeSubTab === 'CURRENCIES' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-[#1A1A1A] border-b border-[#1A1A1A]/10 pb-2">سعر الصرف والعملات المتعددة</h3>
                <p className="text-[11px] text-[#1A1A1A]/70 mt-1 leading-relaxed italic">العملة الأساسية للنظام هي <span className="font-bold text-[#1A1A1A]">{settings.baseCurrency}</span>. يمكنك ربط وتحديد أسعار صرف العملات الأجنبية الأخرى ليقوم المحاسب بإصدار الفواتير وقيد المصروفات بها مباشرة.</p>
              </div>

              {/* Currencies table list */}
              <div className="border border-[#1A1A1A] rounded-none overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#F9F7F2] font-extrabold text-[#1A1A1A] border-b-[1.5px] border-[#1A1A1A]">
                    <tr>
                      <th className="p-3">رمز العملة (ISO)</th>
                      <th className="p-3">الرمز</th>
                      <th className="p-3 text-center">سعر الصرف (مكافئ العملة الأساسية)</th>
                      <th className="p-3 text-left">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A1A]/10">
                    {exchangeRates.map((r) => (
                      <tr key={r.code} className="hover:bg-[#F9F7F2]/40 transition duration-100">
                        <td className="p-3 font-mono font-bold text-[#1A1A1A]">{r.code}</td>
                        <td className="p-3 font-mono font-bold text-[#1A1A1A]">{r.symbol}</td>
                        <td className="p-3 text-center font-mono font-bold">
                          {r.isBase ? '1.000 (أساسي)' : r.rate.toFixed(4)}
                        </td>
                        <td className="p-3 text-left text-[#1A1A1A]/60 italic font-serif">
                          {r.isBase ? 'تعتمد دفاتر المحاسبة والتقارير المالية والذمم على هذه العملة بشكل رئيسي' : `1 ${r.code} = ${r.rate} ${settings.baseCurrency}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Currency Form block */}
              <div className="bg-[#F9F7F2]/30 p-5 rounded-none border border-[#1A1A1A] space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-sans font-extrabold text-[#1A1A1A]">ربط عملة أجنبية جديدة</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-sans font-extrabold text-[#1A1A1A]/60">رمز العملة (مثل USD):</label>
                    <input
                      id="curr-code-input"
                      type="text"
                      placeholder="USD"
                      value={newCurrCode}
                      onChange={(e) => setNewCurrCode(e.target.value)}
                      className="w-full bg-white border border-[#1A1A1A] text-xs rounded-none px-3 py-2 focus:outline-none font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-sans font-extrabold text-[#1A1A1A]/60">الرمز البصري (مثل $):</label>
                    <input
                      id="curr-symbol-input"
                      type="text"
                      placeholder="$"
                      value={newCurrSymbol}
                      onChange={(e) => setNewCurrSymbol(e.target.value)}
                      className="w-full bg-white border border-[#1A1A1A] text-xs rounded-none px-3 py-2 focus:outline-none font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-sans font-extrabold text-[#1A1A1A]/60">قيمة الصرف بـ {settings.baseCurrency}:</label>
                    <input
                      id="curr-rate-input"
                      type="number"
                      step="0.0001"
                      value={newCurrRate}
                      onChange={(e) => setNewCurrRate(parseFloat(e.target.value) || 1)}
                      className="w-full bg-white border border-[#1A1A1A] text-xs rounded-none px-3 py-2 focus:outline-none font-sans font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    id="add-curr-btn"
                    onClick={handleAddCurrency}
                    className="bg-[#1A1A1A] hover:bg-[#F9F7F2] hover:text-[#1A1A1A] border-[1.5px] border-[#1A1A1A] text-[#F9F7F2] text-xs font-bold px-4 py-2 rounded-none transition duration-150"
                  >
                    أضف العملة الآن
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Branches & Warehouses */}
          {activeSubTab === 'BRANCHES' && (
            <div className="space-y-6">
              {/* Branches Grid */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1A1A1A] border-b border-[#1A1A1A]/10 pb-2">فروع المؤسسة والمنشآت التابعة</h3>
                  <p className="text-[11px] text-[#1A1A1A]/70 mt-1 leading-relaxed italic">تحديد الفروع لتسهيل فلترة الإيرادات والمصروفات الإدارية لكل منفذ بيع مستقل.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {branches.map(b => (
                    <div key={b.id} className="border border-[#1A1A1A] p-4 rounded-none space-y-2 bg-[#F9F7F2]/30">
                      <div className="flex items-center gap-1.5 text-[#1A1A1A] font-extrabold text-xs">
                        <Building2 className="w-4 h-4" />
                        <span>{b.name}</span>
                      </div>
                      <p className="text-xs text-[#1A1A1A]/80 font-serif font-medium">العنوان: {b.address}</p>
                      <p className="text-[10px] text-[#1A1A1A]/60 font-mono">الهاتف: {b.phone}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-[#F9F7F2]/30 p-5 rounded-none border border-[#1A1A1A] space-y-4">
                  <h4 className="text-xs uppercase tracking-wider font-sans font-extrabold text-[#1A1A1A]">إضافة فرع جديد</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      id="branch-name-input"
                      type="text"
                      placeholder="اسم الفرع (مثل فرع الخبر)"
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                      className="w-full bg-white border border-[#1A1A1A] text-xs rounded-none px-3 py-2.5 focus:outline-none font-bold"
                    />
                    <input
                      id="branch-addr-input"
                      type="text"
                      placeholder="العنوان"
                      value={newBranchAddr}
                      onChange={(e) => setNewBranchAddr(e.target.value)}
                      className="w-full bg-white border border-[#1A1A1A] text-xs rounded-none px-3 py-2.5 focus:outline-none font-bold"
                    />
                    <input
                      id="branch-phone-input"
                      type="text"
                      placeholder="رقم الهاتف"
                      value={newBranchPhone}
                      onChange={(e) => setNewBranchPhone(e.target.value)}
                      className="w-full bg-white border border-[#1A1A1A] text-xs rounded-none px-3 py-2.5 focus:outline-none font-mono font-bold"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      id="add-branch-confirm"
                      onClick={handleAddBranchLocal}
                      className="bg-[#1A1A1A] hover:bg-[#F9F7F2] hover:text-[#1A1A1A] border-[1.5px] border-[#1A1A1A] text-[#F9F7F2] text-xs font-bold px-4 py-2 rounded-none transition duration-150"
                    >
                      أضف الفرع
                    </button>
                  </div>
                </div>
              </div>

              {/* Warehouses Grid */}
              <div className="space-y-4 pt-6 border-t border-[#1A1A1A]/10">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1A1A1A] border-b border-[#1A1A1A]/10 pb-2">المستودعات ومخازن توزيع السلع</h3>
                  <p className="text-[11px] text-[#1A1A1A]/70 mt-1 leading-relaxed italic">تتبع مستويات المخزون بدقة في كل مستودع أو صالة عرض مستقلة.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {warehouses.map(w => {
                    const branchObj = branches.find(b => b.id === w.branchId);
                    return (
                      <div key={w.id} className="border border-[#1A1A1A] p-4 rounded-none space-y-2 bg-[#F9F7F2]/30">
                        <div className="flex items-center gap-1.5 text-[#1A1A1A] font-extrabold text-xs">
                          <Warehouse className="w-4 h-4" />
                          <span>{w.name}</span>
                        </div>
                        <p className="text-[11px] text-[#1A1A1A]/80 font-serif font-medium">تابع لفرع: {branchObj?.name || 'الرئيسي'}</p>
                        {w.location && <p className="text-[10px] text-[#1A1A1A]/60 font-mono">الموقع: {w.location}</p>}
                      </div>
                    );
                  })}
                </div>

                <div className="bg-[#F9F7F2]/30 p-5 rounded-none border border-[#1A1A1A] space-y-4">
                  <h4 className="text-xs uppercase tracking-wider font-sans font-extrabold text-[#1A1A1A]">إضافة مستودع / صالة عرض جديد</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      id="wh-name-input"
                      type="text"
                      placeholder="اسم المستودع (مثل مستودع الدمام)"
                      value={newWhName}
                      onChange={(e) => setNewWhName(e.target.value)}
                      className="w-full bg-white border border-[#1A1A1A] text-xs rounded-none px-3 py-2 focus:outline-none font-bold"
                    />
                    <select
                      id="wh-branch-select"
                      value={newWhBranchId}
                      onChange={(e) => setNewWhBranchId(e.target.value)}
                      className="w-full bg-white border border-[#1A1A1A] text-xs rounded-none px-2.5 py-2.5 focus:outline-none font-bold"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                    <input
                      id="wh-loc-input"
                      type="text"
                      placeholder="موقع المستودع أو الرف"
                      value={newWhLoc}
                      onChange={(e) => setNewWhLoc(e.target.value)}
                      className="w-full bg-white border border-[#1A1A1A] text-xs rounded-none px-3 py-2 focus:outline-none font-bold"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      id="add-wh-confirm"
                      onClick={handleAddWhLocal}
                      className="bg-[#1A1A1A] hover:bg-[#F9F7F2] hover:text-[#1A1A1A] border-[1.5px] border-[#1A1A1A] text-[#F9F7F2] text-xs font-bold px-4 py-2 rounded-none transition duration-150"
                    >
                      أضف المستودع
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Database Backup and Restore */}
          {activeSubTab === 'BACKUP' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-[#1A1A1A] border-b border-[#1A1A1A]/10 pb-2">محرك النسخ الاحتياطي المحلي واستعادة النظام (JSON)</h3>
                <p className="text-[11px] text-[#1A1A1A]/70 mt-1 leading-relaxed italic">
                  بما أن النظام يدعم وضع عدم الاتصال (Offline Mode)، يمكنك تحميل وتصدير كامل قاعدة بيانات التطبيق (بما في ذلك الفواتير، المبيعات، الشركاء، النفقات، وإعدادات الضريبة والعملات) في ملف مشفر واحد لحفظه محلياً أو رفعه في أي وقت لاستعادة بياناتك على جهاز آخر!
                </p>
              </div>

              {importStatus && (
                <div id="import-status-box" className="bg-emerald-50 text-emerald-950 border border-emerald-800 p-4 rounded-none text-xs flex items-center gap-2 font-bold animate-pulse">
                  <Check className="w-5 h-5 text-emerald-700" />
                  <span>{importStatus}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Export Card */}
                <div className="border border-[#1A1A1A] rounded-none p-5 bg-[#F9F7F2]/30 flex flex-col justify-between space-y-4 hover:bg-[#F9F7F2]/50 transition duration-100">
                  <div className="space-y-1.5">
                    <h4 className="text-xs uppercase tracking-wider font-sans font-extrabold text-[#1A1A1A] flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-[#1A1A1A]" />
                      <span>تصدير نسخة احتياطية كاملة (.json)</span>
                    </h4>
                    <p className="text-[11px] text-[#1A1A1A]/70 leading-relaxed font-serif">توليد ملف مشفر بصيغة JSON يحتوي على كامل هيكل البيانات الحالي للشركة.</p>
                  </div>
                  <button
                    id="trigger-export-backup"
                    onClick={onBackupExport}
                    className="w-full bg-[#1A1A1A] hover:bg-[#F9F7F2] hover:text-[#1A1A1A] border-[1.5px] border-[#1A1A1A] text-[#F9F7F2] text-xs font-bold py-2.5 rounded-none flex items-center justify-center gap-2 transition duration-150"
                  >
                    <Download className="w-4 h-4" />
                    <span>تنزيل ملف النسخة الاحتياطية</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="border border-[#1A1A1A] rounded-none p-5 bg-[#F9F7F2]/30 flex flex-col justify-between space-y-4 hover:bg-[#F9F7F2]/50 transition duration-100">
                  <div className="space-y-1.5">
                    <h4 className="text-xs uppercase tracking-wider font-sans font-extrabold text-[#1A1A1A] flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-[#1A1A1A]" />
                      <span>استعادة نسخة احتياطية سابقة</span>
                    </h4>
                    <p className="text-[11px] text-[#1A1A1A]/70 leading-relaxed font-serif">رفع ملف نسخة احتياطية تم تنزيله مسبقاً لاستبدال واستعادة كافة الحسابات والبيانات.</p>
                  </div>
                  <div className="relative">
                    <input
                      id="import-backup-file"
                      type="file"
                      accept=".json"
                      onChange={handleImportFile}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="w-full bg-white hover:bg-[#1A1A1A] hover:text-[#F9F7F2] border-[1.5px] border-[#1A1A1A] text-[#1A1A1A] text-xs font-bold py-2.5 rounded-none flex items-center justify-center gap-2 transition cursor-pointer text-center">
                      <Upload className="w-4 h-4" />
                      <span>اختر الملف واستعد الآن</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Offline Integrity Note */}
              <div className="bg-[#F9F7F2] text-[#1A1A1A]/80 p-4 rounded-none border border-[#1A1A1A]/20 text-[11px] leading-relaxed">
                <strong>💡 تنويه بخصوص المزامنة الفورية:</strong> يتم المزامنة تلقائياً مع محرك التخزين المحلي (Local Storage/IndexedDB) لضمان عدم ضياع أي فاتورة عند غياب الاتصال بالإنترنت، ويمكن للمشرف تصدير الملف أعلاه دورياً للسلامة الأمنية التامة متطابقاً مع توصيات المراجعة الداخلية.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
