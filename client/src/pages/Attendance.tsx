import React, { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { LogIn, LogOut, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../api';
import { Modal } from '../components/Modal';
import { SignaturePad } from '../components/SignaturePad';
import { StatusBadge } from '../components/StatusBadge';
import type { AttendanceRecord } from '../types';
import { getStatus } from '../types';

type SignMode = 'in' | 'out';

interface SignTarget {
  record: AttendanceRecord;
  mode: SignMode;
}

export const Attendance: React.FC = () => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<SignTarget | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewSig, setViewSig] = useState<{ url: string; label: string } | null>(null);

  const loadRecords = useCallback(() => {
    setLoading(true);
    api.attendance.getByDate(date).then(setRecords).finally(() => setLoading(false));
  }, [date]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const shiftDate = (days: number) => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + days);
    setDate(format(d, 'yyyy-MM-dd'));
  };

  const handleConfirm = async (dataUrl: string) => {
    if (!target) return;
    setSaving(true);
    try {
      if (target.mode === 'in') {
        await api.attendance.signIn(target.record.childId, date, dataUrl);
      } else {
        await api.attendance.signOut(target.record.childId, date, dataUrl);
      }
      setTarget(null);
      loadRecords();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const isToday = date === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Attendance</h2>
        <button
          onClick={loadRecords}
          className="p-3 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={22} />
        </button>
      </div>

      {/* Date navigator */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-3">
        <button
          onClick={() => shiftDate(-1)}
          className="p-3 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 flex-shrink-0"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 text-center">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="font-bold text-slate-800 text-center border-0 outline-none bg-transparent cursor-pointer text-xl w-full"
          />
          {isToday && <p className="text-sm text-primary-600 font-semibold mt-1">Today</p>}
        </div>
        <button
          onClick={() => shiftDate(1)}
          className="p-3 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 flex-shrink-0"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Children grid */}
      {loading ? (
        <div className="text-center text-slate-400 py-20 text-lg">Loading…</div>
      ) : records.length === 0 ? (
        <div className="text-center text-slate-400 py-20 bg-white rounded-2xl border border-slate-100 text-lg">
          No children registered. Add children under the Children tab.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {records.map((record) => {
            const status = getStatus(record);
            return (
              <div key={record.childId} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                {/* Child header */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-2xl select-none flex-shrink-0">
                    {record.childName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-800">{record.childName}</p>
                    <div className="mt-1">
                      <StatusBadge
                        status={status}
                        timeIn={record.timeIn}
                        timeOut={record.timeOut}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Times */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm text-slate-400 mb-1 font-medium">Morning sign in</p>
                    <p className="text-xl font-bold text-slate-700">{record.timeIn || '—'}</p>
                    {record.signatureIn && (
                      <button
                        onClick={() =>
                          setViewSig({ url: record.signatureIn!, label: `${record.childName} – Sign In` })
                        }
                        className="text-sm text-primary-600 mt-1.5 hover:underline font-medium"
                      >
                        View signature
                      </button>
                    )}
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm text-slate-400 mb-1 font-medium">Afternoon sign out</p>
                    <p className="text-xl font-bold text-slate-700">{record.timeOut || '—'}</p>
                    {record.signatureOut && (
                      <button
                        onClick={() =>
                          setViewSig({ url: record.signatureOut!, label: `${record.childName} – Sign Out` })
                        }
                        className="text-sm text-primary-600 mt-1.5 hover:underline font-medium"
                      >
                        View signature
                      </button>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setTarget({ record, mode: 'in' })}
                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-base font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    disabled={status === 'signed_out'}
                  >
                    <LogIn size={20} />
                    Sign In
                  </button>
                  <button
                    onClick={() => setTarget({ record, mode: 'out' })}
                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-base font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    disabled={status !== 'signed_in'}
                  >
                    <LogOut size={20} />
                    Sign Out
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Signature capture modal */}
      <Modal
        isOpen={!!target}
        onClose={() => { if (!saving) setTarget(null); }}
        title={target?.mode === 'in' ? 'Morning Sign In' : 'Afternoon Sign Out'}
        subtitle={
          target
            ? `${target.record.childName} · ${format(new Date(date + 'T12:00:00'), 'd MMMM yyyy')} · ${format(new Date(), 'HH:mm')}`
            : undefined
        }
      >
        {target && (
          <SignaturePad onConfirm={handleConfirm} loading={saving} />
        )}
      </Modal>

      {/* View signature modal */}
      <Modal
        isOpen={!!viewSig}
        onClose={() => setViewSig(null)}
        title="Signature"
        subtitle={viewSig?.label}
      >
        {viewSig && (
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <img src={viewSig.url} alt="Signature" className="w-full" />
          </div>
        )}
      </Modal>
    </div>
  );
};
