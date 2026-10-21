import { Contact, PhoneNumber, BankAccount, Folder, CallLog, AppSettings } from '../types/directory';

export const INITIAL_FOLDERS: Folder[] = [
  { id: 'f-family', name: 'Family', icon: 'heart', color: '#EF4444', isSystem: true },
  { id: 'f-friends', name: 'Close Friends', icon: 'users', color: '#3B82F6', isSystem: true },
  { id: 'f-business', name: 'Business & Partners', icon: 'briefcase', color: '#8B5CF6', isSystem: true },
  { id: 'f-emergency', name: 'Emergency', icon: 'shield-alert', color: '#F59E0B', isSystem: true },
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'c-1',
    firstName: 'Eleanor',
    lastName: 'Vance',
    nickname: 'Mom',
    avatar: '👩🏼',
    avatarBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    isFavorite: true,
    folderId: 'f-family',
    notes: 'Home address: 742 Evergreen Terrace. Birthday is March 14. Emergency medical proxy.',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    lastInteractedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    interactionCount: 28,
  },
  {
    id: 'c-2',
    firstName: 'David',
    lastName: 'Vance',
    nickname: 'Dad',
    avatar: '👨🏼',
    avatarBg: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    isFavorite: true,
    folderId: 'f-family',
    notes: 'Loves golf. Retired architect. Keyholder for mountain cabin.',
    createdAt: new Date(Date.now() - 58 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    lastInteractedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    interactionCount: 22,
  },
  {
    id: 'c-3',
    firstName: 'Sarah',
    lastName: 'Chen',
    nickname: '',
    avatar: '👩🏻‍💻',
    avatarBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    isFavorite: true,
    folderId: 'f-friends',
    notes: 'Co-founder at Horizon Labs. Lives in SF Mission District.',
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    lastInteractedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    interactionCount: 19,
  },
  {
    id: 'c-4',
    firstName: 'Marcus',
    lastName: 'Sterling',
    nickname: 'Marc',
    avatar: '👨🏽‍💼',
    avatarBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
    isFavorite: false,
    folderId: 'f-business',
    notes: 'Tax attorney & estate counsel. Office hours 9 AM - 5 PM EST.',
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    lastInteractedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    interactionCount: 9,
  },
  {
    id: 'c-5',
    firstName: 'Clara',
    lastName: 'O’Connor',
    nickname: '',
    avatar: '👩🏼‍🎨',
    avatarBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    isFavorite: false,
    folderId: 'f-friends',
    notes: 'Ceramics artist & graphic designer. Shared art studio.',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    lastInteractedAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    interactionCount: 7,
  },
  {
    id: 'c-6',
    firstName: 'Dr. Gregory',
    lastName: 'House',
    nickname: 'Primary Doctor',
    avatar: '🩺',
    avatarBg: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
    isFavorite: false,
    folderId: 'f-emergency',
    notes: 'Princeton-Plainsboro Clinic. Direct paging desk line for urgent questions.',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    lastInteractedAt: new Date(Date.now() - 3600000 * 120).toISOString(),
    interactionCount: 4,
  },
];

export const INITIAL_PHONE_NUMBERS: PhoneNumber[] = [
  // Eleanor Vance (Mom)
  { id: 'p-1', contactId: 'c-1', label: 'Mobile', number: '+1 (555) 234-8901', isPrimary: true },
  { id: 'p-2', contactId: 'c-1', label: 'Home', number: '+1 (555) 789-0123', isPrimary: false },
  { id: 'p-3', contactId: 'c-1', label: 'Work', number: '+1 (555) 456-7890', isPrimary: false },

  // David Vance (Dad)
  { id: 'p-4', contactId: 'c-2', label: 'Mobile', number: '+1 (555) 345-6789', isPrimary: true },
  { id: 'p-5', contactId: 'c-2', label: 'Cabin', number: '+1 (555) 901-2345', isPrimary: false },

  // Sarah Chen
  { id: 'p-6', contactId: 'c-3', label: 'iPhone', number: '+1 (415) 890-1234', isPrimary: true },
  { id: 'p-7', contactId: 'c-3', label: 'Work', number: '+1 (415) 555-0199', isPrimary: false },

  // Marcus Sterling
  { id: 'p-8', contactId: 'c-4', label: 'Work Direct', number: '+1 (212) 678-9012', isPrimary: true },
  { id: 'p-9', contactId: 'c-4', label: 'Assistant', number: '+1 (212) 678-9015', isPrimary: false },

  // Clara O'Connor
  { id: 'p-10', contactId: 'c-5', label: 'Mobile', number: '+1 (503) 456-7891', isPrimary: true },

  // Dr. Gregory House
  { id: 'p-11', contactId: 'c-6', label: 'Clinic Desk', number: '+1 (609) 555-0143', isPrimary: true },
  { id: 'p-12', contactId: 'c-6', label: 'Emergency Pager', number: '+1 (609) 555-0198', isPrimary: false },
];

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  // Eleanor Vance
  {
    id: 'b-1',
    contactId: 'c-1',
    bankName: 'Chase Bank',
    accountNumber: '9843210984',
    accountHolderName: 'Eleanor Vance',
    branch: 'Grand Central, NY',
    routingNumber: '021000021',
    notes: 'Joint checking for holiday gifts and family expenses',
    isPrimary: true,
    isFavorite: true,
  },
  {
    id: 'b-2',
    contactId: 'c-1',
    bankName: 'Fidelity Investments',
    accountNumber: '4489012351',
    accountHolderName: 'Eleanor Vance',
    branch: 'Boston Wealth',
    routingNumber: '011001234',
    notes: 'Family trust disbursement account',
    isPrimary: false,
    isFavorite: false,
  },

  // David Vance
  {
    id: 'b-3',
    contactId: 'c-2',
    bankName: 'Wells Fargo',
    accountNumber: '7612345098',
    accountHolderName: 'David L. Vance',
    branch: 'Downtown Branch',
    routingNumber: '121000247',
    notes: 'Primary checking for cabin maintenance transfers',
    isPrimary: true,
    isFavorite: true,
  },

  // Sarah Chen
  {
    id: 'b-4',
    contactId: 'c-3',
    bankName: 'Silicon Valley Bank (SVB)',
    accountNumber: '3345890123',
    accountHolderName: 'Sarah Chen / Horizon Labs',
    branch: 'Sand Hill Rd, Menlo Park',
    routingNumber: '121140399',
    notes: 'Direct wire for angel investment or consulting invoices',
    isPrimary: true,
    isFavorite: true,
  },

  // Marcus Sterling
  {
    id: 'b-5',
    contactId: 'c-4',
    bankName: 'JPMorgan Private Bank',
    accountNumber: '5567890123',
    accountHolderName: 'Sterling Legal Services LLC',
    branch: 'Park Ave, NYC',
    routingNumber: '021000021',
    notes: 'Escrow and legal retainer trust account',
    isPrimary: true,
  },
];

export const INITIAL_CALL_LOGS: CallLog[] = [
  {
    id: 'cl-1',
    contactId: 'c-1',
    contactName: 'Eleanor Vance',
    phoneNumber: '+1 (555) 234-8901',
    type: 'incoming',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    durationSeconds: 420,
    notes: 'Talked about Sunday family dinner and recipe ingredients',
  },
  {
    id: 'cl-2',
    contactId: 'c-2',
    contactName: 'David Vance',
    phoneNumber: '+1 (555) 345-6789',
    type: 'outgoing',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    durationSeconds: 185,
    notes: 'Checked if the cabin snow plowing service arrived',
  },
  {
    id: 'cl-3',
    contactId: 'c-3',
    contactName: 'Sarah Chen',
    phoneNumber: '+1 (415) 890-1234',
    type: 'outgoing',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    durationSeconds: 960,
    notes: 'Reviewed Q4 product roadmap and angel investor introduction',
  },
  {
    id: 'cl-4',
    contactId: 'c-1',
    contactName: 'Eleanor Vance',
    phoneNumber: '+1 (555) 234-8901',
    type: 'missed',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    durationSeconds: 0,
    notes: 'Missed call while in a meeting',
  },
  {
    id: 'cl-5',
    contactId: 'c-4',
    contactName: 'Marcus Sterling',
    phoneNumber: '+1 (212) 678-9012',
    type: 'incoming',
    timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
    durationSeconds: 310,
    notes: 'Confirmed signature on trust amendment filing',
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  biometricEnabled: true,
  biometricTimeoutMinutes: 1,
  requirePasscodeFallback: true,
  cloudKitSyncEnabled: true,
  cloudKitLastSyncTime: new Date(Date.now() - 15 * 60000).toISOString(),
  deviceTheme: 'system',
  hapticFeedback: true,
  maskBankAccountsByDefault: true,
  passcode: '1234',
};
