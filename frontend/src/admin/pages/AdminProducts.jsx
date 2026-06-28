import { useEffect, useState, useRef } from 'react';
import { Plus, RefreshCw, Image, X, Upload } from 'lucide-react';
import {
  PageHeader, AdminBtn, SearchBar, StatusBadge, Modal,
  AField, ASelect, AdminSpinner,
} from '../components/AdminUI';
import { productAPI, adminAPI } from '../../api/services';
import { fmt } from '../../utils';
import toast from 'react-hot-toast';

const CATEGORIES = ['running', 'basketball', 'lifestyle', 'training', 'casual', 'formal'];

const STOCK_STATUS = {
  ok:  { label: 'In stock',  color: '#22c55e' },
  low: { label: 'Low stock', color: '#f59e0b' },
  out: { label: 'Out of stock', color: '#ef4444' },
};

const stockKey = (s) => s === 0 ? 'out' : s <= 5 ? 'low' : 'ok';

const EMPTY_FORM = {
  name: '', description: '', brand: '', category: 'running',
  price: '', discountPrice: '', stock: '', sizes: '', colors: '', featured: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [images,   setImages]   = useState([]);   // File[]
  const [previews, setPreviews] = useState([]);   // string[]
  const [saving,   setSaving]   = useState(false);
  const fileRef = useRef();

  const load = async (q = '') => {
    setLoading(true);
    try {
      const data = await productAPI.getAll({ keyword: q, limit: 50 });
      setProducts(data.products || []);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFiles = (files) => {
    const arr = Array.from(files);
    setImages(prev => [...prev, ...arr]);
    arr.forEach(f => {
      const r = new FileReader();
      r.onload = e => setPreviews(p => [...p, e.target.result]);
      r.readAsDataURL(f);
    });
  };

  const removePreview = (i) => {
    setImages(p => p.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const resetModal = () => {
    setForm(EMPTY_FORM);
    setImages([]);
    setPreviews([]);
    setModalOpen(false);
  };

  const handleCreate = async () => {
    if (!form.name || !form.price || !form.stock || !form.brand || !form.category) {
      toast.error('Fill all required fields'); return;
    }
    if (images.length === 0) { toast.error('Upload at least one image'); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach(img => fd.append('images', img));
      await adminAPI.createProduct(fd);
      toast.success('Product created!');
      resetModal();
      load(search);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Products"
        sub={`${products.length} products in your store`}
        actions={
          <>
            <AdminBtn icon={RefreshCw} variant="outline" onClick={() => load(search)} loading={loading}>Refresh</AdminBtn>
            <AdminBtn icon={Plus} onClick={() => setModalOpen(true)}>Add product</AdminBtn>
          </>
        }
      />

      {/* Search */}
      <div className="w-72 mb-5">
        <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" />
      </div>

      {/* Table */}
      <div className="bg-[--cd] border border-[--bd] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[--bd] bg-[--sf]">
                {['Product', 'Brand', 'Category', 'Price', 'Stock', 'Status', 'Rating'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[--tx-m] uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(6).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-[--bd]">
                    {Array(7).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded w-3/4" /></td>
                    ))}
                  </tr>
                ))
                : filtered.length === 0
                ? <tr><td colSpan={7} className="text-center py-16 text-[--tx-m] text-sm">No products found</td></tr>
                : filtered.map(p => (
                  <tr key={p._id} className="border-b border-[--bd] last:border-0 hover:bg-[--sf]/50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-[--sf] shrink-0 border border-[--bd]">
                          <img src={p.images?.[0] || ''} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[--tx] truncate max-w-[180px]">{p.name}</p>
                          {p.featured && <span className="text-[9px] font-bold bg-[--pr]/12 text-[--pr] px-1.5 py-0.5 rounded-full">Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[--tx-m]">{p.brand}</td>
                    <td className="px-4 py-3 text-[12px] text-[--tx-m] capitalize">{p.category}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-[--tx] text-[13px]">{fmt(p.discountPrice || p.price)}</p>
                      {p.discountPrice && <p className="text-[10px] text-[--tx-m] line-through">{fmt(p.price)}</p>}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-semibold text-[--tx]">{p.stock ?? '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={stockKey(p.stock ?? 0)} map={STOCK_STATUS} />
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[--tx-m]">
                      {p.averageRating ? `${p.averageRating.toFixed(1)} (${p.numReviews})` : '—'}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Create product modal */}
      <Modal
        open={modalOpen}
        onClose={resetModal}
        title="Add new product"
        footer={
          <>
            <AdminBtn variant="outline" onClick={resetModal}>Cancel</AdminBtn>
            <AdminBtn loading={saving} onClick={handleCreate} icon={Plus}>Create product</AdminBtn>
          </>
        }
      >
        <div className="space-y-4">
          {/* Image upload */}
          <div>
            <p className="text-[11px] font-bold text-[--tx-m] uppercase tracking-wider mb-2">
              Product images <span className="text-[--pr]">*</span>
            </p>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
              className="border-2 border-dashed border-[--bd] hover:border-[--pr] rounded-xl p-5 text-center cursor-pointer transition-colors group"
            >
              <Upload size={20} className="mx-auto text-[--tx-m] group-hover:text-[--pr] transition-colors mb-2" />
              <p className="text-sm font-medium text-[--tx-m] group-hover:text-[--tx] transition-colors">
                Click or drag images here
              </p>
              <p className="text-[11px] text-[--tx-m] mt-1">JPG, PNG, WebP — multiple allowed</p>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
            </div>
            {previews.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[--bd] group">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePreview(i)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-[--bd] hover:border-[--pr] flex items-center justify-center text-[--tx-m] hover:text-[--pr] transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <AField label="Product name" required value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Air Max Pulse" />
            </div>
            <AField label="Brand" required value={form.brand} onChange={e => setF('brand', e.target.value)} placeholder="Nike" />
            <ASelect
              label="Category" required
              value={form.category}
              onChange={e => setF('category', e.target.value)}
              options={CATEGORIES.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
            />
            <AField label="Price (USD)" required type="number" min="0" step="0.01" value={form.price} onChange={e => setF('price', e.target.value)} placeholder="149.99" />
            <AField label="Sale price (optional)" type="number" min="0" step="0.01" value={form.discountPrice} onChange={e => setF('discountPrice', e.target.value)} placeholder="129.99" />
            <AField label="Stock qty" required type="number" min="0" value={form.stock} onChange={e => setF('stock', e.target.value)} placeholder="25" />
            <AField label="Sizes" value={form.sizes} onChange={e => setF('sizes', e.target.value)} placeholder="7,8,9,10,11,12" hint="Comma-separated" />
          </div>

          <AField label="Colors" value={form.colors} onChange={e => setF('colors', e.target.value)} placeholder="Black,White,Orange" hint="Comma-separated" />

          <div>
            <p className="text-[11px] font-bold text-[--tx-m] uppercase tracking-wider mb-1.5">Description</p>
            <textarea
              value={form.description}
              onChange={e => setF('description', e.target.value)}
              placeholder="Describe this product…"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[--bd] bg-[--cd] text-[--tx] text-sm focus:outline-none focus:border-[--pr] transition-colors resize-none placeholder:text-[--tx-m]"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div
              onClick={() => setF('featured', !form.featured)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                form.featured ? 'bg-[--pr] border-[--pr]' : 'border-[--bd] group-hover:border-[--pr]'
              }`}
            >
              {form.featured && <span className="text-white text-[11px] font-bold leading-none">✓</span>}
            </div>
            <span className="text-sm font-medium text-[--tx] select-none">Mark as featured product</span>
          </label>
        </div>
      </Modal>
    </div>
  );
}
