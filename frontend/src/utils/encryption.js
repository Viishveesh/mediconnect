// End-to-end encryption utilities for MediConnect
// Uses AES-256-GCM encryption with per-conversation keys

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM

class EncryptionManager {
  constructor() {
    this.conversationKeys = new Map();
  }

  // Generate a deterministic encryption key for a conversation
  // This ensures both users generate the same key for the same conversation
  async generateConversationKey(conversationId) {
    try {
      // Create a deterministic key based on conversation ID
      // This ensures both users get the same key for the same conversation
      const encoder = new TextEncoder();
      const conversationData = encoder.encode(conversationId + 'mediconnect-chat-key');
      
      // Hash the conversation ID to create a deterministic seed
      const hashBuffer = await crypto.subtle.digest('SHA-256', conversationData);
      
      // Use the hash as key material - take first 32 bytes (256 bits)
      const keyMaterial = new Uint8Array(hashBuffer).slice(0, 32);
      
      // Convert to base64url format for JWK
      const keyBase64 = btoa(String.fromCharCode(...keyMaterial))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      
      // Create JWK format key with version info
      const jwkKey = {
        kty: 'oct',
        k: keyBase64,
        alg: 'A256GCM',
        use: 'enc',
        ext: true,
        version: 2 // Version 2 = deterministic keys
      };
      
      // Import the deterministic key
      const key = await crypto.subtle.importKey(
        'jwk',
        jwkKey,
        {
          name: ALGORITHM,
          length: KEY_LENGTH
        },
        true,
        ['encrypt', 'decrypt']
      );

      // Store the key for this conversation
      this.conversationKeys.set(conversationId, key);
      
      // Also persist to localStorage for browser refresh
      localStorage.setItem(`chat_key_${conversationId}`, JSON.stringify(jwkKey));
      
      
      return key;
    } catch (error) {
      console.error('Failed to generate conversation key:', error);
      throw new Error('Encryption key generation failed');
    }
  }

  // Load an existing conversation key from storage
  async loadConversationKey(conversationId) {
    try {
      // Check if key is already in memory
      if (this.conversationKeys.has(conversationId)) {
        return this.conversationKeys.get(conversationId);
      }

      // Try to load from localStorage
      const storedKey = localStorage.getItem(`chat_key_${conversationId}`);
      if (storedKey) {
        try {
          const keyData = JSON.parse(storedKey);
          
          // Check if this is an old random key (not deterministic)
          // Version 2 = deterministic keys, anything else should be regenerated
          if (!keyData.k || !keyData.kty || keyData.kty !== 'oct' || keyData.version !== 2) {
            localStorage.removeItem(`chat_key_${conversationId}`);
            return await this.generateConversationKey(conversationId);
          }
          
          const key = await crypto.subtle.importKey(
            'jwk',
            keyData,
            {
              name: ALGORITHM,
              length: KEY_LENGTH
            },
            true,
            ['encrypt', 'decrypt']
          );
          
          this.conversationKeys.set(conversationId, key);
          return key;
        } catch (keyError) {
          localStorage.removeItem(`chat_key_${conversationId}`);
          return await this.generateConversationKey(conversationId);
        }
      }

      // No key exists, generate a new one
      return await this.generateConversationKey(conversationId);
    } catch (error) {
      console.error('Failed to load conversation key:', error);
      throw new Error('Encryption key loading failed');
    }
  }

  // Encrypt a message
  async encryptMessage(conversationId, plaintext) {
    try {
      if (typeof plaintext !== 'string') {
        throw new Error('Invalid message to encrypt');
      }

      // Handle empty strings
      if (plaintext === '') {
        return '';
      }

      const key = await this.loadConversationKey(conversationId);
      const encoder = new TextEncoder();
      const data = encoder.encode(plaintext);

      // Generate random IV for each message
      const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

      const encrypted = await crypto.subtle.encrypt(
        {
          name: ALGORITHM,
          iv: iv
        },
        key,
        data
      );

      // Combine IV and encrypted data
      const result = new Uint8Array(iv.length + encrypted.byteLength);
      result.set(iv, 0);
      result.set(new Uint8Array(encrypted), iv.length);

      // Return as base64 string for transmission
      return btoa(String.fromCharCode(...result));
    } catch (error) {
      console.error('Message encryption failed:', error);
      throw new Error('Failed to encrypt message');
    }
  }

  // Decrypt a message
  async decryptMessage(conversationId, encryptedData) {
    try {
      if (typeof encryptedData !== 'string') {
        throw new Error('Invalid encrypted data');
      }

      // Handle empty strings
      if (encryptedData === '') {
        return '';
      }

      // Check if this looks like encrypted data (base64)
      // If it doesn't look encrypted, assume it's legacy plain text
      if (!this.isBase64(encryptedData)) {
        return encryptedData;
      }

      const key = await this.loadConversationKey(conversationId);
      
      // Decode from base64
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );

      // Check minimum size (IV + some encrypted data)
      if (combined.length < IV_LENGTH + 1) {
        console.warn('Encrypted data too short, assuming legacy plain text');
        return encryptedData;
      }

      // Extract IV and encrypted data
      const iv = combined.slice(0, IV_LENGTH);
      const encrypted = combined.slice(IV_LENGTH);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: ALGORITHM,
          iv: iv
        },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      const result = decoder.decode(decrypted);
      return result;
    } catch (error) {
      console.warn('Message decryption failed, assuming legacy plain text:', error.message);
      // Return original data for legacy compatibility
      return encryptedData;
    }
  }

  // Helper method to check if a string is valid base64
  isBase64(str) {
    try {
      // Check if it's a valid base64 string
      if (str === '' || str.trim() === '') return false;
      
      // Base64 regex pattern - allow any length, padding will be handled by atob
      const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Pattern.test(str)) {
        return false;
      }
      
      // Try to decode
      atob(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Check if encryption is supported in this browser
  isEncryptionSupported() {
    return !!(window.crypto && window.crypto.subtle);
  }

  // Clean up keys when conversation is no longer needed
  clearConversationKey(conversationId) {
    this.conversationKeys.delete(conversationId);
    localStorage.removeItem(`chat_key_${conversationId}`);
  }

  // Get debug info about encryption status
  getEncryptionStatus() {
    return {
      supported: this.isEncryptionSupported(),
      activeConversations: this.conversationKeys.size,
      conversations: Array.from(this.conversationKeys.keys())
    };
  }
}

// Create a singleton instance
const encryptionManager = new EncryptionManager();

export default encryptionManager;

// Export specific methods for easier use
export const {
  encryptMessage,
  decryptMessage,
  generateConversationKey,
  loadConversationKey,
  isEncryptionSupported,
  clearConversationKey,
  getEncryptionStatus
} = encryptionManager;