import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Package, 
  Layers, 
  Warehouse, 
  Barcode, 
  AlertTriangle 
} from 'lucide-react';
import { Product, Category, SystemSettings } from '../types';

interface ProductsProps {
  products: Product[];
  categories: Category[];
  settings: SystemSettings;
  onAddProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onAddCategory: (category: Category) => void;
}

export default function Products({
  products,
  categories,
  settings,
  onAddProduct,
  onEditProduct,
  onAddCategory
}: ProductsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State for Product
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState(0);
  const [cost, setCost] = useState(0);
  const [unit, setUnit] = useState('حبة');
  const [description, setDescription] = useState('');
  const [initialStockMain, setInitialStockMain] = useState(0);

  // Form State for Category
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Filtering list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setName('');
    setSku(`69${Math.floor(10000000000 + Math.random() * 90000000000)}`); // Generate random elegant GS1 style barcode
    setCategoryId(categories[0]?.id || '');
    setPrice(0);
    setCost(0);
    setUnit('حبة');
    setDescription('');
    setInitialStockMain(10);
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setSku(prod.sku);
    setCategoryId(prod.categoryId);
    setPrice(prod.price);
    setCost(prod.cost);
    setUnit(prod.unit);
    setDescription(prod.description || '');
    setShowProductModal(true);
  };

  const handleSaveProduct = () => {
    if (!name || !sku) {
      alert('الرجاء إدخال اسم الصنف والباركود بدقة');
      return;
    }

    if (editingProduct) {
      // Edit mode
      const updatedProduct: Product = {
        ...editingProduct,
        name,
        sku,
        categoryId,
        price,
        cost,
        description,
        unit
      };
      onEditProduct(updatedProduct);
    } else {
      // Create mode
      const newProduct: Product = {
        id: `p-${Date.now()}`,
        name,
        sku,
        categoryId,
        price,
        cost,
        vatRate: settings.vatPercent,
        unit,
        description,
        warehouseStocks: { 'w-1': initialStockMain, 'w-2': 0, 'w-3': 0 },
        createdAt: new Date().toISOString()
      };
      onAddProduct(newProduct);
    }

    setShowProductModal(false);
  };

  const handleSaveCategory = () => {
    if (!catName) return;
    const newCategory: Category = {
      id: `c-${Date.now()}`,
      name: catName,
      description: catDesc
    };
    onAddCategory(newCategory);
    setCatName('');
    setCatDesc('');
    setShowCategoryModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b-[1.5px] border-[#1A1A1A] pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-[#1A1A1A] uppercase tracking-tighter leading-none mb-2 italic">إدارة المنتجات والمخزون المجمع</h1>
          <p className="text-xs uppercase tracking-widest font-sans font-bold text-[#1A1A1A]/60">مراقبة مستويات المستودعات، الباركودات، وحساب تكلفة البضاعة المبيعة</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            id="open-category-modal"
            onClick={() => setShowCategoryModal(true)}
            className="bg-white border-[1.5px] border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F9F7F2] text-[#1A1A1A] text-xs font-bold px-4 py-2.5 rounded-none flex items-center gap-2 transition duration-150"
          >
            <Layers className="w-4 h-4" />
            <span>إضافة تصنيف جديد</span>
          </button>
          
          <button
            id="open-product-modal"
            onClick={handleOpenCreateProduct}
            className="bg-[#1A1A1A] hover:bg-[#F9F7F2] hover:text-[#1A1A1A] border-[1.5px] border-[#1A1A1A] text-[#F9F7F2] text-xs font-bold px-4 py-2.5 rounded-none flex items-center gap-2 transition duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة صنف مخزني</span>
          </button>
        </div>
      </div>

      {/* Analytics Mini-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border-[1.5px] border-[#1A1A1A] p-6 rounded-none flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-sans font-extrabold text-[#1A1A1A]/60 tracking-wider">إجمالي الأنواع المسجلة</span>
            <h4 className="text-2xl font-serif font-bold text-[#1A1A1A]">{products.length} أصناف فريدة</h4>
          </div>
          <div className="w-10 h-10 border border-[#1A1A1A] bg-[#1A1A1A] text-[#F9F7F2] flex items-center justify-center rounded-none font-bold">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border-[1.5px] border-[#1A1A1A] p-6 rounded-none flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-sans font-extrabold text-[#1A1A1A]/60 tracking-wider">إجمالي قطع البضاعة</span>
            <h4 className="text-2xl font-serif font-bold text-[#1A1A1A]">
              {products.reduce((acc: number, p) => acc + (Object.values(p.warehouseStocks) as number[]).reduce((sum: number, q: number) => sum + q, 0), 0)} وحدة مخزنية
            </h4>
          </div>
          <div className="w-10 h-10 border border-[#1A1A1A] bg-white text-[#1A1A1A] flex items-center justify-center rounded-none font-bold">
            <Warehouse className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border-[1.5px] border-[#1A1A1A] p-6 rounded-none flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-sans font-extrabold text-[#1A1A1A]/60 tracking-wider">أصناف شارفت على النفاد</span>
            <h4 className="text-2xl font-serif font-bold text-[#8C2D19]">
              {products.filter(p => (Object.values(p.warehouseStocks) as number[]).reduce((sum: number, q: number) => sum + q, 0) <= 5).length} منتجات مهددة
            </h4>
          </div>
          <div className="w-10 h-10 border border-[#8C2D19] bg-rose-50 text-[#8C2D19] flex items-center justify-center rounded-none font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Product Table Card */}
      <div className="bg-white border-[1.5px] border-[#1A1A1A] rounded-none shadow-none overflow-hidden">
        <div className="p-5 border-b border-[#1A1A1A]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-[#1A1A1A]/50" />
            <input
              id="product-search"
              type="text"
              placeholder="البحث باسم المنتج، كود SKU، باركود..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-[1.5px] border-[#1A1A1A] text-xs rounded-none pr-10 pl-4 py-2.5 focus:outline-none focus:bg-[#F9F7F2] font-sans font-bold"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-sans font-extrabold text-[#1A1A1A]/60">التصنيف:</span>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border-[1.5px] border-[#1A1A1A] text-[#1A1A1A] text-xs font-bold rounded-none px-3.5 py-2.5 focus:outline-none"
            >
              <option value="all">كل التصنيفات</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-[#F9F7F2] text-[#1A1A1A] border-b-[1.5px] border-[#1A1A1A] font-extrabold">
                <th className="p-4">اسم الصنف</th>
                <th className="p-4">باركود SKU</th>
                <th className="p-4">التصنيف</th>
                <th className="p-4 text-center">التكلفة (المشتريات)</th>
                <th className="p-4 text-center">السعر (المبيعات)</th>
                <th className="p-4 text-center">الوحدة</th>
                <th className="p-4">توزيع المخازن</th>
                <th className="p-4 text-left">إجمالي المتوفر</th>
                <th className="p-4 text-center">خيارات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/10">
              {filteredProducts.map((p) => {
                const totalQty = (Object.values(p.warehouseStocks) as number[]).reduce((sum: number, q: number) => sum + q, 0);
                const categoryObj = categories.find(c => p.categoryId === c.id);
                
                return (
                  <tr key={p.id} className="hover:bg-[#F9F7F2]/40 transition duration-150">
                    <td className="p-4">
                      <div className="font-bold text-[#1A1A1A] font-sans text-sm">{p.name}</div>
                      {p.description && <p className="text-[10px] text-[#1A1A1A]/60 mt-0.5 truncate max-w-[200px] italic">{p.description}</p>}
                    </td>
                    <td className="p-4 font-mono text-[#1A1A1A] flex items-center gap-1.5 py-5">
                      <Barcode className="w-4 h-4 text-[#1A1A1A]/60" />
                      <span className="font-bold">{p.sku}</span>
                    </td>
                    <td className="p-4">
                      <span className="border border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A] px-2 py-0.5 text-[10px] font-extrabold rounded-none">
                        {categoryObj?.name || 'غير مصنف'}
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-[#1A1A1A]/70">
                      {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: settings.baseCurrency }).format(p.cost)}
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-[#1A1A1A]">
                      {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: settings.baseCurrency }).format(p.price)}
                    </td>
                    <td className="p-4 text-center text-[#1A1A1A]/80 font-bold">{p.unit}</td>
                    <td className="p-4 space-y-1">
                      {/* Show distribution breakdown inside small badges */}
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[9px] bg-white border border-[#1A1A1A]/10 text-[#1A1A1A] px-1.5 py-0.5 rounded-none font-bold">
                          المركزي: {p.warehouseStocks['w-1'] || 0}
                        </span>
                        <span className="text-[9px] bg-white border border-[#1A1A1A]/10 text-[#1A1A1A] px-1.5 py-0.5 rounded-none font-bold">
                          جدة: {p.warehouseStocks['w-2'] || 0}
                        </span>
                        <span className="text-[9px] bg-white border border-[#1A1A1A]/10 text-[#1A1A1A] px-1.5 py-0.5 rounded-none font-bold">
                          الملز: {p.warehouseStocks['w-3'] || 0}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-left">
                      <span className={`font-bold px-2 py-0.5 rounded-none text-xs font-sans border ${
                        totalQty <= 5 ? 'bg-rose-50 text-[#8C2D19] border-[#8C2D19] font-black animate-pulse' : 'bg-emerald-50 text-emerald-900 border-emerald-800'
                      }`}>
                        {totalQty} {p.unit}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        id={`edit-prod-${p.id}`}
                        onClick={() => handleOpenEditProduct(p)}
                        className="bg-white hover:bg-[#1A1A1A] hover:text-[#F9F7F2] text-[#1A1A1A] p-2 border border-[#1A1A1A] rounded-none transition"
                        title="تعديل المنتج"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="font-bold text-gray-900 text-base">
                {editingProduct ? `تعديل الصنف ${editingProduct.name}` : 'إضافة صنف مخزني جديد'}
              </h3>
              <button
                id="close-prod-modal"
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-gray-900 transition text-lg"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">اسم المنتج / الصنف:</label>
                <input
                  id="prod-name-input"
                  type="text"
                  placeholder="مثال: طابعة حرارية بيكسلون 80مم"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">الباركود (SKU):</label>
                  <input
                    id="prod-sku-input"
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">تصنيف الصنف:</label>
                  <select
                    id="prod-cat-select"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">تكلفة الشراء (Cost):</label>
                  <input
                    id="prod-cost-input"
                    type="number"
                    min="0"
                    value={cost}
                    onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">سعر البيع الافتراضي:</label>
                  <input
                    id="prod-price-input"
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">الوحدة الحسابية:</label>
                  <input
                    id="prod-unit-input"
                    type="text"
                    placeholder="حبة، كرتون، كجم..."
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>
              </div>

              {!editingProduct && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">الكمية الافتتاحية (المستودع الرئيسي):</label>
                  <input
                    id="prod-stock-input"
                    type="number"
                    min="0"
                    value={initialStockMain}
                    onChange={(e) => setInitialStockMain(parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none font-sans"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">الوصف التفصيلي:</label>
                <textarea
                  id="prod-desc-input"
                  placeholder="شرح موجز لأبعاد المنتج، الماركة، بلد المنشأ..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-2xl">
              <button
                id="cancel-prod"
                onClick={() => setShowProductModal(false)}
                className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl"
              >
                إلغاء
              </button>
              <button
                id="save-prod-btn"
                onClick={handleSaveProduct}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
              >
                {editingProduct ? 'تحديث وتعديل' : 'حفظ الصنف'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="font-bold text-gray-900 text-sm">إضافة تصنيف منتجات جديد</h3>
              <button
                id="close-cat-modal"
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-900 transition text-lg"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">اسم التصنيف المحاسبي:</label>
                <input
                  id="cat-name-input"
                  type="text"
                  placeholder="مثال: أجهزة اتصالات"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">وصف التصنيف:</label>
                <textarea
                  id="cat-desc-input"
                  placeholder="شرح مبسط للمنتجات التي تنضوي تحت هذا التصنيف"
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-2xl">
              <button
                id="cancel-cat"
                onClick={() => setShowCategoryModal(false)}
                className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl"
              >
                إلغاء
              </button>
              <button
                id="save-cat-btn"
                onClick={handleSaveCategory}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
              >
                حفظ التصنيف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
