import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, UserPlus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { api } from '../api';
import { Modal } from '../components/Modal';
import type { Child } from '../types';

interface FormState {
  name: string;
  date_of_birth: string;
  guardian_name: string;
  guardian_contact: string;
}

const emptyForm: FormState = {
  name: '',
  date_of_birth: '',
  guardian_name: '',
  guardian_contact: '',
};

export const Children: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; child?: Child }>({ open: false });
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null);

  const load = () => {
    api.children.getAll().then(setChildren).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setModal({ open: true });
  };

  const openEdit = (child: Child) => {
    setForm({
      name: child.name,
      date_of_birth: child.date_of_birth || '',
      guardian_name: child.guardian_name || '',
      guardian_contact: child.guardian_contact || '',
    });
    setModal({ open: true, child });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (modal.child) {
        await api.children.update(modal.child.id, form);
      } else {
        await api.children.create(form);
      }
      setModal({ open: false });
      load();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.children.remove(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  const Field = ({
    id, label, type = 'text', required = false,
  }: {
    id: keyof FormState; label: string; type?: string; required?: boolean;
  }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={form[id]}
        onChange={e => setForm(prev => ({ ...prev, [id]: e.target.value }))}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
      />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Children</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm"
        >
          <Plus size={16} />
          Add Child
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading…</div>
        ) : children.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <UserPlus size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No children registered yet</p>
            <p className="text-sm mt-1">Click "Add Child" to register the first child.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {children.map(child => (
              <div key={child.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold flex-shrink-0 select-none">
                  {child.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{child.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {child.date_of_birth
                      ? `DOB: ${format(parseISO(child.date_of_birth), 'd MMM yyyy')}`
                      : 'DOB: Not set'}
                    {child.guardian_name && ` · ${child.guardian_name}`}
                    {child.guardian_contact && ` · ${child.guardian_contact}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(child)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(child)}
                    className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      <Modal
        isOpen={modal.open}
        onClose={() => { if (!saving) setModal({ open: false }); }}
        title={modal.child ? 'Edit Child' : 'Add Child'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Field id="name" label="Full Name" required />
          <Field id="date_of_birth" label="Date of Birth" type="date" />
          <Field id="guardian_name" label="Parent / Guardian Name" />
          <Field id="guardian_contact" label="Contact Number" type="tel" />
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModal({ open: false })}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
            >
              <X size={16} /> Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.name.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-40 text-sm font-medium transition-colors"
            >
              <Check size={16} />
              {saving ? 'Saving…' : modal.child ? 'Save Changes' : 'Add Child'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove Child"
      >
        <p className="text-slate-600 mb-6">
          Are you sure you want to remove <strong>{deleteTarget?.name}</strong>? This will also delete all their attendance records.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteTarget(null)}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-medium"
          >
            Remove
          </button>
        </div>
      </Modal>
    </div>
  );
};
