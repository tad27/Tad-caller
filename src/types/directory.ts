export type PhoneLabel = 'Mobile' | 'Home' | 'Work' | 'iPhone' | 'Main' | 'Other' | string;

export interface PhoneNumber {
  id: string;
  contactId: string;
  label: PhoneLabel;
  number: string;
  isPrimary: boolean;
}

export interface BankAccount {
  id: string;
  contactId: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  branch?: string;
  routingNumber?: string;
  notes?: string;
  isPrimary: boolean;
  isFavorite?: boolean;
}

export interface Folder {
  id: string;
  name: string;
  icon: string;
  color: string;
  isSystem?: boolean;
}

export type CallType = 'outgoing' | 'incoming' | 'missed';

export interface CallLog {
  id: string;
  contactId: string;
  contactName: string;
  phoneNumber: string;
  type: CallType;
  timestamp: string; // ISO
  durationSeconds: number;
  notes?: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  avatar?: string;
  avatarBg?: string;
  isFavorite: boolean;
  folderId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastInteractedAt?: string;
  interactionCount: number; // for Most Used list
}

export type SmartListType = 'all' | 'favorites' | 'recents' | 'most_used';

export interface DirectoryState {
  contacts: Contact[];
  phoneNumbers: PhoneNumber[];
  bankAccounts: BankAccount[];
  folders: Folder[];
  callLogs: CallLog[];
  settings: AppSettings;
}

export interface AppSettings {
  biometricEnabled: boolean;
  biometricTimeoutMinutes: number; // 0 = immediately, 1, 5, 15
  requirePasscodeFallback: boolean;
  cloudKitSyncEnabled: boolean;
  cloudKitLastSyncTime?: string;
  deviceTheme: 'system' | 'light' | 'dark';
  hapticFeedback: boolean;
  maskBankAccountsByDefault: boolean;
  passcode: string;
}
