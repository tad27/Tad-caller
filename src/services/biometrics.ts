/**
 * Apple LocalAuthentication (Face ID / Touch ID) Simulation Service
 *
 * In native iOS:
 *   let context = LAContext()
 *   context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: "Unlock Personal Directory")
 *
 * In web:
 *   Checks WebAuthn support and provides an ultra-authentic Apple Face ID / Touch ID
 *   state machine with authentic visual HUD, haptics, and PIN fallback.
 */

export type BiometricStatus =
  | 'idle'
  | 'prompting'
  | 'scanning'
  | 'success'
  | 'failed'
  | 'passcode_fallback';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  usedPasscode?: boolean;
}

class BiometricAuthService {
  private isPlatformAuthAvailable = false;

  constructor() {
    this.checkPlatformCapability();
  }

  private async checkPlatformCapability() {
    if (
      typeof window !== 'undefined' &&
      window.PublicKeyCredential &&
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable
    ) {
      try {
        this.isPlatformAuthAvailable =
          await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      } catch {
        this.isPlatformAuthAvailable = false;
      }
    }
  }

  get isHardwareAvailable(): boolean {
    return this.isPlatformAuthAvailable;
  }

  /**
   * Triggers device haptic feedback if supported (iOS Taptic Engine)
   */
  triggerHaptic(type: 'success' | 'warning' | 'error' | 'light' = 'light'): void {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (type === 'success') {
          navigator.vibrate([10, 50, 20]);
        } else if (type === 'error') {
          navigator.vibrate([50, 100, 50, 100]);
        } else {
          navigator.vibrate(15);
        }
      } catch {
        // vibration unsupported or blocked
      }
    }
  }

  /**
   * Plays subtle audio feedback for iOS clicks/face id tone
   */
  playFeedbackTone(type: 'faceid' | 'success' | 'click' | 'lock'): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'faceid') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'lock') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      }
    } catch {
      // AudioContext policy
    }
  }
}

export const Biometrics = new BiometricAuthService();
