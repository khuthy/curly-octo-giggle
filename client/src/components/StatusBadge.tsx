import React from 'react';
import { CheckCircle, LogOut, Clock } from 'lucide-react';
import type { AttendanceStatus } from '../types';

interface Props {
  status: AttendanceStatus;
  timeIn?: string | null;
  timeOut?: string | null;
  size?: 'sm' | 'md';
}

const configs = {
  not_arrived: {
    label: 'Not Arrived',
    Icon: Clock,
    className: 'bg-slate-100 text-slate-500',
  },
  signed_in: {
    label: 'Signed In',
    Icon: CheckCircle,
    className: 'bg-emerald-100 text-emerald-700',
  },
  signed_out: {
    label: 'Signed Out',
    Icon: LogOut,
    className: 'bg-blue-100 text-blue-700',
  },
};

export const StatusBadge: React.FC<Props> = ({ status, timeIn, timeOut, size = 'md' }) => {
  const { label, Icon, className } = configs[status];
  const time = status === 'signed_out' ? timeOut : status === 'signed_in' ? timeIn : null;
  const sm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${className} ${
        sm ? 'px-3 py-1 text-sm' : 'px-4 py-1.5 text-base'
      }`}
    >
      <Icon size={sm ? 14 : 16} />
      {label}
      {time && <span className="opacity-70 font-normal">· {time}</span>}
    </span>
  );
};
