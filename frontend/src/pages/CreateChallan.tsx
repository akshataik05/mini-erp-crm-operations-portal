import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Customer, Product } from '../types';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  FileCheck, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
  Building,
  Package
} from 'lucide-react';

interface SelectedItem {
  productId: string;
  quantity: number;
}

export const CreateChallan: React.FC = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState<SelectedItem[]>([
    { productId: '', quantity: 1 }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          api.get('/customers?limit=100'),
          api.get('/products?limit=100')
        ]);
        if (cRes.data.success) setCustomers(cRes.data.data);
        if (pRes.data.success) setProducts(pRes.data.data);
      } catch (err) {
        console.error('Failed to load initial customers or products', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const productMap = new Map(products.map(p => [p.id, p]));

  const addItemRow = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    const next = [...items];
    next.splice(index, 1);
    setItems(next);
  };

  const updateItem = (index: number, field: keyof SelectedItem, value: any) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setItems(next);
  };

  let totalQuantity = 0;
  let totalAmount = 0;
  let stockWarning = false;

  items.forEach(item => {
    const product = productMap.get(item.productId);
    if (product) {
      const q = Number(item.quantity) || 0;
      totalQuantity += q;
      totalAmount += product.unitPrice * q;
      if (product.currentStock < q) {
        stockWarning = true;
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError('Please select a customer for this sales challan.');
      return;
    }

    const validItems = items.filter(i => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      setError('Please select at least one valid product item.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const payload = {
        customerId: selectedCustomerId,
        items: validItems.map(i => ({ productId: i.productId, quantity: Number(i.quantity) }))
      };

      const res = await api.post('/challans', payload);
      if (res.data.success) {
        navigate(`/challans/${res.data.data.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create draft sales challan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Link */}
      <div className="flex items-center justify-between">
        <Link to="/challans" className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sales Challans</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Create Sales Challan
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Generate a new sales challan order in DRAFT status. Unit price & name snapshots are frozen automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start space-x-3 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Customer Selection Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center space-x-2">
            <Building className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Select Customer / Client *</span>
          </h3>

          {loadingData ? (
            <div className="h-10 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg animate-pulse"></div>
          ) : (
            <div>
              <select
                required
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 font-medium"
              >
                <option value="">-- Choose Customer from CRM Database --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.businessName}) — {c.mobile}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Product Items Builder */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Package className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Line Items Builder (Snapshots saved automatically)</span>
            </h3>

            <button
              type="button"
              onClick={addItemRow}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-300 text-xs font-semibold flex items-center space-x-1 border border-slate-300 dark:border-slate-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product Item</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const selectedProduct = productMap.get(item.productId);
              const lineTotal = selectedProduct ? selectedProduct.unitPrice * (item.quantity || 0) : 0;
              const isStockInsufficient = selectedProduct ? selectedProduct.currentStock < item.quantity : false;

              return (
                <div key={index} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-wrap items-center gap-4">
                  {/* Product Select */}
                  <div className="flex-1 min-w-[240px]">
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Product Item #{index + 1}</label>
                    <select
                      required
                      value={item.productId}
                      onChange={(e) => updateItem(index, 'productId', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                    >
                      <option value="">-- Choose Product SKU --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) — Stock: {p.currentStock} units | ₹{p.unitPrice}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stock Snapshot Info */}
                  {selectedProduct && (
                    <div className="text-xs">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Stock Status</div>
                      <div className={`font-semibold flex items-center space-x-1 ${isStockInsufficient ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {isStockInsufficient ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{selectedProduct.currentStock} units</span>
                      </div>
                    </div>
                  )}

                  {/* Quantity Input */}
                  <div className="w-28">
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Unit Price */}
                  <div className="w-28">
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Unit Price</label>
                    <div className="py-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      ₹{selectedProduct ? selectedProduct.unitPrice.toLocaleString() : '0.00'}
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="w-32">
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Line Subtotal</label>
                    <div className="py-2 text-xs font-bold text-sky-600 dark:text-sky-400">
                      ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Remove */}
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItemRow(index)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition mt-4"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Total Summary Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            {stockWarning && (
              <div className="text-xs text-amber-800 dark:text-amber-300 flex items-center space-x-1 font-semibold bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Note: Quantity exceeds stock. You can save DRAFT, but confirmation requires sufficient inventory.</span>
              </div>
            )}

            <div className="ml-auto text-right">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Total Items: <span className="text-slate-900 dark:text-slate-100">{totalQuantity} units</span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                Grand Total: <span className="text-sky-600 dark:text-sky-400">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end space-x-4">
          <Link
            to="/challans"
            className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm flex items-center space-x-2 disabled:opacity-50 transition"
          >
            <FileCheck className="w-4 h-4" />
            <span>{submitting ? 'Saving Draft...' : 'Save DRAFT Sales Challan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
