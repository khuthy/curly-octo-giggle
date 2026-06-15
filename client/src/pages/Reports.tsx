import React, { useState } from 'react';
import { format, subDays, parseISO } from 'date-fns';
import { Search, Printer, CheckCircle, LogOut, Clock } from 'lucide-react';
import { api } from '../api';
import type { AttendanceRecord } from '../types';
import { getStatus } from '../types';

export const Reports: React.FC = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 6), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(today);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const data = await api.attendance.getReport(startDate, endDate);
      setRecords(data);
    } finally {
      setLoading(false);
    }
  };

  const statusCell = (record: AttendanceRecord) => {
    const s = getStatus(record);
    if (s === 'signed_out') return <span className="flex items-center gap-1 text-blue-600"><LogOut size={13} /> Signed Out</span>;
    if (s === 'signed_in') return <span className="flex items-center gap-1 text-emerald-600"><CheckCircle size={13} /> Present</span>;
    return <span className="flex items-center gap-1 text-slate-400"><Clock size={13} /> Not Arrived</span>;
  };

  const grouped = records.reduce<Record<string, AttendanceRecord[]>>((acc, r) => {
    if (!acc[r.date]) acc[r.date] = [];
    acc[r.date].push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Reports</h2>
        {records.length > 0 && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors print:hidden"
          >
            <Printer size={16} />
            Print
          </button>
        )}
      </div>

      {/* Date range picker */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 print:hidden">
        <p className="text-sm font-medium text-slate-700 mb-3">Select Date Range</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">From</label>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">To</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={today}
              onChange={e => setEndDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 text-sm font-medium transition-colors"
            >
              <Search size={16} />
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {searched && !loading && (
        Object.keys(grouped).length === 0 ? (
          <div className="text-center text-slate-400 py-12 bg-white rounded-2xl border border-slate-100">
            No attendance records found for this date range.
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([date, dayRecords]) => (
              <div key={date} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <p className="font-semibold text-slate-700 text-sm">
                    {format(parseISO(date), 'EEEE, d MMMM yyyy')}
                  </p>
                  <span className="text-xs text-slate-400">
                    {dayRecords.filter(r => r.timeIn).length} / {dayRecords.length} present
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-slate-400 uppercase tracking-wide border-b border-slate-50">
                        <th className="text-left px-6 py-3 font-medium">Child</th>
                        <th className="text-left px-4 py-3 font-medium">Sign In</th>
                        <th className="text-left px-4 py-3 font-medium">Sign Out</th>
                        <th className="text-left px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {dayRecords.map(record => (
                        <tr key={record.childId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3 font-medium text-slate-700">{record.childName}</td>
                          <td className="px-4 py-3 text-slate-500">{record.timeIn || '—'}</td>
                          <td className="px-4 py-3 text-slate-500">{record.timeOut || '—'}</td>
                          <td className="px-4 py-3 text-xs">{statusCell(record)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
