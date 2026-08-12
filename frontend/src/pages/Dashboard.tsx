import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { DashboardStats } from '../types';
import { exportDashboardPDF } from '../utils/pdfExport';
import { 
  Users, 
  UserCheck, 
  Package, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  FileDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { hasRole } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleExportPDF = () => {
    if (stats) {
      exportDashboardPDF(stats, []);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time metric summary for CRM leads, inventory alerts, and delivery challans
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportPDF}
            disabled={!stats}
            type="button"
            className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold border border-slate-300 dark:border-slate-800 flex items-center space-x-2 shadow-sm transition disabled:opacity-50"
          >
            <FileDown className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Export PDF Report</span>
          </button>

          {hasRole(['ADMIN', 'SALES']) && (
            <Link
              to="/challans/create"
              className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Sales Challan</span>
            </Link>
          )}
        </div>
      </div>

      {/* Quick Action Navigation Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <TrendingUp className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span>Quick Actions</span>
        </div>

        <div className="flex items-center space-x-3">
          {hasRole(['ADMIN', 'SALES']) && (
            <Link
              to="/customers"
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition"
            >
              Add Customer
            </Link>
          )}

          {hasRole(['ADMIN', 'WAREHOUSE']) && (
            <Link
              to="/products"
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition"
            >
              Add Product
            </Link>
          )}

          <Link
            to="/stock-movements"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition"
          >
            Audit Stock Movements
          </Link>
        </div>
      </div>

      {/* 6 Summary Metric Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Total Customers */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Customers</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats?.totalCustomers ?? 0}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>CRM Database</span>
              <Link to="/customers" className="text-sky-600 dark:text-sky-400 hover:underline flex items-center space-x-1 font-medium">
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* 2. Active Customers */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Customers</p>
                <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats?.activeCustomers ?? 0}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Status = ACTIVE</span>
              <Link to="/customers?status=ACTIVE" className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 font-medium">
                <span>View Active</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* 3. Total Products */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Products</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats?.totalProducts ?? 0}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>SKU Inventory Catalog</span>
              <Link to="/products" className="text-sky-600 dark:text-sky-400 hover:underline flex items-center space-x-1 font-medium">
                <span>View Products</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* 4. Low Stock Alerts */}
          <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-900/60 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Low Stock Alerts</p>
                <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">{stats?.lowStockProducts ?? 0}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Stock ≤ Minimum threshold</span>
              <Link to="/inventory?lowStock=true" className="text-amber-700 dark:text-amber-400 hover:underline flex items-center space-x-1 font-medium">
                <span>Manage Inventory</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* 5. Draft Challans */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Draft Challans</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats?.draftChallans ?? 0}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Pending confirmation</span>
              <Link to="/challans?status=DRAFT" className="text-sky-600 dark:text-sky-400 hover:underline flex items-center space-x-1 font-medium">
                <span>View Drafts</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* 6. Confirmed Challans */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Confirmed Challans</p>
                <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats?.confirmedChallans ?? 0}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Stock deducted</span>
              <Link to="/challans?status=CONFIRMED" className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 font-medium">
                <span>View Confirmed</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Business Workflow Summary Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
          Enterprise Business Logic & Stock Execution Policy
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Creating a Sales Challan initializes line items in <span className="font-semibold text-slate-700 dark:text-slate-300">DRAFT</span> status without altering physical stock levels. During <span className="font-semibold text-emerald-600 dark:text-emerald-400">CONFIRMATION</span>, an interactive PostgreSQL transaction verifies item availability, decrements inventory stock atomically, records corresponding <span className="font-semibold text-amber-600 dark:text-amber-400">OUT Stock Movements</span>, and permanently freezes line-item pricing snapshots.
        </p>
      </div>
    </div>
  );
};
