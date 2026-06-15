export interface Child {
  id: number;
  name: string;
  date_of_birth?: string;
  guardian_name?: string;
  guardian_contact?: string;
  created_at: string;
}

export interface AttendanceRecord {
  id?: number;
  childId: number;
  childName: string;
  date: string;
  timeIn?: string | null;
  signatureIn?: string | null;
  timeOut?: string | null;
  signatureOut?: string | null;
  notes?: string | null;
}

export type AttendanceStatus = 'not_arrived' | 'signed_in' | 'signed_out';

export function getStatus(record: AttendanceRecord): AttendanceStatus {
  if (record.timeOut) return 'signed_out';
  if (record.timeIn) return 'signed_in';
  return 'not_arrived';
}
