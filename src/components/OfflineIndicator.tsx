import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Database } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-amber-500/95 dark:bg-amber-600/95 text-white px-3.5 py-2 text-xs font-semibold shadow-xl shadow-amber-500/20 border border-white/20 backdrop-blur-md animate-in fade-in slide-in-from-bottom duration-300 pointer-events-auto">
      <WifiOff className="w-4 h-4 shrink-0 text-white animate-pulse" />
      <span>Offline Mode — Encrypted local vault active</span>
      <div className="flex items-center gap-1 text-[10px] bg-black/20 px-1.5 py-0.5 rounded ml-1">
        <Database className="w-3 h-3" />
        <span>IndexedDB</span>
      </div>
    </div>
  );
};
