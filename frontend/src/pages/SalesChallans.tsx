import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Challan, ChallanStatus } from '../types';
import { Pagination } from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import { exportChallansListPDF } from '../utils/pdfExport';
import { 
  Search, 
  Plus, 
  Building,
  ArrowRight,
  FileDown
} from 'lucide-react';

export const SalesChallans: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const { hasRole } = useAuth();

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/challans', { params });
      if (res.data.success) {
        setChallans(res.data.data);
        if (res.data.meta) {
          setTotalPages(res.data.meta.totalPages);
          setTotal(res.data.meta.total);
        }
      }
    } catch (err) {
      console.error('Failed to fetch sales challans', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [page, search, statusFilter]);

  const handleTabChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
    if (status) {
      setSearchParams({ status });
    } else {
      setSearchParams({});
    }
  };

  const getStatusBadge = (status: ChallanStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            CONFIRMED
          </span>
        );
      case 'DRAFT':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            DRAFT
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            CANCELLED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Sales Challans
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Create DRAFT sales challans, review pricing snapshots, and confirm delivery orders
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => exportChallansListPDF(challans, search)}
            disabled={challans.length === 0}
            type="button"
            className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold border border-slate-300 dark:border-slate-800 flex items-center space-x-2 shadow-sm transition disabled:opacity-50"
          >
            <FileDown className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Export Challans PDF</span>
          </button>

          {hasRole(['ADMIN', 'SALES']) && (
            <Link
              to="/challans/create"
              className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Sales Challan</span>
            </Link>
          )}
        </div>
      </div>

      {/* Status Tabs and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => handleTabChange('')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                statusFilter === '' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All Statuses
            </button>
            <button
              onClick={() => handleTabChange('DRAFT')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                statusFilter === 'DRAFT' ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Drafts
            </button>
            <button
              onClick={() => handleTabChange('CONFIRMED')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                statusFilter === 'CONFIRMED' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => handleTabChange('CANCELLED')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                statusFilter === 'CANCELLED' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Challan #, customer name, business..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Sales Challan Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Challan #</th>
                <th className="px-4 py-3">Customer Name & Business</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Line Items</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading sales challans...
                  </td>
                </tr>
              ) : challans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No sales challans match active filters.
                  </td>
                </tr>
              ) : (
                challans.map((ch) => (
                  <tr key={ch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3.5 font-mono font-bold text-sky-600 dark:text-sky-400">
                      {ch.challanNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{ch.customer?.name}</div>
                      <div className="text-slate-500 dark:text-slate-400 flex items-center space-x-1 mt-0.5 text-[11px]">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>{ch.customer?.businessName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                      {new Date(ch.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                      {ch._count?.items ?? 0} item(s) ({ch.totalQuantity} units)
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100">
                      ₹{ch.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3.5">
                      {getStatusBadge(ch.status)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to={`/challans/${ch.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 font-semibold text-xs inline-flex items-center space-x-1 transition"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={10}
          onPageChange={(p) => setPage(p)}
        />
      </div>
    </div>
  );
};
