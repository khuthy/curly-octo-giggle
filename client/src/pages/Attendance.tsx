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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Attendance</h2>
        <button
          onClick={loadRecords}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Date navigator */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
        <button
          onClick={() => shiftDate(-1)}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 text-center">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="font-semibold text-slate-800 text-center border-0 outline-none bg-transparent cursor-pointer text-base w-full"
          />
          {isToday && <p className="text-xs text-primary-600 font-medium mt-0.5">Today</p>}
        </div>
        <button
          onClick={() => shiftDate(1)}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Children grid */}
      {loading ? (
        <div className="text-center text-slate-400 py-16">Loading…</div>
      ) : records.length === 0 ? (
        <div className="text-center text-slate-400 py-16 bg-white rounded-2xl border border-slate-100">
          No children registered. Add children under the Children tab.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {records.map((record) => {
            const status = getStatus(record);
            return (
              <div key={record.childId} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xl select-none flex-shrink-0">
                    {record.childName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{record.childName}</p>
                    <StatusBadge
                      status={status}
                      timeIn={record.timeIn}
                      timeOut={record.timeOut}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Times */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-0.5">Morning sign in</p>
                    <p className="font-semibold text-slate-700 text-sm">{record.timeIn || '—'}</p>
                    {record.signatureIn && (
                      <button
                        onClick={() =>
                          setViewSig({ url: record.signatureIn!, label: `${record.childName} – Sign In` })
                        }
                        className="text-xs text-primary-600 mt-1 hover:underline"
                      >
                        View signature
                      </button>
                    )}
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-0.5">Afternoon sign out</p>
                    <p className="font-semibold text-slate-700 text-sm">{record.timeOut || '—'}</p>
                    {record.signatureOut && (
                      <button
                        onClick={() =>
                          setViewSig({ url: record.signatureOut!, label: `${record.childName} – Sign Out` })
                        }
                        className="text-xs text-primary-600 mt-1 hover:underline"
                      >
                        View signature
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setTarget({ record, mode: 'in' })}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    disabled={status === 'signed_out'}
                  >
                    <LogIn size={15} />
                    Sign In
                  </button>
                  <button
                    onClick={() => setTarget({ record, mode: 'out' })}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    disabled={status !== 'signed_in'}
                  >
                    <LogOut size={15} />
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
