import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, UserPlus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { api } from '../api';
import { Modal } from '../components/Modal';
import type { Child } from '../types';

interface FormState { name: string; date_of_birth: string; guardian_name: string; guardian_contact: string; }
const emptyForm: FormState = { name: '', date_of_birth: '', guardian_name: '', guardian_contact: '' };

interface FieldProps { id: keyof FormState; label: string; type?: string; required?: boolean; form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>>; }

const Field: React.FC<FieldProps> = ({ id, label, type = 'text', required = false, form, setForm }) => (
  <div>
    <label htmlFor={id} className="block text-base font-medium text-slate-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input id={id} type={type} required={required} value={form[id]}
      onChange={e => setForm(prev => ({ ...prev, [id]: e.target.value }))}
      className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow" />
  </div>
);

export const Children: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; child?: Child }>({ open: false });
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null);

  const load = () => { api.children.getAll().then(setChildren).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setModal({ open: true }); };
  const openEdit = (child: Child) => {
    setForm({ name: child.name, date_of_birth: child.date_of_birth || '', guardian_name: child.guardian_name || '', guardian_contact: child.guardian_contact || '' });
    setModal({ open: true, child });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (modal.child) await api.children.update(modal.child.id, form);
      else await api.children.create(form);
      setModal({ open: false });
      load();
    } catch (err) { alert((err as Error).message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.children.remove(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Children</h2>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-3.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-base font-semibold shadow-sm">
          <Plus size={18} /> Add Child
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-lg">Loading…</div>
        ) : children.length === 0 ? (
          <div className="p-14 text-center text-slate-400">
            <UserPlus size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-xl font-semibold">No children registered yet</p>
            <p className="text-base mt-2">Click "Add Child" to register the first child.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {children.map(child => (
              <div key={child.id} className="flex items-center gap-4 px-6 py-5">
                <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 select-none">
                  {child.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-slate-800 truncate">{child.name}</p>
                  <p className="text-sm text-slate-400 mt-0.5 truncate">
                    {child.date_of_birth ? `DOB: ${format(parseISO(child.date_of_birth), 'd MMM yyyy')}` : 'DOB: Not set'}
                    {child.guardian_name && ` · ${child.guardian_name}`}
                    {child.guardian_contact && ` · ${child.guardian_contact}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(child)} className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="Edit"><Edit2 size={18} /></button>
                  <button onClick={() => setDeleteTarget(child)} className="p-2.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Remove"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modal.open} onClose={() => { if (!saving) setModal({ open: false }); }} title={modal.child ? 'Edit Child' : 'Add Child'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Field id="name" label="Full Name" required form={form} setForm={setForm} />
          <Field id="date_of_birth" label="Date of Birth" type="date" form={form} setForm={setForm} />
          <Field id="guardian_name" label="Parent / Guardian Name" form={form} setForm={setForm} />
          <Field id="guardian_contact" label="Contact Number" type="tel" form={form} setForm={setForm} />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal({ open: false })} disabled={saving}
              className="flex items-center gap-2 px-5 py-3.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-base font-medium transition-colors">
              <X size={18} /> Cancel
            </button>
            <button type="submit" disabled={saving || !form.name.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-40 text-base font-semibold transition-colors">
              <Check size={18} />
              {saving ? 'Saving…' : modal.child ? 'Save Changes' : 'Add Child'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove Child">
        <p className="text-lg text-slate-600 mb-6">
          Are you sure you want to remove <strong>{deleteTarget?.name}</strong>? This will also delete all their attendance records.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteTarget(null)} className="flex-1 px-5 py-3.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-base font-medium">Cancel</button>
          <button onClick={handleDelete} className="flex-1 px-5 py-3.5 bg-red-600 text-white rounded-xl hover:bg-red-700 text-base font-semibold">Remove</button>
        </div>
      </Modal>
    </div>
  );
};
