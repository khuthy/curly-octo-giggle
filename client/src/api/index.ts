import type { Child, AttendanceRecord } from '../types';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error((err as { error?: string }).error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

const json = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const jsonPut = (body: unknown): RequestInit => ({
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const api = {
  children: {
    getAll: () => request<Child[]>('/children'),
    create: (data: Omit<Child, 'id' | 'created_at'>) =>
      request<Child>('/children', json(data)),
    update: (id: number, data: Omit<Child, 'id' | 'created_at'>) =>
      request<Child>(`/children/${id}`, jsonPut(data)),
    remove: (id: number) =>
      request<{ success: boolean }>(`/children/${id}`, { method: 'DELETE' }),
  },
  attendance: {
    getByDate: (date: string) =>
      request<AttendanceRecord[]>(`/attendance?date=${date}`),
    getReport: (startDate: string, endDate: string) =>
      request<AttendanceRecord[]>(
        `/attendance/report?startDate=${startDate}&endDate=${endDate}`
      ),
    signIn: (childId: number, date: string, signature: string) =>
      request<AttendanceRecord>('/attendance/signin', json({ childId, date, signature })),
    signOut: (childId: number, date: string, signature: string) =>
      request<AttendanceRecord>('/attendance/signout', json({ childId, date, signature })),
  },
};
