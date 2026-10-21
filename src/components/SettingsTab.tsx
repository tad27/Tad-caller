import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ScanFace,
  Cloud,
  KeyRound,
  Download,
  Upload,
  RotateCcw,
  RefreshCw,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  FileCode2,
} from 'lucide-react';
import { AppSettings } from '../types/directory';
import { CloudKitSync, SyncLogEntry, ConflictResolutionPolicy } from '../services/cloudKitSync';
import { Biometrics } from '../services/biometrics';
import { StorageService } from '../services/storage';
import { useToast } from './ToastFeedback';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsTabProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onLockAppNow: () => void;
  onOpenSwiftCodeModal: () => void;
  onResetVault: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onUpdateSettings,
  onLockAppNow,
  onOpenSwiftCodeModal,
  onResetVault,
}) => {
  const { showToast } = useToast();
  const [cloudState, setCloudState] = useState(CloudKitSync.state);
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>(CloudKitSync.syncLogs);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showLogViewer, setShowLogViewer] = useState(false);
  const [customPasscode, setCustomPasscode] = useState(settings.passcode);
  const [isEditingPasscode, setIsEditingPasscode] = useState(false);

  useEffect(() => {
    const unsubscribe = CloudKitSync.subscribe((state, logs) => {
      setCloudState(state);
      setSyncLogs(logs);
    });
    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    showToast('iCloud Sync Started', 'Connecting to CloudKit container...', 'sync');
    const result = await CloudKitSync.triggerManualSync();
    setIsSyncing(false);
    if (result.success) {
      showToast('iCloud Synced', result.message, 'success');
    } else {
      showToast('Sync Suspended', result.message, 'error');
    }
  };

  const handleExportBackup = () => {
    const json = StorageService.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PersonalDirectory_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Vault Exported', 'Saved encrypted JSON backup', 'success');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      const success = StorageService.importBackup(content);
      if (success) {
        showToast('Backup Restored', 'Directory reloaded successfully', 'success');
        window.location.reload();
      } else {
        showToast('Import Failed', 'Invalid vault JSON file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleSavePasscode = () => {
    if (customPasscode.length === 4 && /^\d+$/.test(customPasscode)) {
      onUpdateSettings({ passcode: customPasscode });
      setIsEditingPasscode(false);
      showToast('Passcode Updated', 'New 4-digit PIN saved', 'security');
    } else {
      showToast('Invalid PIN', 'Passcode must be exactly 4 numeric digits', 'error');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 px-4 py-4 space-y-4">
      {/* Page Title */}
      <div className="pb-1">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings & Privacy</h1>
        <p className="text-xs text-slate-400">Local-first security and iCloud sync controls</p>
      </div>

      {/* Section 1: Biometric Security & Passcode */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700/60">
          <ScanFace className="w-4 h-4 text-blue-500" />
          <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Biometrics & LocalAuthentication
          </h2>
        </div>

        {/* Toggle Face ID */}
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Face ID / Touch ID Lock
            </p>
            <p className="text-xs text-slate-400">
              Require authentication upon app launch or returning to foreground
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.biometricEnabled}
              onChange={e => {
                onUpdateSettings({ biometricEnabled: e.target.checked });
                Biometrics.triggerHaptic('light');
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>

        {settings.biometricEnabled && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
            {/* Auto Lock Timeout */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Require Passcode After:</span>
              <select
                value={settings.biometricTimeoutMinutes}
                onChange={e =>
                  onUpdateSettings({ biometricTimeoutMinutes: Number(e.target.value) })
                }
                className="py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs border border-slate-200 dark:border-slate-600"
              >
                <option value={0}>Immediately</option>
                <option value={1}>After 1 minute</option>
                <option value={5}>After 5 minutes</option>
                <option value={15}>After 15 minutes</option>
              </select>
            </div>

            {/* Lock App Now Button */}
            <button
              onClick={onLockAppNow}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-blue-500" />
              <span>Lock App Immediately (Test Face ID)</span>
            </button>

            {/* Change 4-digit PIN fallback */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Fallback PIN Passcode
                </p>
                <p className="text-[11px] text-slate-400">
                  Current: {settings.passcode.replace(/./g, '•')}
                </p>
              </div>

              {isEditingPasscode ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    maxLength={4}
                    value={customPasscode}
                    onChange={e => setCustomPasscode(e.target.value)}
                    className="w-16 text-center text-xs font-mono py-1 px-1 bg-slate-100 dark:bg-slate-700 rounded border border-blue-500"
                    placeholder="1234"
                  />
                  <button
                    onClick={handleSavePasscode}
                    className="px-2 py-1 text-xs font-bold bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingPasscode(false)}
                    className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingPasscode(true)}
                  className="px-2.5 py-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Change PIN
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Section: Progressive Web App (PWA) */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-500" />
            <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Progressive Web App (PWA)
            </h2>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Installable</span>
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Install this personal directory to your device's home screen or desktop. Runs full-screen with offline caching, local biometric security, and zero app store downloads.
        </p>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>Offline Engine:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              Workbox Service Worker (Precached)
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>Display Mode:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              Standalone (Native App Experience)
            </span>
          </div>
        </div>

        <div className="pt-1">
          <PWAInstallButton variant="full" />
        </div>
      </div>

      {/* Section 2: CloudKit Sync & iCloud Container */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-sky-500" />
            <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              CloudKit Private Database Sync
            </h2>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready</span>
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>Container ID:</span>
            <span className="font-mono text-[11px] text-slate-900 dark:text-slate-100">
              {CloudKitSync.containerId}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>Sync Architecture:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              NSPersistentCloudKitContainer (SwiftData)
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>Conflict Policy:</span>
            <select
              value={CloudKitSync.policy}
              onChange={e =>
                CloudKitSync.setConflictPolicy(e.target.value as ConflictResolutionPolicy)
              }
              className="py-0.5 px-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs border border-slate-200 dark:border-slate-600"
            >
              <option value="merge_latest">Merge Latest Changes</option>
              <option value="client_wins">Local Changes Win</option>
              <option value="server_wins">iCloud Server Wins</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex-1 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync with iCloud Now</span>
          </button>

          <button
            onClick={() => setShowLogViewer(!showLogViewer)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
          >
            {showLogViewer ? 'Hide Logs' : 'View Logs'}
          </button>
        </div>

        {/* Sync telemetry logs */}
        {showLogViewer && (
          <div className="mt-2 p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] max-h-40 overflow-y-auto space-y-1.5 border border-slate-800">
            {syncLogs.map(l => (
              <div key={l.id} className="leading-tight">
                <span className="text-slate-500">
                  {new Date(l.timestamp).toLocaleTimeString()}
                </span>{' '}
                <span className={l.type === 'error' ? 'text-rose-400' : 'text-emerald-400'}>
                  [{l.type.toUpperCase()}]
                </span>{' '}
                <span>{l.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Swift & SwiftUI Source Code Viewer */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700/60">
          <FileCode2 className="w-4 h-4 text-orange-500" />
          <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            SwiftUI & SwiftData Codebase
          </h2>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Access the complete, modular Xcode 16 project files: SwiftUI Views, SwiftData Models, LocalAuthentication manager, and CloudKit sync monitors.
        </p>

        <button
          onClick={onOpenSwiftCodeModal}
          className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
        >
          <FileCode2 className="w-4 h-4" />
          <span>Inspect & Export Swift Files (.swift)</span>
        </button>
      </div>

      {/* Section 4: Backup, Restore & Reset */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700/60">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Offline Vault Backup & Reset
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportBackup}
            className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span>Export JSON</span>
          </button>

          <label className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-emerald-500" />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Reset directory to initial default seed contacts and banks?')) {
              onResetVault();
              showToast('Directory Reset', 'Sample data restored', 'success');
            }
          }}
          className="w-full py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-dashed border-rose-200 dark:border-rose-900 transition-colors flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Default Sample Directory</span>
        </button>
      </div>
    </div>
  );
};
