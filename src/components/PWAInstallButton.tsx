import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X, CheckCircle2, Smartphone } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone PWA mode, show installed status or hide based on variant
  if (isInstalled) {
    if (variant === 'full') {
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-medium border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>Installed as Progressive Web App (Standalone Mode)</span>
        </div>
      );
    }
    return null;
  }

  // Handle click based on platform
  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      // Show installation guide (iOS Safari or desktop instructions)
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      {variant === 'compact' && (
        <button
          onClick={handleClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-xs font-semibold text-white shadow-xs transition-all ${className}`}
          title="Install as Progressive Web App"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install PWA</span>
        </button>
      )}

      {variant === 'full' && (
        <button
          onClick={handleClick}
          className={`w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-xs font-bold text-white shadow-sm flex items-center justify-center gap-2 transition-all ${className}`}
        >
          <Download className="w-4 h-4" />
          <span>{isInstallable ? 'Install PWA to Home Screen' : 'Install on iPhone / Android (PWA)'}</span>
        </button>
      )}

      {variant === 'banner' && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Install Progressive Web App</p>
              <p className="text-[11px] text-blue-100">Fast offline access & home screen icon</p>
            </div>
          </div>
          <button
            onClick={handleClick}
            className="px-3 py-1.5 rounded-lg bg-white text-blue-600 font-bold text-xs hover:bg-blue-50 transition-colors shadow-xs"
          >
            Install
          </button>
        </div>
      )}

      {/* iOS Safari & Browser Installation Modal Guide */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isIOS ? 'Install Tad Caller on iOS' : 'Install Tad Caller PWA'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Offline-first home screen app</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <div className="w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      Tap the Share button <Share2 className="w-3.5 h-3.5 text-blue-500" />
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Located in the bottom Safari toolbar on your iPhone (or top bar on iPad).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <div className="w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      Select "Add to Home Screen" <PlusSquare className="w-3.5 h-3.5 text-slate-500" />
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Scroll down in the share sheet and tap <strong>Add to Home Screen</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Launch from Home Screen
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Enjoy full offline capabilities, standalone window, and Face ID lock!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  To install this web app on your device:
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-700/60">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Desktop Chrome / Edge:
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Click the install icon in the address bar (top right) or open menu &gt; <strong>Save and share &gt; Install page as app</strong>.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-700/60">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Android Chrome:
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Tap the three dots (menu) &gt; tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
