import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Boxes, 
  ArrowLeftRight, 
  FileSpreadsheet, 
  UserCheck, 
  Building2
} from 'lucide-react';
import { Role } from '../types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: Role[];
}

export const Sidebar: React.FC = () => {
  const { hasRole } = useAuth();

  const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Customers (CRM)', path: '/customers', icon: <Users className="w-4 h-4" />, roles: ['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE'] },
    { label: 'Products', path: '/products', icon: <Package className="w-4 h-4" />, roles: ['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'] },
    { label: 'Inventory', path: '/inventory', icon: <Boxes className="w-4 h-4" />, roles: ['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'] },
    { label: 'Stock Movements', path: '/stock-movements', icon: <ArrowLeftRight className="w-4 h-4" />, roles: ['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'] },
    { label: 'Sales Challans', path: '/challans', icon: <FileSpreadsheet className="w-4 h-4" />, roles: ['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE'] },
    { label: 'User Management', path: '/users', icon: <UserCheck className="w-4 h-4" />, roles: ['ADMIN'] }
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 min-h-screen transition-colors duration-200">
      <div>
        {/* Header Branding */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight leading-tight">
              Mini ERP + CRM
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Operations Portal</p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-3">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Navigation Menu
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              if (item.roles && !hasRole(item.roles)) return null;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Copyright */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 text-center">
        Enterprise SaaS v1.0
      </div>
    </aside>
  );
};
