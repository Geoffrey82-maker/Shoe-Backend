import { useEffect, useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, RefreshCw, Tag } from 'lucide-react';
import { PageHeader, AdminBtn, StatusBadge, Modal, AField, ASelect } from '../components/AdminUI';
import { adminAPI } from '../../api/services';
import { fmt } from '../../utils';
import toast from 'react-hot-toast';

const EMPTY = {
  code: '', discountType: 'percentage', discountValue: '',
  minimumAmount: '', expiresAt: '', usageLimit: '',
};

export default function AdminCoupons() {
  const [coupons,  setCoupons]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getAllCoupons();
      setCoupons(data.coupons || []);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.code || !form.discountValue || !form.expiresAt) {
      toast.error('Fill all required fields'); return;
    }
    setSaving(true);
    try {
      await adminAPI.createCoupon({
        code:          form.code.toUpperCase(),
        discountType:  form.discountType,
        discountValue: Number(form.discountValue),
        minimumAmount: Number(form.minimumAmount) || 0,
        expiresAt:     form.expiresAt,
        usageLimit:    Number(form.usageLimit) || 0,
      });
      toast.success('Coupon created!');
      setModalOpen(false);
      setForm(EMPTY);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await adminAPI.toggleCoupon(id);
      toast.success('Coupon updated');
      load();
    } catch (e) { toast.error(e.message); }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await adminAPI.deleteCoupon(id);
      toast.success('Coupon deleted');
      setCoupons(c => c.filter(x => x._id !== id));
    } catch (e) { toast.error(e.message); }
    finally { setDeleting(null); }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Coupons"
        sub="Create and manage discount codes"
        actions={
          <>
            <AdminBtn icon={RefreshCw} variant="outline" onClick={load} loading={loading}>Refresh</AdminBtn>
            <AdminBtn icon={Plus} onClick={() => setModalOpen(true)}>New coupon</AdminBtn>
          </>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total coupons', value: coupons.length },
          { label: 'Active',        value: coupons.filter(c => c.isActive).length, color: '#22c55e' },
          { label: 'Inactive',      value: coupons.filter(c => !c.isActive).length, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="bg-[--cd] border border-[--bd] rounded-xl p-4">
            <p className="text-[11px] font-semibold text-[--tx-m] uppercase tracking-wide mb-1">{s.label}</p>
            <p className="font-display text-[28px] font-black" style={{ color: s.color || 'var(--tx)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[--cd] border border-[--bd] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[--bd] bg-[--sf]">
                {['Code', 'Type', 'Value', 'Min. order', 'Used / Limit', 'Expires', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[--tx-m] uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(4).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-[--bd]">
                    {Array(8).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded w-3/4" /></td>
                    ))}
                  </tr>
                ))
                : coupons.length === 0
                ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16">
                      <Tag size={32} className="text-[--tx-m] mx-auto mb-3" />
                      <p className="text-[--tx-m] text-sm">No coupons yet. Create your first one!</p>
                    </td>
                  </tr>
                )
                : coupons.map(c => {
                  const expired = new Date(c.expiresAt) < new Date();
                  return (
                    <tr key={c._id} className="border-b border-[--bd] last:border-0 hover:bg-[--sf]/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-[13px] text-[--tx] bg-[--sf] px-2 py-0.5 rounded-lg">{c.code}</span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[--tx-m] capitalize">{c.discountType}</td>
                      <td className="px-4 py-3 font-bold text-[--pr] text-[13px]">
                        {c.discountType === 'percentage' ? `${c.discountValue}%` : fmt(c.discountValue)}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[--tx-m]">
                        {c.minimumAmount > 0 ? fmt(c.minimumAmount) : '—'}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[--tx-m]">
                        {c.usedCount} / {c.usageLimit > 0 ? c.usageLimit : '∞'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[12px] font-medium ${expired ? 'text-red-500' : 'text-[--tx-m]'}`}>
                          {new Date(c.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={!c.isActive || expired ? 'inactive' : 'active'}
                          map={{
                            active:   { label: 'Active',   color: '#22c55e' },
                            inactive: { label: 'Inactive', color: '#6b7280' },
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggle(c._id)}
                            title={c.isActive ? 'Deactivate' : 'Activate'}
                            className={`p-1.5 rounded-lg transition-colors ${c.isActive ? 'text-green-600 hover:bg-green-50' : 'text-[--tx-m] hover:bg-[--sf]'}`}
                          >
                            {c.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          </button>
                          <button
                            onClick={() => handleDelete(c._id)}
                            disabled={deleting === c._id}
                            title="Delete coupon"
                            className="p-1.5 rounded-lg text-[--tx-m] hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Create coupon modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setForm(EMPTY); }}
        title="Create new coupon"
        footer={
          <>
            <AdminBtn variant="outline" onClick={() => { setModalOpen(false); setForm(EMPTY); }}>Cancel</AdminBtn>
            <AdminBtn loading={saving} onClick={handleCreate} icon={Plus}>Create coupon</AdminBtn>
          </>
        }
      >
        <div className="space-y-4">
          <AField
            label="Coupon code" required
            value={form.code}
            onChange={e => setF('code', e.target.value.toUpperCase())}
            placeholder="SUMMER20"
            hint="Customers will enter this code at checkout"
          />

          <div className="grid grid-cols-2 gap-3">
            <ASelect
              label="Discount type" required
              value={form.discountType}
              onChange={e => setF('discountType', e.target.value)}
              options={[
                { value: 'percentage', label: 'Percentage (%)' },
                { value: 'fixed',      label: 'Fixed amount ($)' },
              ]}
            />
            <AField
              label={form.discountType === 'percentage' ? 'Discount (%)' : 'Discount ($)'}
              required type="number" min="0"
              value={form.discountValue}
              onChange={e => setF('discountValue', e.target.value)}
              placeholder={form.discountType === 'percentage' ? '20' : '15.00'}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <AField
              label="Minimum order ($)"
              type="number" min="0"
              value={form.minimumAmount}
              onChange={e => setF('minimumAmount', e.target.value)}
              placeholder="50.00"
              hint="Leave blank for no minimum"
            />
            <AField
              label="Usage limit"
              type="number" min="0"
              value={form.usageLimit}
              onChange={e => setF('usageLimit', e.target.value)}
              placeholder="100"
              hint="0 = unlimited uses"
            />
          </div>

          <AField
            label="Expiry date" required
            type="date" min={today}
            value={form.expiresAt}
            onChange={e => setF('expiresAt', e.target.value)}
          />

          {/* Preview */}
          {form.code && form.discountValue && (
            <div className="bg-[--sf] rounded-xl p-4 border border-[--bd]">
              <p className="text-[10px] font-bold text-[--tx-m] uppercase tracking-widest mb-2">Preview</p>
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-[--pr] text-lg">{form.code}</span>
                <span className="text-[--tx-m] text-sm">·</span>
                <span className="text-sm font-semibold text-[--tx]">
                  {form.discountType === 'percentage' ? `${form.discountValue}% off` : `${fmt(form.discountValue)} off`}
                  {form.minimumAmount ? ` on orders over ${fmt(form.minimumAmount)}` : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
