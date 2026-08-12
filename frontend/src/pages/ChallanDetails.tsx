import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Challan } from '../types';
import { useAuth } from '../context/AuthContext';
import { exportChallanPDF } from '../utils/pdfExport';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Ban, 
  Building, 
  User, 
  Calendar, 
  AlertOctagon, 
  ShieldCheck,
  PackageCheck,
  FileDown
} from 'lucide-react';

export const ChallanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { hasRole } = useAuth();

  const fetchChallan = async () => {
    try {
      const res = await api.get(`/challans/${id}`);
      if (res.data.success) {
        setChallan(res.data.data);
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to load sales challan details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const handleConfirm = async () => {
    if (!challan) return;
    if (!window.confirm(`Are you sure you want to confirm sales challan '${challan.challanNumber}'? This will execute a PostgreSQL transaction, reduce product stock, and create OUT stock movements.`)) {
      return;
    }

    setActionError('');
    setActionSuccess('');
    setConfirming(true);

    try {
      const res = await api.post(`/challans/${challan.id}/confirm`);
      if (res.data.success) {
        setActionSuccess('Challan confirmed successfully! Inventory stock reduced & OUT stock movement logged via PostgreSQL transaction.');
        fetchChallan();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to confirm sales challan.');
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = async () => {
    if (!challan) return;
    if (!window.confirm(`Are you sure you want to cancel draft sales challan '${challan.challanNumber}'?`)) {
      return;
    }

    setActionError('');
    setActionSuccess('');
    setCancelling(true);

    try {
      const res = await api.post(`/challans/${challan.id}/cancel`);
      if (res.data.success) {
        setActionSuccess('Sales challan cancelled.');
        fetchChallan();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to cancel sales challan.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading sales challan details...
      </div>
    );
  }

  if (!challan) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <p className="text-rose-600 dark:text-rose-400 font-semibold">Challan not found</p>
        <Link to="/challans" className="inline-flex items-center space-x-2 text-xs text-sky-600 dark:text-sky-400 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sales Challans</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link to="/challans" className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sales Challans</span>
        </Link>

        <button
          onClick={() => exportChallanPDF(challan)}
          type="button"
          className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold border border-slate-300 dark:border-slate-800 flex items-center space-x-2 shadow-sm transition"
        >
          <FileDown className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span>Export Challan PDF</span>
        </button>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start space-x-3 text-rose-700 dark:text-rose-300 text-xs font-medium">
          <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-rose-800 dark:text-rose-200">Confirmation Rejected by Backend</div>
            <div>{actionError}</div>
          </div>
        </div>
      )}

      {/* Action Success Banner */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-start space-x-3 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>{actionSuccess}</div>
        </div>
      )}

      {/* Top Invoice Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Sales Delivery Challan</div>
            <h2 className="text-2xl font-bold text-sky-600 dark:text-sky-400 font-mono mt-1">{challan.challanNumber}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Created Date: {new Date(challan.createdAt).toLocaleString()}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {challan.status === 'CONFIRMED' && (
              <span className="px-3.5 py-1.5 rounded text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>CONFIRMED (Stock Reduced)</span>
              </span>
            )}

            {challan.status === 'DRAFT' && (
              <span className="px-3.5 py-1.5 rounded text-xs font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>DRAFT (Stock Unchanged)</span>
              </span>
            )}

            {challan.status === 'CANCELLED' && (
              <span className="px-3.5 py-1.5 rounded text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center space-x-1.5">
                <Ban className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>CANCELLED</span>
              </span>
            )}

            {/* Action Buttons for DRAFT */}
            {challan.status === 'DRAFT' && hasRole(['ADMIN', 'SALES', 'ACCOUNTS']) && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Challan'}
                </button>

                <button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>{confirming ? 'Executing Transaction...' : 'Confirm Challan & Reduce Stock'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Customer & Creator Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Customer Information</div>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{challan.customer?.name}</div>
            <div className="text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
              <Building className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>{challan.customer?.businessName}</span>
            </div>
            <div className="text-slate-600 dark:text-slate-400">Mobile: {challan.customer?.mobile}</div>
            {challan.customer?.gstNumber && <div className="text-sky-600 dark:text-sky-400 font-mono">GST: {challan.customer.gstNumber}</div>}
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Challan Creator & Audit</div>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>{challan.user?.name || 'System User'}</span>
            </div>
            <div className="text-slate-600 dark:text-slate-400">Role: <span className="font-semibold text-slate-900 dark:text-slate-100">{challan.user?.role}</span></div>
            <div className="text-slate-600 dark:text-slate-400">Email: {challan.user?.email}</div>
          </div>
        </div>

        {/* Line Items Table with Price/Name Snapshots */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Line Items & Pricing Snapshots</span>
          </h3>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase">
                <tr>
                  <th className="px-4 py-3">Product Name (Snapshot)</th>
                  <th className="px-4 py-3">SKU (Snapshot)</th>
                  <th className="px-4 py-3">Unit Price (Snapshot)</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {challan.items && challan.items.map((item) => {
                  const subtotal = item.unitPriceSnapshot * item.quantity;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">{item.productNameSnapshot}</td>
                      <td className="px-4 py-3.5 font-mono text-sky-600 dark:text-sky-400">{item.skuSnapshot}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                        ₹{item.unitPriceSnapshot.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">{item.quantity} units</td>
                      <td className="px-4 py-3.5 text-right font-bold text-sky-600 dark:text-sky-400 text-sm">
                        ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grand Total Bar */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Total Quantity: <span className="font-bold text-slate-900 dark:text-slate-100">{challan.totalQuantity} items</span>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Amount</div>
            <div className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">
              ₹{challan.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
