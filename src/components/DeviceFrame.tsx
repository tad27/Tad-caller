import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Maximize2,
  Lock,
  Moon,
  Sun,
  FileCode2,
  Cloud,
  Wifi,
  BatteryCharging,
  Signal,
} from 'lucide-react';
import { Biometrics } from '../services/biometrics';
import { PWAInstallButton } from './PWAInstallButton';

interface DeviceFrameProps {
  children: React.ReactNode;
  isLocked: boolean;
  onLockApp: () => void;
  onOpenSwiftCode: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export type FrameMode = 'iphone' | 'fullscreen';

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  children,
  isLocked,
  onLockApp,
  onOpenSwiftCode,
  theme,
  onToggleTheme,
}) => {
  const [frameMode, setFrameMode] = useState<FrameMode>('iphone');
  const [currentTime, setCurrentTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`min-h-screen w-full flex flex-col bg-slate-900 text-slate-100 transition-colors ${
        theme === 'dark' ? 'dark' : ''
      }`}
    >
      {/* Studio Top Simulation Navigation Bar */}
      <header className="shrink-0 h-14 px-4 sm:px-8 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between gap-4 z-30">
        {/* Brand & iOS Badges */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            T
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">
                Tad Caller
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                PWA · SwiftData
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Tad Caller — Secure local-first personal directory and dialer
            </p>
          </div>
        </div>

        {/* Simulator Controls */}
        <div className="flex items-center gap-2">
          {/* Viewport Frame Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-800/80 rounded-xl border border-slate-700">
            <button
              onClick={() => setFrameMode('iphone')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                frameMode === 'iphone'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="iPhone 16 Pro Frame"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">iPhone 16 Pro</span>
            </button>

            <button
              onClick={() => setFrameMode('fullscreen')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                frameMode === 'fullscreen'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Full Screen Canvas"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Expanded</span>
            </button>
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton variant="compact" />

          {/* Swift Codebase Export Button */}
          <button
            onClick={onOpenSwiftCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 border border-orange-500/30 text-xs font-semibold transition-colors"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Swift Source Code</span>
          </button>

          {/* Biometric Lock App Trigger */}
          <button
            onClick={() => {
              Biometrics.triggerHaptic('light');
              Biometrics.playFeedbackTone('lock');
              onLockApp();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Lock with Face ID"
          >
            <Lock className="w-4 h-4 text-blue-400" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Toggle Light / Dark Mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-300" />
            )}
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 flex items-center justify-center p-0 sm:p-6 overflow-hidden bg-radial from-slate-900 to-slate-950">
        {frameMode === 'iphone' ? (
          /* iPhone 16 Pro Frame */
          <div className="relative w-full max-w-[412px] h-[100dvh] sm:h-[844px] bg-slate-950 rounded-none sm:rounded-[54px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] ring-1 sm:ring-12 ring-slate-800 border-0 sm:border-4 border-slate-700/60 flex flex-col overflow-hidden">
            {/* Native iOS Status Bar */}
            <div className="shrink-0 h-11 px-7 flex items-center justify-between text-xs text-slate-800 dark:text-white font-semibold select-none z-30 pt-1">
              {/* Left: Clock */}
              <span className="tracking-tight text-[13px]">{currentTime}</span>

              {/* Center: Dynamic Island */}
              <div className="w-28 h-7 bg-black rounded-full flex items-center justify-between px-2.5 shadow-md">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-blue-950/80 ring-1 ring-blue-800/50" />
              </div>

              {/* Right: Cellular, Wi-Fi, Battery */}
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-white">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono">98%</span>
                  <div className="w-5 h-2.5 border border-current rounded-[3px] p-[1px] flex items-center">
                    <div className="w-full h-full bg-current rounded-[1.5px]" />
                  </div>
                </div>
              </div>
            </div>

            {/* App Viewport Container */}
            <div className="relative flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900">
              {children}
            </div>

            {/* iOS Home Indicator Bar */}
            <div className="shrink-0 h-5 bg-slate-50 dark:bg-slate-900 flex items-center justify-center pb-1">
              <div className="w-32 h-1 bg-slate-400 dark:bg-slate-600 rounded-full" />
            </div>
          </div>
        ) : (
          /* Fullscreen Canvas Mode */
          <div className="w-full max-w-4xl h-[92vh] bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden">
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
