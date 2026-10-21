import React, { useState } from 'react';
import { X, Plus, Trash2, Landmark, Phone, Star, Tag, Check } from 'lucide-react';
import { Contact, PhoneNumber, BankAccount, Folder, PhoneLabel } from '../types/directory';
import { Biometrics } from '../services/biometrics';
import { useToast } from './ToastFeedback';

interface AddEditContactModalProps {
  contactToEdit?: Contact;
  existingPhones?: PhoneNumber[];
  existingBanks?: BankAccount[];
  folders: Folder[];
  onClose: () => void;
  onSave: (
    contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'interactionCount'>,
    phones: Array<Omit<PhoneNumber, 'id' | 'contactId'>>,
    banks: Array<Omit<BankAccount, 'id' | 'contactId'>>
  ) => void;
}

const PHONE_LABELS: PhoneLabel[] = ['Mobile', 'iPhone', 'Work', 'Home', 'Main', 'Other'];

const POPULAR_BANKS = [
  'Chase Bank',
  'Bank of America',
  'Wells Fargo',
  'Citibank',
  'Capital One',
  'Barclays',
  'HSBC',
  'Revolut',
  'Monzo',
  'Fidelity Investments',
  'Charles Schwab',
  'Silicon Valley Bank',
];

const AVATAR_OPTIONS = ['👨🏻', '👩🏻', '👨🏼', '👩🏼', '👨🏽', '👩🏽', '👨🏾', '👩🏾', '👨🏿', '👩🏿', '🧑🏼‍💻', '👩🏻‍💻', '👨🏽‍💼', '👩🏼‍🎨', '🩺', '⚡️', '🌟', '💼'];

export const AddEditContactModal: React.FC<AddEditContactModalProps> = ({
  contactToEdit,
  existingPhones = [],
  existingBanks = [],
  folders,
  onClose,
  onSave,
}) => {
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState(contactToEdit?.firstName || '');
  const [lastName, setLastName] = useState(contactToEdit?.lastName || '');
  const [nickname, setNickname] = useState(contactToEdit?.nickname || '');
  const [avatar, setAvatar] = useState(contactToEdit?.avatar || '👤');
  const [isFavorite, setIsFavorite] = useState(contactToEdit?.isFavorite || false);
  const [folderId, setFolderId] = useState(contactToEdit?.folderId || '');
  const [notes, setNotes] = useState(contactToEdit?.notes || '');

  // Dynamic phone numbers
  const [phoneList, setPhoneList] = useState<Array<{ id: string; label: PhoneLabel; number: string; isPrimary: boolean }>>(
    existingPhones.length > 0
      ? existingPhones.map(p => ({ id: p.id, label: p.label, number: p.number, isPrimary: p.isPrimary }))
      : [{ id: 'p-new-1', label: 'Mobile', number: '', isPrimary: true }]
  );

  // Dynamic bank accounts
  const [bankList, setBankList] = useState<Array<{
    id: string;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    branch: string;
    routingNumber: string;
    notes: string;
    isPrimary: boolean;
    isFavorite: boolean;
  }>>(
    existingBanks.length > 0
      ? existingBanks.map(b => ({
          id: b.id,
          bankName: b.bankName,
          accountNumber: b.accountNumber,
          accountHolderName: b.accountHolderName,
          branch: b.branch || '',
          routingNumber: b.routingNumber || '',
          notes: b.notes || '',
          isPrimary: b.isPrimary,
          isFavorite: b.isFavorite ?? false,
        }))
      : []
  );

  const addPhoneField = () => {
    Biometrics.triggerHaptic('light');
    setPhoneList(prev => [
      ...prev,
      {
        id: `p-new-${Date.now()}`,
        label: prev.length === 0 ? 'Mobile' : 'Work',
        number: '',
        isPrimary: prev.length === 0,
      },
    ]);
  };

  const removePhoneField = (id: string) => {
    Biometrics.triggerHaptic('light');
    setPhoneList(prev => prev.filter(p => p.id !== id));
  };

  const updatePhoneField = (id: string, field: 'label' | 'number' | 'isPrimary', value: any) => {
    setPhoneList(prev =>
      prev.map(p => {
        if (p.id === id) {
          return { ...p, [field]: value };
        }
        if (field === 'isPrimary' && value === true) {
          return { ...p, isPrimary: false };
        }
        return p;
      })
    );
  };

  const addBankField = () => {
    Biometrics.triggerHaptic('light');
    setBankList(prev => [
      ...prev,
      {
        id: `b-new-${Date.now()}`,
        bankName: '',
        accountNumber: '',
        accountHolderName: `${firstName} ${lastName}`.trim(),
        branch: '',
        routingNumber: '',
        notes: '',
        isPrimary: prev.length === 0,
        isFavorite: false,
      },
    ]);
  };

  const removeBankField = (id: string) => {
    Biometrics.triggerHaptic('light');
    setBankList(prev => prev.filter(b => b.id !== id));
  };

  const updateBankField = (id: string, field: string, value: any) => {
    setBankList(prev =>
      prev.map(b => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      showToast('First Name Required', 'Please provide at least a first name', 'error');
      return;
    }

    // Filter valid phones (must have at least digits)
    const validPhones = phoneList
      .filter(p => p.number.trim().length > 0)
      .map(p => ({
        label: p.label,
        number: p.number.trim(),
        isPrimary: p.isPrimary,
      }));

    // Filter valid banks
    const validBanks = bankList
      .filter(b => b.accountNumber.trim().length > 0 || b.bankName.trim().length > 0)
      .map(b => ({
        bankName: b.bankName.trim() || 'Bank',
        accountNumber: b.accountNumber.trim(),
        accountHolderName: b.accountHolderName.trim() || `${firstName} ${lastName}`.trim(),
        branch: b.branch.trim() || undefined,
        routingNumber: b.routingNumber.trim() || undefined,
        notes: b.notes.trim() || undefined,
        isPrimary: b.isPrimary,
        isFavorite: b.isFavorite,
      }));

    onSave(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nickname: nickname.trim() || undefined,
        avatar,
        isFavorite,
        folderId: folderId || undefined,
        notes: notes.trim() || undefined,
      },
      validPhones,
      validBanks
    );

    showToast(
      contactToEdit ? 'Contact Updated' : 'Contact Created',
      `${firstName} ${lastName}`,
      'success'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[94vh] sm:max-h-[88vh] flex flex-col bg-slate-50 dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800">
        {/* Navigation Bar Header (iOS modal style) */}
        <div className="shrink-0 px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            onClick={onClose}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity"
          >
            Cancel
          </button>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            {contactToEdit ? 'Edit Contact' : 'New Contact'}
          </h2>
          <button
            onClick={handleSubmit}
            disabled={!firstName.trim()}
            className="text-sm font-bold text-blue-600 dark:text-blue-400 disabled:opacity-40 hover:opacity-80 transition-opacity"
          >
            Done
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-4 py-4 space-y-4">
          {/* Avatar selector & Basic Info */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex flex-col items-center pb-2">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-3xl shadow-inner mb-2">
                {avatar}
              </div>
              <p className="text-[11px] text-slate-400 mb-2">Choose Avatar / Emoji</p>
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 no-scrollbar">
                {AVATAR_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-transform ${
                      avatar === emoji ? 'bg-blue-100 dark:bg-blue-900 scale-110 ring-2 ring-blue-500' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <input
                type="text"
                placeholder="First Name *"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                placeholder="Nickname (e.g. Mom, Dave, Lawyer)"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Folder & Favorite Toggles */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-4">
              <div className="flex-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Folder / Label
                </label>
                <select
                  value={folderId}
                  onChange={e => setFolderId(e.target.value)}
                  className="w-full text-xs py-2 px-2.5 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <option value="">No Folder (Uncategorized)</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                    isFavorite
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                  <span>Favorite</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Multiple Phone Numbers Section */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Phone Numbers
                </span>
              </div>
              <button
                type="button"
                onClick={addPhoneField}
                className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:opacity-80"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Number</span>
              </button>
            </div>

            <div className="space-y-2">
              {phoneList.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-2">
                  <select
                    value={p.label}
                    onChange={e => updatePhoneField(p.id, 'label', e.target.value)}
                    className="w-24 text-xs py-2 px-2 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    {PHONE_LABELS.map(lbl => (
                      <option key={lbl} value={lbl}>
                        {lbl}
                      </option>
                    ))}
                  </select>

                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={p.number}
                    onChange={e => updatePhoneField(p.id, 'number', e.target.value)}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />

                  {phoneList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhoneField(p.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Multiple Bank Accounts Section */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Bank Accounts
                </span>
              </div>
              <button
                type="button"
                onClick={addBankField}
                className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:opacity-80"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Bank</span>
              </button>
            </div>

            {bankList.length === 0 ? (
              <p className="text-xs text-slate-400 py-1">
                No bank accounts added. Click "+ Add Bank" to save account & routing numbers.
              </p>
            ) : (
              <div className="space-y-3">
                {bankList.map((b, idx) => (
                  <div
                    key={b.id}
                    className="p-3 bg-slate-50 dark:bg-slate-900/70 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">
                          Account #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateBankField(b.id, 'isFavorite', !b.isFavorite)}
                          className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                            b.isFavorite
                              ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium'
                              : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500'
                          }`}
                        >
                          <Star className={`w-3 h-3 ${b.isFavorite ? 'fill-current' : ''}`} />
                          <span>{b.isFavorite ? 'Favorite' : 'Mark Favorite'}</span>
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBankField(b.id)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="text"
                          placeholder="Bank Name (e.g. Chase)"
                          value={b.bankName}
                          onChange={e => updateBankField(b.id, 'bankName', e.target.value)}
                          list="bank-suggestions"
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700"
                        />
                        <datalist id="bank-suggestions">
                          {POPULAR_BANKS.map(bn => (
                            <option key={bn} value={bn} />
                          ))}
                        </datalist>
                      </div>

                      <input
                        type="text"
                        placeholder="Account Number / IBAN"
                        value={b.accountNumber}
                        onChange={e => updateBankField(b.id, 'accountNumber', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Beneficiary / Holder Name"
                        value={b.accountHolderName}
                        onChange={e => updateBankField(b.id, 'accountHolderName', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700"
                      />

                      <input
                        type="text"
                        placeholder="Routing / Sort Code"
                        value={b.routingNumber}
                        onChange={e => updateBankField(b.id, 'routingNumber', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Account Note (e.g. Wire only, rent transfers)"
                      value={b.notes}
                      onChange={e => updateBankField(b.id, 'notes', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-[11px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
              Notes & Address
            </span>
            <textarea
              rows={3}
              placeholder="Private notes, home address, birthday, etc."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </form>
      </div>
    </div>
  );
};
