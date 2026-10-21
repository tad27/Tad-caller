import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Delete, KeyRound, RefreshCw, ScanFace } from 'lucide-react';
import { Biometrics } from '../services/biometrics';

interface FaceIdLockScreenProps {
  onUnlock: () => void;
  correctPasscode?: string;
}

export const FaceIdLockScreen: React.FC<FaceIdLockScreenProps> = ({
  onUnlock,
  correctPasscode = '1234',
}) => {
  const [mode, setMode] = useState<'faceid' | 'passcode'>('faceid');
  const [faceIdState, setFaceIdState] = useState<'scanning' | 'success' | 'failed'>('scanning');
  const [enteredPasscode, setEnteredPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  useEffect(() => {
    startFaceIdScan();
  }, []);

  const startFaceIdScan = () => {
    setFaceIdState('scanning');
    Biometrics.triggerHaptic('light');

    // Simulate authentic Apple Face ID scan timing (~1.1s)
    const scanTimer = setTimeout(() => {
      setFaceIdState('success');
      Biometrics.playFeedbackTone('faceid');
      Biometrics.triggerHaptic('success');

      const unlockTimer = setTimeout(() => {
        onUnlock();
      }, 500);

      return () => clearTimeout(unlockTimer);
    }, 1100);

    return () => clearTimeout(scanTimer);
  };

  const handleKeyPress = (num: string) => {
    if (enteredPasscode.length < 4) {
      Biometrics.playFeedbackTone('click');
      Biometrics.triggerHaptic('light');
      const next = enteredPasscode + num;
      setEnteredPasscode(next);

      if (next.length === 4) {
        if (next === correctPasscode) {
          Biometrics.triggerHaptic('success');
          Biometrics.playFeedbackTone('success');
          setTimeout(() => onUnlock(), 250);
        } else {
          setPasscodeError(true);
          Biometrics.triggerHaptic('error');
          setTimeout(() => {
            setEnteredPasscode('');
            setPasscodeError(false);
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    Biometrics.triggerHaptic('light');
    setEnteredPasscode(prev => prev.slice(0, -1));
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-between p-8 bg-slate-950/90 text-white backdrop-blur-2xl select-none">
      {/* Top subtle lock label */}
      <div className="pt-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs text-slate-300 font-medium">
          <ScanFace className="w-3.5 h-3.5 text-blue-400" />
          <span>LocalAuthentication Active</span>
        </div>
      </div>

      {mode === 'faceid' ? (
        <div className="flex flex-col items-center justify-center my-auto">
          {/* Authentic Apple Face ID Viewfinder Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              x: faceIdState === 'failed' ? [-10, 10, -8, 8, 0] : 0,
            }}
            transition={{ duration: 0.3 }}
            className="relative w-36 h-36 rounded-3xl bg-slate-900/80 border border-white/15 flex items-center justify-center shadow-2xl overflow-hidden"
          >
            {/* Viewfinder corner brackets */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-blue-400/80 rounded-tl" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-blue-400/80 rounded-tr" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-blue-400/80 rounded-bl" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-blue-400/80 rounded-br" />

            {/* Scanning line animation */}
            {faceIdState === 'scanning' && (
              <motion.div
                className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                animate={{ y: [-40, 40, -40] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            {/* Central icon */}
            <AnimatePresence mode="wait">
              {faceIdState === 'scanning' && (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2"
                >
                  <ScanFace className="w-14 h-14 text-blue-400" />
                </motion.div>
              )}

              {faceIdState === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1.15 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/50"
                >
                  <Check className="w-8 h-8 stroke-[3]" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <p className="mt-6 text-sm font-medium text-slate-200">
            {faceIdState === 'scanning' && 'Verifying Face ID...'}
            {faceIdState === 'success' && 'Unlocked'}
            {faceIdState === 'failed' && 'Face Not Recognized'}
          </p>
          <p className="mt-1 text-xs text-slate-400">Encrypted with Secure Enclave</p>

          <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={() => startFaceIdScan()}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-medium text-slate-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Face ID</span>
            </button>
            <button
              onClick={() => {
                setMode('passcode');
                Biometrics.triggerHaptic('light');
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-blue-400 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Enter Passcode (PIN)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center my-auto w-full max-w-xs">
          <p className="text-base font-semibold text-white">Enter Passcode</p>
          <p className="text-xs text-slate-400 mt-1">Default PIN is 1234</p>

          {/* 4 PIN Dots */}
          <motion.div
            animate={{ x: passcodeError ? [-12, 12, -8, 8, 0] : 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-4 my-6"
          >
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full border transition-all duration-150 ${
                  enteredPasscode.length > i
                    ? 'bg-white border-white scale-110'
                    : 'border-white/40 bg-transparent'
                } ${passcodeError ? '!border-rose-500 !bg-rose-500' : ''}`}
              />
            ))}
          </motion.div>

          {/* Numeric Keypad (iOS style) */}
          <div className="grid grid-cols-3 gap-4 w-full px-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => handleKeyPress(String(num))}
                className="w-16 h-16 rounded-full mx-auto bg-white/10 hover:bg-white/20 active:scale-95 text-xl font-medium text-white flex items-center justify-center transition-all"
              >
                {num}
              </button>
            ))}
            <div />
            <button
              onClick={() => handleKeyPress('0')}
              className="w-16 h-16 rounded-full mx-auto bg-white/10 hover:bg-white/20 active:scale-95 text-xl font-medium text-white flex items-center justify-center transition-all"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => {
              setMode('faceid');
              startFaceIdScan();
            }}
            className="mt-6 text-xs text-blue-400 hover:underline"
          >
            Switch back to Face ID
          </button>
        </div>
      )}

      {/* Bottom Privacy Note */}
      <div className="pb-2 text-center text-[11px] text-slate-500">
        <span>Zero Third-Party Tracking · Local-First Storage</span>
      </div>
    </div>
  );
};
