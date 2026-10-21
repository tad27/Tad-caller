/**
 * Apple iOS Keychain & SwiftData Encryption Simulation
 * In native iOS, sensitive fields (like bank accounts and secure notes)
 * are stored using the Keychain Services API (kSecClassGenericPassword)
 * with kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly or encrypted at rest via SwiftData.
 *
 * Here we simulate hardware-bound AES-GCM encryption using Web Crypto API.
 */

class SecureKeychainService {
  private key: CryptoKey | null = null;
  private isEnclaveReady = false;

  constructor() {
    this.initHardwareKey();
  }

  private async initHardwareKey(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        // Generate or derive a device-bound key (simulating Secure Enclave AES-256)
        const keyMaterial = new TextEncoder().encode('AppleSecureEnclaveHardwareDerivedKey-2026-iOS');
        const hash = await window.crypto.subtle.digest('SHA-256', keyMaterial);
        this.key = await window.crypto.subtle.importKey(
          'raw',
          hash,
          { name: 'AES-GCM', length: 256 },
          false,
          ['encrypt', 'decrypt']
        );
        this.isEnclaveReady = true;
      }
    } catch {
      this.isEnclaveReady = false;
    }
  }

  /**
   * Encrypts sensitive text (e.g., bank account number or private note)
   */
  async encrypt(plainText: string): Promise<string> {
    if (!this.key || !this.isEnclaveReady) {
      // Fallback base64 obfuscation for offline simulation if subtle crypto is unsupported
      return `enc_v1:${btoa(encodeURIComponent(plainText))}`;
    }

    try {
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(plainText);
      const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.key,
        encoded
      );

      const combined = new Uint8Array(iv.length + ciphertext.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(ciphertext), iv.length);

      // Return base64 payload
      const binaryString = Array.from(combined).map(b => String.fromCharCode(b)).join('');
      return `enc_aes_gcm:${btoa(binaryString)}`;
    } catch {
      return `enc_v1:${btoa(encodeURIComponent(plainText))}`;
    }
  }

  /**
   * Decrypts sensitive text
   */
  async decrypt(cipherText: string): Promise<string> {
    if (!cipherText) return '';

    if (cipherText.startsWith('enc_v1:')) {
      const raw = cipherText.replace('enc_v1:', '');
      try {
        return decodeURIComponent(atob(raw));
      } catch {
        return raw;
      }
    }

    if (cipherText.startsWith('enc_aes_gcm:')) {
      if (!this.key || !this.isEnclaveReady) {
        return '••••••••';
      }
      try {
        const rawB64 = cipherText.replace('enc_aes_gcm:', '');
        const binaryString = atob(rawB64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const iv = bytes.slice(0, 12);
        const ciphertext = bytes.slice(12);

        const decrypted = await window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          this.key,
          ciphertext
        );

        return new TextDecoder().decode(decrypted);
      } catch {
        return '••••••••';
      }
    }

    return cipherText;
  }

  /**
   * Helper to mask bank account numbers (e.g. •••• 9843)
   */
  maskAccountNumber(accountNumber: string, showLast = 4): string {
    if (!accountNumber) return '';
    const clean = accountNumber.replace(/\s+/g, '');
    if (clean.length <= showLast) return '••••';
    const lastDigits = clean.slice(-showLast);
    return `•••• ${lastDigits}`;
  }
}

export const KeychainService = new SecureKeychainService();
