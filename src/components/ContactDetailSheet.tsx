import React, { useState } from 'react';
import {
  Phone,
  Copy,
  Star,
  Edit2,
  Trash2,
  X,
  Landmark,
  Eye,
  EyeOff,
  Clock,
  Share2,
  Check,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { Contact, PhoneNumber, BankAccount, Folder, CallLog } from '../types/directory';
import { useToast } from './ToastFeedback';
import { Biometrics } from '../services/biometrics';
import { KeychainService } from '../services/encryption';

interface ContactDetailSheetProps {
  contact: Contact;
  phoneNumbers: PhoneNumber[];
  bankAccounts: BankAccount[];
  folder?: Folder;
  callLogs: CallLog[];
  onClose: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
  onToggleFavorite: (contactId: string) => void;
  onToggleBankFavorite?: (bankId: string) => void;
  onInitiateCall: (contact: Contact, phone: PhoneNumber) => void;
}

export const ContactDetailSheet: React.FC<ContactDetailSheetProps> = ({
  contact,
  phoneNumbers,
  bankAccounts,
  folder,
  callLogs,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleBankFavorite,
  onInitiateCall,
}) => {
  const { showToast } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied ${label}`, text, 'copy');
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleShareVCard = () => {
    const vCardLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${contact.firstName} ${contact.lastName}`,
      `N:${contact.lastName};${contact.firstName};;;`,
      contact.nickname ? `NICKNAME:${contact.nickname}` : '',
      ...phoneNumbers.map(p => `TEL;TYPE=${p.label.toUpperCase()}:${p.number}`),
      contact.notes ? `NOTE:${contact.notes}` : '',
      'END:VCARD',
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(vCardLines);
    showToast('Contact vCard Copied', 'Ready to paste or import', 'copy');
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-lg max-h-[92vh] sm:max-h-[85vh] flex flex-col bg-slate-50 dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800">
        {/* Top iOS Drag Bar & Header */}
        <div className="shrink-0 px-4 pt-3 pb-2 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800">
          <div className="w-8" />
          <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-4 py-4 space-y-5">
          {/* Hero Profile Lockup */}
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-md ring-4 ring-white dark:ring-slate-800 ${
                contact.avatarBg || 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              }`}
            >
              {contact.avatar || contact.firstName.charAt(0)}
            </div>

            <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">
              {contact.firstName} {contact.lastName}
            </h2>

            {contact.nickname && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                "{contact.nickname}"
              </p>
            )}

            {folder && (
              <div
                className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${folder.color}18`,
                  color: folder.color,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: folder.color }}
                />
                <span>{folder.name}</span>
              </div>
            )}

            {/* iOS Action Buttons Bar (Call, Favorite, Share, Edit) */}
            <div className="grid grid-cols-4 gap-3 w-full max-w-xs mt-4">
              {/* Call Primary */}
              <button
                disabled={phoneNumbers.length === 0}
                onClick={() => {
                  if (phoneNumbers.length > 0) {
                    onInitiateCall(contact, phoneNumbers[0]);
                  }
                }}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-blue-400 transition-all disabled:opacity-40"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  Call
                </span>
              </button>

              {/* Toggle Favorite */}
              <button
                onClick={() => onToggleFavorite(contact.id)}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-amber-400 transition-all"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    contact.isFavorite
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                  }`}
                >
                  <Star className={`w-4 h-4 ${contact.isFavorite ? 'fill-current' : ''}`} />
                </div>
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  {contact.isFavorite ? 'Favorite' : 'Star'}
                </span>
              </button>

              {/* Share vCard */}
              <button
                onClick={handleShareVCard}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-blue-400 transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  Share
                </span>
              </button>

              {/* Edit */}
              <button
                onClick={() => onEdit(contact)}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-slate-400 transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  Edit
                </span>
              </button>
            </div>
          </div>

          {/* Section: Multiple Phone Numbers */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60 mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Phone Numbers ({phoneNumbers.length})
              </span>
            </div>

            {phoneNumbers.length === 0 ? (
              <p className="text-xs text-slate-400 py-1">No phone numbers saved.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {phoneNumbers.map(p => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {p.label}
                        </span>
                        {p.isPrimary && (
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded font-medium">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                        {p.number}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(p.number, `${p.label} Number`, `phone-${p.id}`)}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5"
                      >
                        {copiedKey === `phone-${p.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => onInitiateCall(contact, p)}
                        className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-xs transition-colors"
                        title="Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Bank Accounts (Minimalist: Bank Name + Account # + Star + Copy) */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60 mb-2">
              <div className="flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Bank Accounts ({bankAccounts.length})
                </span>
              </div>
            </div>

            {bankAccounts.length === 0 ? (
              <p className="text-xs text-slate-400 py-1">No bank accounts linked.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {[...bankAccounts]
                  .sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0))
                  .map(b => (
                    <div key={b.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                            {b.bankName}
                          </span>
                          {b.isFavorite && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span>Favorite</span>
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold font-mono text-slate-900 dark:text-slate-100 mt-0.5 tracking-tight truncate">
                          {b.accountNumber}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Favorite Bank Toggle */}
                        <button
                          onClick={() => {
                            onToggleBankFavorite?.(b.id);
                            Biometrics.triggerHaptic('light');
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            b.isFavorite
                              ? 'text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950/50'
                              : 'text-slate-300 dark:text-slate-600 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                          title={b.isFavorite ? 'Unfavorite Bank Account' : 'Mark Bank Account as Favorite'}
                        >
                          <Star className={`w-4 h-4 ${b.isFavorite ? 'fill-current' : ''}`} />
                        </button>

                        {/* Copy Account Number Button */}
                        <button
                          onClick={() => handleCopy(b.accountNumber, `${b.bankName} Account Number`, `bank-${b.id}`)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
                          title="Copy Account Number"
                        >
                          {copiedKey === `bank-${b.id}` ? (
                            <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Section: Notes */}
          {contact.notes && (
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                Notes
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {contact.notes}
              </p>
            </div>
          )}

          {/* Section: Call History with this Contact */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60 mb-2">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Call History ({callLogs.length})
                </span>
              </div>
            </div>

            {callLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-1">No logged calls with this contact.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {callLogs.map(log => (
                  <div key={log.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            log.type === 'missed'
                              ? 'bg-rose-500'
                              : log.type === 'outgoing'
                              ? 'bg-emerald-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">
                          {log.type} Call
                        </span>
                        {log.durationSeconds > 0 && (
                          <span className="text-slate-400">
                            ({Math.floor(log.durationSeconds / 60)}m {log.durationSeconds % 60}s)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{log.phoneNumber}</p>
                      {log.notes && <p className="text-[11px] text-slate-500 italic mt-0.5">{log.notes}</p>}
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delete Contact Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (window.confirm(`Delete ${contact.firstName} ${contact.lastName}? This cannot be undone.`)) {
                  onDelete(contact.id);
                  onClose();
                }
              }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Contact</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
