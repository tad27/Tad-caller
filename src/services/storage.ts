import {
  DirectoryState,
  Contact,
  PhoneNumber,
  BankAccount,
  Folder,
  CallLog,
  AppSettings,
} from '../types/directory';
import {
  INITIAL_CONTACTS,
  INITIAL_PHONE_NUMBERS,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_FOLDERS,
  INITIAL_CALL_LOGS,
  DEFAULT_SETTINGS,
} from '../data/seedData';

const STORAGE_KEY = 'ios_directory_vault_v1';

export class StorageService {
  private static state: DirectoryState | null = null;

  static getState(): DirectoryState {
    if (this.state) return this.state;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = {
          contacts: parsed.contacts || INITIAL_CONTACTS,
          phoneNumbers: parsed.phoneNumbers || INITIAL_PHONE_NUMBERS,
          bankAccounts: parsed.bankAccounts || INITIAL_BANK_ACCOUNTS,
          folders: parsed.folders || INITIAL_FOLDERS,
          callLogs: parsed.callLogs || INITIAL_CALL_LOGS,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        };
        return this.state;
      }
    } catch (e) {
      console.warn('Failed to read from localStorage, using initial seed data', e);
    }

    this.state = {
      contacts: [...INITIAL_CONTACTS],
      phoneNumbers: [...INITIAL_PHONE_NUMBERS],
      bankAccounts: [...INITIAL_BANK_ACCOUNTS],
      folders: [...INITIAL_FOLDERS],
      callLogs: [...INITIAL_CALL_LOGS],
      settings: { ...DEFAULT_SETTINGS },
    };
    this.saveState(this.state);
    return this.state;
  }

  static saveState(state: DirectoryState): void {
    this.state = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to write to localStorage', e);
    }
  }

  static resetToDefaults(): DirectoryState {
    const fresh: DirectoryState = {
      contacts: [...INITIAL_CONTACTS],
      phoneNumbers: [...INITIAL_PHONE_NUMBERS],
      bankAccounts: [...INITIAL_BANK_ACCOUNTS],
      folders: [...INITIAL_FOLDERS],
      callLogs: [...INITIAL_CALL_LOGS],
      settings: { ...DEFAULT_SETTINGS },
    };
    this.saveState(fresh);
    return fresh;
  }

  static exportBackup(): string {
    const state = this.getState();
    return JSON.stringify(
      {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        vault: state,
      },
      null,
      2
    );
  }

  static importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      const importedVault = data.vault || data;
      if (
        Array.isArray(importedVault.contacts) &&
        Array.isArray(importedVault.phoneNumbers)
      ) {
        this.saveState({
          contacts: importedVault.contacts,
          phoneNumbers: importedVault.phoneNumbers,
          bankAccounts: importedVault.bankAccounts || [],
          folders: importedVault.folders || INITIAL_FOLDERS,
          callLogs: importedVault.callLogs || [],
          settings: { ...DEFAULT_SETTINGS, ...(importedVault.settings || {}) },
        });
        return true;
      }
    } catch (e) {
      console.error('Import failed', e);
    }
    return false;
  }
}
