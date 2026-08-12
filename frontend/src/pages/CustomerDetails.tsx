import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Customer } from '../types';
import { exportCustomerDetailPDF } from '../utils/pdfExport';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  Receipt,
  FileDown
} from 'lucide-react';

export const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/customers/${id}`);
        if (res.data.success) {
          setCustomer(res.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading customer profile...
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <p className="text-rose-600 dark:text-rose-400 font-semibold">{error || 'Customer record not found'}</p>
        <Link to="/customers" className="inline-flex items-center space-x-2 text-xs text-sky-600 dark:text-sky-400 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers list</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <Link to="/customers" className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers list</span>
        </Link>

        <button
          onClick={() => exportCustomerDetailPDF(customer)}
          type="button"
          className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold border border-slate-300 dark:border-slate-800 flex items-center space-x-2 shadow-sm transition"
        >
          <FileDown className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span>Export Customer PDF</span>
        </button>
      </div>

      {/* Top Profile Banner Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-sky-100 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-700 dark:text-sky-300 font-bold text-lg">
            {customer.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{customer.name}</h2>
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                {customer.customerType}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${
                customer.status === 'ACTIVE' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                customer.status === 'LEAD' ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800' :
                'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}>
                {customer.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-2">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{customer.businessName}</span>
              {customer.gstNumber && <span className="text-sky-600 dark:text-sky-400 font-mono text-[11px]">| GST: {customer.gstNumber}</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact & Location Info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3">Contact & Address Details</h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300">
              <Phone className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Mobile Number</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">{customer.mobile}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300">
              <Mail className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Email Address</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">{customer.email}</div>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-slate-700 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Registered Address</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">{customer.address}</div>
              </div>
            </div>
          </div>
        </div>

        {/* CRM Follow-up & Notes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <span>CRM Notes & Follow-up</span>
            {customer.followUpDate && (
              <span className="text-xs text-sky-600 dark:text-sky-400 flex items-center space-x-1 font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                <span>Follow-up: {new Date(customer.followUpDate).toLocaleDateString()}</span>
              </span>
            )}
          </h3>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed min-h-[100px]">
            {customer.notes ? (
              <p className="whitespace-pre-wrap">{customer.notes}</p>
            ) : (
              <p className="text-slate-400 italic">No operational CRM notes recorded for this client.</p>
            )}
          </div>
        </div>
      </div>

      {/* Customer Challans History */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
          <Receipt className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span>Associated Delivery Sales Challans</span>
        </h3>

        {customer.challans && customer.challans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-2.5">Challan #</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Quantity</th>
                  <th className="px-4 py-2.5">Amount</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {customer.challans.map((ch) => (
                  <tr key={ch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono font-bold text-sky-600 dark:text-sky-400">{ch.challanNumber}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(ch.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium">{ch.totalQuantity} units</td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">₹{ch.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                        ch.status === 'CONFIRMED' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' :
                        ch.status === 'DRAFT' ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' :
                        'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      }`}>
                        {ch.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/challans/${ch.id}`} className="text-sky-600 dark:text-sky-400 hover:underline font-semibold">
                        View Challan
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400">No sales challans recorded for this customer yet.</p>
        )}
      </div>
    </div>
  );
};
