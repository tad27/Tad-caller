import React, { useState } from 'react';
import { Landmark, Search, Copy, Check, Eye, EyeOff, ShieldCheck, User } from 'lucide-react';
import { BankAccount, Contact } from '../types/directory';
import { KeychainService } from '../services/encryption';
import { useToast } from './ToastFeedback';
import { Star } from 'lucide-react';
import { Biometrics } from '../services/biometrics';

interface BankVaultTabProps {
  bankAccounts: BankAccount[];
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onToggleBankFavorite?: (bankId: string) => void;
}

export const BankVaultTab: React.FC<BankVaultTabProps> = ({
  bankAccounts,
  contacts,
  onSelectContact,
  onToggleBankFavorite,
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [unmaskedIds, setUnmaskedIds] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleMask = (id: string) => {
    setUnmaskedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied ${label}`, text, 'copy');
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const filteredBanks = bankAccounts.filter(bank => {
    const contact = contacts.find(c => c.id === bank.contactId);
    const q = searchQuery.toLowerCase();
    const contactName = contact ? `${contact.firstName} ${contact.lastName}`.toLowerCase() : '';
    return (
      bank.bankName.toLowerCase().includes(q) ||
      bank.accountNumber.includes(q) ||
      bank.accountHolderName.toLowerCase().includes(q) ||
      (bank.routingNumber && bank.routingNumber.includes(q)) ||
      contactName.includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="shrink-0 px-4 pt-3 pb-3 border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Bank Vault</h1>
            <p className="text-xs text-slate-400">Encrypted personal directory accounts</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AES-256 GCM</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search bank name, account holder, or digits..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-xs bg-slate-200/60 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
      </div>

      {/* List of Bank Accounts */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {filteredBanks.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Landmark className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-medium">No bank accounts match query</p>
            <p className="text-xs text-slate-400 mt-1">
              Add bank accounts inside any contact card to store them securely.
            </p>
          </div>
        ) : (
          filteredBanks.map(b => {
            const contact = contacts.find(c => c.id === b.contactId);
            const isUnmasked = unmaskedIds[b.id] ?? false;

            return (
              <div
                key={b.id}
                className="p-3.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-slate-300 transition-all space-y-2.5"
              >
                {/* Bank Header + Associated Contact */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {b.bankName}
                      </h3>
                      {b.branch && (
                        <p className="text-[11px] text-slate-400">{b.branch}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onToggleBankFavorite && (
                      <button
                        onClick={() => {
                          onToggleBankFavorite(b.id);
                          Biometrics.triggerHaptic('light');
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          b.isFavorite
                            ? 'text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950/40'
                            : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                        title={b.isFavorite ? 'Unfavorite Bank Account' : 'Mark Bank Account as Favorite'}
                      >
                        <Star className={`w-3.5 h-3.5 ${b.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                    )}

                    {contact && (
                      <button
                        onClick={() => onSelectContact(contact)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        <User className="w-3 h-3 text-blue-500" />
                        <span>{contact.firstName} {contact.lastName}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Account Number & Copy */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Account Number / IBAN
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 tracking-wider">
                      {isUnmasked
                        ? b.accountNumber
                        : KeychainService.maskAccountNumber(b.accountNumber)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleMask(b.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                      title={isUnmasked ? 'Mask' : 'Reveal'}
                    >
                      {isUnmasked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() =>
                        handleCopy(b.accountNumber, `${b.bankName} Account`, `bank-${b.id}`)
                      }
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1 shadow-xs transition-colors"
                    >
                      {copiedKey === `bank-${b.id}` ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Account Holder & Routing */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Account Holder</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                      {b.accountHolderName}
                    </span>
                  </div>

                  {b.routingNumber && (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Routing / Sort</span>
                        <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                          {b.routingNumber}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleCopy(b.routingNumber!, 'Routing Code', `route-${b.id}`)
                        }
                        className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
                        title="Copy Routing Number"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {b.notes && (
                  <p className="text-[11px] text-slate-400 italic pt-0.5">{b.notes}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
