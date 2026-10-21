import React from 'react';
import { Phone, Star, Landmark, Copy, ChevronRight } from 'lucide-react';
import { Contact, PhoneNumber, BankAccount, Folder } from '../types/directory';
import { useToast } from './ToastFeedback';
import { Biometrics } from '../services/biometrics';

interface ContactRowProps {
  contact: Contact;
  phoneNumbers: PhoneNumber[];
  bankAccounts: BankAccount[];
  folder?: Folder;
  onSelect: (contact: Contact) => void;
  onToggleFavorite: (contactId: string, e: React.MouseEvent) => void;
  onInitiateCall: (contact: Contact, phone: PhoneNumber, e: React.MouseEvent) => void;
}

export const ContactRow: React.FC<ContactRowProps> = ({
  contact,
  phoneNumbers,
  bankAccounts,
  folder,
  onSelect,
  onToggleFavorite,
  onInitiateCall,
}) => {
  const { showToast } = useToast();
  const primaryPhone = phoneNumbers.find(p => p.isPrimary) || phoneNumbers[0];

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (primaryPhone) {
      navigator.clipboard.writeText(primaryPhone.number);
      showToast('Phone Number Copied', primaryPhone.number, 'copy');
    }
  };

  const handleCopyPrimaryBank = (e: React.MouseEvent) => {
    e.stopPropagation();
    const primaryBank = bankAccounts.find(b => b.isPrimary) || bankAccounts[0];
    if (primaryBank) {
      navigator.clipboard.writeText(primaryBank.accountNumber);
      showToast('Bank Account Copied', `${primaryBank.bankName}: ${primaryBank.accountNumber}`, 'copy');
    }
  };

  return (
    <div
      onClick={() => onSelect(contact)}
      className="group relative flex items-center justify-between px-4 py-3.5 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-800/80 last:border-b-0"
    >
      {/* Left: Avatar & Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center text-lg font-semibold shrink-0 shadow-sm ${
            contact.avatarBg || 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
          }`}
        >
          {contact.avatar || contact.firstName.charAt(0)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {contact.firstName} {contact.lastName}
            </span>
            {contact.nickname && (
              <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
                "{contact.nickname}"
              </span>
            )}
            {folder && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                style={{
                  backgroundColor: `${folder.color}15`,
                  color: folder.color,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: folder.color }}
                />
                {folder.name}
              </span>
            )}
          </div>

          {/* Subtitle: Phone + Bank count */}
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {primaryPhone ? (
              <span className="font-mono text-[11px] truncate">{primaryPhone.number}</span>
            ) : (
              <span className="italic text-slate-400">No phone</span>
            )}

            {bankAccounts.length > 0 && (
              <>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <Landmark className="w-3 h-3" />
                  <span>{bankAccounts.length} {bankAccounts.length === 1 ? 'Bank' : 'Banks'}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Quick Call Button */}
        {primaryPhone && (
          <button
            onClick={e => onInitiateCall(contact, primaryPhone, e)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 transition-colors"
            title={`Call ${primaryPhone.number}`}
          >
            <Phone className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Quick Copy Primary Phone */}
        {primaryPhone && (
          <button
            onClick={handleCopyPhone}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            title="Copy primary phone number"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Star Favorite Toggle */}
        <button
          onClick={e => {
            e.stopPropagation();
            onToggleFavorite(contact.id, e);
            Biometrics.triggerHaptic('light');
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            contact.isFavorite
              ? 'text-amber-500 hover:text-amber-600'
              : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'
          }`}
          title={contact.isFavorite ? 'Unfavorite' : 'Mark as Favorite'}
        >
          <Star className={`w-4 h-4 ${contact.isFavorite ? 'fill-current' : ''}`} />
        </button>

        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
};
