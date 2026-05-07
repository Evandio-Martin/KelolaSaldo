import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY =
  import.meta.env.VITE_COOKIE_ENCRYPTION_KEY || 'local-preview-cookie-key';

export const encryption = {
  encrypt: (text) => {
    if (!text) return '';
    try {
      return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      return '';
    }
  },

  decrypt: (ciphertext) => {
    if (!ciphertext) return '';
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      return '';
    }
  },

  encryptCookieName: (name) => {
    return CryptoJS.SHA256(name + ENCRYPTION_KEY).toString().substring(0, 16);
  },
};
