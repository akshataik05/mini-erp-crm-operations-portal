import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { StockMovement } from '../types';
import { Pagination } from '../components/Pagination';
import { exportStockMovementsPDF } from '../utils/pdfExport';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  User, 
  Clock, 
  FileDown
} from 'lucide-react';

export const StockMovements: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (search) params.search = search;
      if (typeFilter) params.movementType = typeFilter;

      const res = await api.get('/stock-movements', { params });
      if (res.data.success) {
        setMovements(res.data.data);
        if (res.data.meta) {
          setTotalPages(res.data.meta.totalPages);
          setTotal(res.data.meta.total);
        }
      }
    } catch (err) {
      console.error('Failed to fetch stock movements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [page, search, typeFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Stock Movement Audit Log
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Complete immutable audit trail of all warehouse stock intakes (+IN) and sales dispatches (-OUT)
          </p>
        </div>

        <button
          onClick={() => exportStockMovementsPDF(movements, search)}
          disabled={movements.length === 0}
          type="button"
          className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold border border-slate-300 dark:border-slate-800 flex items-center space-x-2 shadow-sm transition disabled:opacity-50"
        >
          <FileDown className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span>Export Movements PDF</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3 flex-1 min-w-[300px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product name, SKU, reason..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
          >
            <option value="">All Movements (IN / OUT)</option>
            <option value="IN">+ IN (Intake)</option>
            <option value="OUT">- OUT (Dispatched)</option>
          </select>
        </div>
      </div>

      {/* Audit Movements Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Product Name & SKU</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Reason / Reference</th>
                <th className="px-4 py-3">Logged By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading audit trail logs...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No stock movement audit records found matching query.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(m.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{m.product?.name}</div>
                      <div className="text-[11px] font-mono text-sky-600 dark:text-sky-400 mt-0.5">{m.product?.sku}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      {m.movementType === 'IN' ? (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center space-x-1">
                          <ArrowDownLeft className="w-3 h-3" />
                          <span>IN</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 inline-flex items-center space-x-1">
                          <ArrowUpRight className="w-3 h-3" />
                          <span>OUT</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-bold">
                      <span className={m.movementType === 'IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {m.movementType === 'IN' ? '+' : '-'}{m.quantity} units
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-medium">
                      {m.reason}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{m.user?.name || 'System'} ({m.user?.role})</span>
                      </div>
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
          limit={15}
          onPageChange={(p) => setPage(p)}
        />
      </div>
    </div>
  );
};
