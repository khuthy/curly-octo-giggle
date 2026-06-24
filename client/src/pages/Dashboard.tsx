import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Users, CheckCircle, LogOut, Clock } from 'lucide-react';
import { api } from '../api';
import { StatusBadge } from '../components/StatusBadge';
import type { AttendanceRecord } from '../types';
import { getStatus } from '../types';

export const Dashboard: React.FC = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.attendance.getByDate(today).then(setRecords).finally(() => setLoading(false));
  }, [today]);

  const total = records.length;
  const signedIn = records.filter(r => r.timeIn && !r.timeOut).length;
  const signedOut = records.filter(r => !!r.timeOut).length;
  const notArrived = records.filter(r => !r.timeIn).length;

  const stats = [
    { label: 'Enrolled', value: total, Icon: Users, color: 'text-slate-600', bg: 'bg-slate-100' },
    { label: 'Present', value: signedIn, Icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Signed Out', value: signedOut, Icon: LogOut, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Not Arrived', value: notArrived, Icon: Clock, color: 'text-slate-400', bg: 'bg-slate-100' },
  ];

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-lg text-slate-500 mt-1">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center mb-4`}>
              <Icon size={24} />
            </div>
            <p className="text-4xl font-bold text-slate-800">{value}</p>
            <p className="text-base text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Today's Register</h3>
        </div>
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-lg">Loading…</div>
        ) : records.length === 0 ? (
          <div className="p-14 text-center text-slate-400">
            <Users size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No children enrolled yet</p>
            <p className="text-base mt-2">Add children under the Children tab to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {records.map((record) => {
              const status = getStatus(record);
              return (
                <div key={record.childId} className="flex items-center justify-between px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-base select-none">
                      {record.childName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-lg font-semibold text-slate-700">{record.childName}</span>
                  </div>
                  <StatusBadge
                    status={status}
                    timeIn={record.timeIn}
                    timeOut={record.timeOut}
                    size="sm"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
