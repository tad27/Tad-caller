import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  PhoneCall,
  Landmark,
  Settings,
  Plus,
  Cloud,
  Check,
  Search,
  Phone,
  X,
} from 'lucide-react';
import {
  DirectoryState,
  Contact,
  PhoneNumber,
  BankAccount,
  Folder,
  CallLog,
  SmartListType,
} from './types/directory';
import { StorageService } from './services/storage';
import { Biometrics } from './services/biometrics';
import { CloudKitSync } from './services/cloudKitSync';
import { ToastProvider, useToast } from './components/ToastFeedback';
import { DeviceFrame } from './components/DeviceFrame';
import { FaceIdLockScreen } from './components/FaceIdLockScreen';
import { QuickSearchFilter } from './components/QuickSearchFilter';
import { ContactRow } from './components/ContactRow';
import { ContactDetailSheet } from './components/ContactDetailSheet';
import { AddEditContactModal } from './components/AddEditContactModal';
import { CallHistoryTab } from './components/CallHistoryTab';
import { BankVaultTab } from './components/BankVaultTab';
import { SettingsTab } from './components/SettingsTab';
import { FolderManagerModal } from './components/FolderManagerModal';
import { SwiftCodeViewerModal } from './components/SwiftCodeViewerModal';
import { OfflineIndicator } from './components/OfflineIndicator';

type ActiveTab = 'contacts' | 'recents' | 'banks' | 'settings';

export function DirectoryAppContent() {
  const { showToast } = useToast();

  // Load persistent state
  const [state, setState] = useState<DirectoryState>(() => StorageService.getState());

  // Biometric lock state
  const [isLocked, setIsLocked] = useState<boolean>(() => state.settings.biometricEnabled);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('contacts');

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [smartFilter, setSmartFilter] = useState<SmartListType>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Modals & Sheets
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isFolderManagerOpen, setIsFolderManagerOpen] = useState(false);
  const [isSwiftCodeModalOpen, setIsSwiftCodeModalOpen] = useState(false);

  // Dial confirmation prompt state (iOS Call Sheet simulation)
  const [dialTarget, setDialTarget] = useState<{ contact: Contact; phone: PhoneNumber } | null>(null);

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Sync state changes with local storage
  const updateStateAndPersist = (updater: (prev: DirectoryState) => DirectoryState) => {
    setState(prev => {
      const next = updater(prev);
      StorageService.saveState(next);
      return next;
    });
  };

  // Lock when returning from idle/background if enabled
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (document.hidden && state.settings.biometricEnabled) {
        const timeoutMs = state.settings.biometricTimeoutMinutes * 60000;
        if (timeoutMs === 0) {
          setIsLocked(true);
        } else {
          timeout = setTimeout(() => {
            setIsLocked(true);
          }, timeoutMs);
        }
      } else {
        clearTimeout(timeout);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(timeout);
    };
  }, [state.settings.biometricEnabled, state.settings.biometricTimeoutMinutes]);

  // Handle call initiation
  const handleInitiateCall = (contact: Contact, phone: PhoneNumber, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDialTarget({ contact, phone });
  };

  const confirmCall = () => {
    if (!dialTarget) return;
    const { contact, phone } = dialTarget;

    // Trigger genuine iOS tel:// URL scheme
    const cleanedDigits = phone.number.replace(/[^\d+]/g, '');
    window.location.href = `tel://${cleanedDigits}`;

    // Auto-create CallLog record & update interaction metrics
    const newLog: CallLog = {
      id: `cl-${Date.now()}`,
      contactId: contact.id,
      contactName: `${contact.firstName} ${contact.lastName}`,
      phoneNumber: phone.number,
      type: 'outgoing',
      timestamp: new Date().toISOString(),
      durationSeconds: Math.floor(Math.random() * 90) + 30, // simulated call duration
      notes: `Outgoing call to ${phone.label} line`,
    };

    updateStateAndPersist(prev => ({
      ...prev,
      callLogs: [newLog, ...prev.callLogs],
      contacts: prev.contacts.map(c =>
        c.id === contact.id
          ? {
              ...c,
              lastInteractedAt: new Date().toISOString(),
              interactionCount: c.interactionCount + 1,
            }
          : c
      ),
    }));

    showToast('Calling...', `${contact.firstName} (${phone.label})`, 'call');
    setDialTarget(null);
  };

  // Toggle Contact Favorite
  const handleToggleFavorite = (contactId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    updateStateAndPersist(prev => ({
      ...prev,
      contacts: prev.contacts.map(c =>
        c.id === contactId ? { ...c, isFavorite: !c.isFavorite } : c
      ),
    }));
  };

  // Toggle Bank Account Favorite
  const handleToggleBankFavorite = (bankId: string) => {
    updateStateAndPersist(prev => {
      const targetBank = prev.bankAccounts.find(b => b.id === bankId);
      const nextFav = !targetBank?.isFavorite;
      showToast(
        nextFav ? 'Favorited Bank Account' : 'Removed from Favorites',
        targetBank?.bankName || 'Bank Account',
        'success'
      );
      return {
        ...prev,
        bankAccounts: prev.bankAccounts.map(b =>
          b.id === bankId ? { ...b, isFavorite: nextFav } : b
        ),
      };
    });
  };

  // Delete Contact
  const handleDeleteContact = (contactId: string) => {
    updateStateAndPersist(prev => ({
      ...prev,
      contacts: prev.contacts.filter(c => c.id !== contactId),
      phoneNumbers: prev.phoneNumbers.filter(p => p.contactId !== contactId),
      bankAccounts: prev.bankAccounts.filter(b => b.contactId !== contactId),
      callLogs: prev.callLogs.filter(cl => cl.contactId !== contactId),
    }));
    setSelectedContact(null);
    showToast('Contact Deleted', 'Removed from directory', 'success');
  };

  // Save Contact (Create or Edit)
  const handleSaveContact = (
    contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'interactionCount'>,
    phones: Array<Omit<PhoneNumber, 'id' | 'contactId'>>,
    banks: Array<Omit<BankAccount, 'id' | 'contactId'>>
  ) => {
    if (editingContact) {
      // Edit existing
      const cId = editingContact.id;
      const updatedContact: Contact = {
        ...editingContact,
        ...contactData,
        updatedAt: new Date().toISOString(),
      };

      const newPhones: PhoneNumber[] = phones.map((p, idx) => ({
        id: `p-${cId}-${idx}-${Date.now()}`,
        contactId: cId,
        label: p.label,
        number: p.number,
        isPrimary: p.isPrimary,
      }));

      const newBanks: BankAccount[] = banks.map((b, idx) => ({
        id: `b-${cId}-${idx}-${Date.now()}`,
        contactId: cId,
        bankName: b.bankName,
        accountNumber: b.accountNumber,
        accountHolderName: b.accountHolderName,
        branch: b.branch,
        routingNumber: b.routingNumber,
        notes: b.notes,
        isPrimary: b.isPrimary,
        isFavorite: b.isFavorite ?? false,
      }));

      updateStateAndPersist(prev => ({
        ...prev,
        contacts: prev.contacts.map(c => (c.id === cId ? updatedContact : c)),
        phoneNumbers: [...prev.phoneNumbers.filter(p => p.contactId !== cId), ...newPhones],
        bankAccounts: [...prev.bankAccounts.filter(b => b.contactId !== cId), ...newBanks],
      }));

      setEditingContact(null);
    } else {
      // Create new
      const cId = `c-${Date.now()}`;
      const newContact: Contact = {
        id: cId,
        ...contactData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastInteractedAt: new Date().toISOString(),
        interactionCount: 0,
      };

      const newPhones: PhoneNumber[] = phones.map((p, idx) => ({
        id: `p-${cId}-${idx}`,
        contactId: cId,
        label: p.label,
        number: p.number,
        isPrimary: p.isPrimary,
      }));

      const newBanks: BankAccount[] = banks.map((b, idx) => ({
        id: `b-${cId}-${idx}`,
        contactId: cId,
        bankName: b.bankName,
        accountNumber: b.accountNumber,
        accountHolderName: b.accountHolderName,
        branch: b.branch,
        routingNumber: b.routingNumber,
        notes: b.notes,
        isPrimary: b.isPrimary,
        isFavorite: b.isFavorite ?? false,
      }));

      updateStateAndPersist(prev => ({
        ...prev,
        contacts: [newContact, ...prev.contacts],
        phoneNumbers: [...prev.phoneNumbers, ...newPhones],
        bankAccounts: [...prev.bankAccounts, ...newBanks],
      }));
    }
  };

  // Add Folder
  const handleAddFolder = (name: string, color: string) => {
    const newFolder: Folder = {
      id: `f-${Date.now()}`,
      name,
      icon: 'folder',
      color,
      isSystem: false,
    };
    updateStateAndPersist(prev => ({
      ...prev,
      folders: [...prev.folders, newFolder],
    }));
  };

  // Delete Folder
  const handleDeleteFolder = (folderId: string) => {
    updateStateAndPersist(prev => ({
      ...prev,
      folders: prev.folders.filter(f => f.id !== folderId),
      contacts: prev.contacts.map(c =>
        c.folderId === folderId ? { ...c, folderId: undefined } : c
      ),
    }));
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    }
  };

  // Filtered contacts calculation
  const filteredContacts = useMemo(() => {
    let list = [...state.contacts];

    // Smart list filtering
    if (smartFilter === 'favorites') {
      list = list.filter(c => c.isFavorite);
    } else if (smartFilter === 'recents') {
      list = list.sort(
        (a, b) =>
          new Date(b.lastInteractedAt || 0).getTime() -
          new Date(a.lastInteractedAt || 0).getTime()
      );
    } else if (smartFilter === 'most_used') {
      list = list.sort((a, b) => b.interactionCount - a.interactionCount);
    } else {
      // Default alphabetical sort by last name, then first name
      list = list.sort((a, b) => {
        const nameA = `${a.lastName} ${a.firstName}`.toLowerCase();
        const nameB = `${b.lastName} ${b.firstName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }

    // Folder filter
    if (selectedFolderId) {
      list = list.filter(c => c.folderId === selectedFolderId);
    }

    // Instant search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c => {
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
        const nickname = (c.nickname || '').toLowerCase();
        const notes = (c.notes || '').toLowerCase();

        // Match phone numbers
        const matchingPhones = state.phoneNumbers.filter(
          p => p.contactId === c.id && p.number.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
        );

        // Match bank accounts
        const matchingBanks = state.bankAccounts.filter(
          b =>
            b.contactId === c.id &&
            (b.bankName.toLowerCase().includes(q) ||
              b.accountNumber.includes(q) ||
              (b.routingNumber && b.routingNumber.includes(q)))
        );

        return (
          fullName.includes(q) ||
          nickname.includes(q) ||
          notes.includes(q) ||
          matchingPhones.length > 0 ||
          matchingBanks.length > 0
        );
      });
    }

    return list;
  }, [state.contacts, state.phoneNumbers, state.bankAccounts, smartFilter, selectedFolderId, searchQuery]);

  // Counts for smart list segments
  const counts = useMemo(
    () => ({
      all: state.contacts.length,
      favorites: state.contacts.filter(c => c.isFavorite).length,
      recents: state.contacts.filter(c => c.lastInteractedAt).length,
      most_used: state.contacts.filter(c => c.interactionCount > 0).length,
    }),
    [state.contacts]
  );

  return (
    <DeviceFrame
      isLocked={isLocked}
      onLockApp={() => setIsLocked(true)}
      onOpenSwiftCode={() => setIsSwiftCodeModalOpen(true)}
      theme={theme}
      onToggleTheme={() => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))}
    >
      <div className="relative flex-1 flex flex-col h-full overflow-hidden select-none">
        {/* Face ID Lock Overlay */}
        {isLocked && (
          <FaceIdLockScreen
            onUnlock={() => setIsLocked(false)}
            correctPasscode={state.settings.passcode}
          />
        )}

        {/* Tab 1: Contacts Directory */}
        {activeTab === 'contacts' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* iOS Top Bar */}
            <div className="shrink-0 px-4 pt-3 pb-2 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                  Tad Caller
                </h1>
                <p className="text-[11px] text-slate-400">
                  {state.contacts.length} contacts saved · Encrypted Vault
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsAddingContact(true)}
                  className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xs transition-colors"
                  title="Add New Contact"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Quick Search & Smart Filters */}
            <QuickSearchFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              smartFilter={smartFilter}
              onSmartFilterChange={setSmartFilter}
              selectedFolderId={selectedFolderId}
              onFolderChange={setSelectedFolderId}
              folders={state.folders}
              counts={counts}
              onOpenFolderManager={() => setIsFolderManagerOpen(true)}
            />

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filteredContacts.length === 0 ? (
                <div className="py-16 text-center text-slate-400 px-4">
                  <Search className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm font-semibold">No contacts found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try adjusting your search query or folder filter.
                  </p>
                  <button
                    onClick={() => setIsAddingContact(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
                  >
                    Create Contact
                  </button>
                </div>
              ) : (
                filteredContacts.map(contact => {
                  const phones = state.phoneNumbers.filter(p => p.contactId === contact.id);
                  const banks = state.bankAccounts.filter(b => b.contactId === contact.id);
                  const folder = state.folders.find(f => f.id === contact.folderId);

                  return (
                    <ContactRow
                      key={contact.id}
                      contact={contact}
                      phoneNumbers={phones}
                      bankAccounts={banks}
                      folder={folder}
                      onSelect={c => {
                        // Track view
                        updateStateAndPersist(prev => ({
                          ...prev,
                          contacts: prev.contacts.map(item =>
                            item.id === c.id
                              ? {
                                  ...item,
                                  lastInteractedAt: new Date().toISOString(),
                                  interactionCount: item.interactionCount + 1,
                                }
                              : item
                          ),
                        }));
                        setSelectedContact(c);
                      }}
                      onToggleFavorite={handleToggleFavorite}
                      onInitiateCall={handleInitiateCall}
                    />
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Recents / Call Logs */}
        {activeTab === 'recents' && (
          <CallHistoryTab
            callLogs={state.callLogs}
            contacts={state.contacts}
            phoneNumbers={state.phoneNumbers}
            onInitiateCall={handleInitiateCall}
            onAddManualCallLog={newLog => {
              updateStateAndPersist(prev => ({
                ...prev,
                callLogs: [{ id: `cl-${Date.now()}`, ...newLog }, ...prev.callLogs],
              }));
            }}
            onDeleteCallLog={logId => {
              updateStateAndPersist(prev => ({
                ...prev,
                callLogs: prev.callLogs.filter(l => l.id !== logId),
              }));
            }}
            onClearAllLogs={() => {
              updateStateAndPersist(prev => ({ ...prev, callLogs: [] }));
            }}
          />
        )}

        {/* Tab 3: Bank Vault */}
        {activeTab === 'banks' && (
          <BankVaultTab
            bankAccounts={state.bankAccounts}
            contacts={state.contacts}
            onSelectContact={contact => setSelectedContact(contact)}
            onToggleBankFavorite={handleToggleBankFavorite}
          />
        )}

        {/* Tab 4: Settings */}
        {activeTab === 'settings' && (
          <SettingsTab
            settings={state.settings}
            onUpdateSettings={newSettings => {
              updateStateAndPersist(prev => ({
                ...prev,
                settings: { ...prev.settings, ...newSettings },
              }));
            }}
            onLockAppNow={() => setIsLocked(true)}
            onOpenSwiftCodeModal={() => setIsSwiftCodeModalOpen(true)}
            onResetVault={() => {
              const fresh = StorageService.resetToDefaults();
              setState(fresh);
            }}
          />
        )}

        {/* Bottom Tab Bar (iOS Native Navigation) */}
        <nav className="shrink-0 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-4 items-center px-2 z-30">
          <button
            onClick={() => {
              setActiveTab('contacts');
              Biometrics.triggerHaptic('light');
            }}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'contacts'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-1">Directory</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('recents');
              Biometrics.triggerHaptic('light');
            }}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'recents'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
            }`}
          >
            <PhoneCall className="w-5 h-5" />
            <span className="text-[10px] mt-1">Recents</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('banks');
              Biometrics.triggerHaptic('light');
            }}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'banks'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
            }`}
          >
            <Landmark className="w-5 h-5" />
            <span className="text-[10px] mt-1">Bank Vault</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('settings');
              Biometrics.triggerHaptic('light');
            }}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'settings'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] mt-1">Settings</span>
          </button>
        </nav>

        {/* Contact Detail Sheet */}
        {selectedContact && (
          <ContactDetailSheet
            contact={selectedContact}
            phoneNumbers={state.phoneNumbers.filter(p => p.contactId === selectedContact.id)}
            bankAccounts={state.bankAccounts.filter(b => b.contactId === selectedContact.id)}
            folder={state.folders.find(f => f.id === selectedContact.folderId)}
            callLogs={state.callLogs.filter(cl => cl.contactId === selectedContact.id)}
            onClose={() => setSelectedContact(null)}
            onEdit={c => {
              setSelectedContact(null);
              setEditingContact(c);
            }}
            onDelete={handleDeleteContact}
            onToggleFavorite={handleToggleFavorite}
            onToggleBankFavorite={handleToggleBankFavorite}
            onInitiateCall={handleInitiateCall}
          />
        )}

        {/* Add Contact Modal */}
        {isAddingContact && (
          <AddEditContactModal
            folders={state.folders}
            onClose={() => setIsAddingContact(false)}
            onSave={handleSaveContact}
          />
        )}

        {/* Edit Contact Modal */}
        {editingContact && (
          <AddEditContactModal
            contactToEdit={editingContact}
            existingPhones={state.phoneNumbers.filter(p => p.contactId === editingContact.id)}
            existingBanks={state.bankAccounts.filter(b => b.contactId === editingContact.id)}
            folders={state.folders}
            onClose={() => setEditingContact(null)}
            onSave={handleSaveContact}
          />
        )}

        {/* Folder Manager Modal */}
        {isFolderManagerOpen && (
          <FolderManagerModal
            folders={state.folders}
            onClose={() => setIsFolderManagerOpen(false)}
            onAddFolder={handleAddFolder}
            onDeleteFolder={handleDeleteFolder}
          />
        )}

        {/* Swift / SwiftUI Codebase Viewer Modal */}
        {isSwiftCodeModalOpen && (
          <SwiftCodeViewerModal onClose={() => setIsSwiftCodeModalOpen(false)} />
        )}

        {/* Simulated iOS Call Action Sheet */}
        {dialTarget && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-sm space-y-2 animate-in slide-in-from-bottom duration-200">
              <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl p-4 text-center shadow-2xl border border-white/20">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Call {dialTarget.contact.firstName} {dialTarget.contact.lastName}
                </p>
                <p className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {dialTarget.phone.number}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Label: {dialTarget.phone.label}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <button
                    onClick={confirmCall}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-4 h-4 fill-current" />
                    <span>Dial Number (tel://)</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => setDialTarget(null)}
                className="w-full py-3 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold text-sm rounded-2xl shadow-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* PWA Offline Connectivity Indicator */}
        <OfflineIndicator />
      </div>
    </DeviceFrame>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <DirectoryAppContent />
    </ToastProvider>
  );
}
