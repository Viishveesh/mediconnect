class CryptoService {
  constructor() {
    this.keyStore = new Map();
    this.conversationKeys = new Map();
  }

  // Generate RSA key pair for initial key exchange
  async generateRSAKeyPair() {
    return await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Generate ECDH key pair for forward secrecy
  async generateECDHKeyPair() {
    return await window.crypto.subtle.generateKey(
      {
        name: 'ECDH',
        namedCurve: 'P-256'
      },
      true,
      ['deriveKey']
    );
  }

  // Generate AES key for message encryption
  async generateAESKey() {
    return await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Export public key to send to other party
  async exportPublicKey(keyPair, keyType = 'RSA-OAEP') {
    const exported = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
    return {
      key: Array.from(new Uint8Array(exported)),
      keyType
    };
  }

  // Import public key from other party
  async importPublicKey(keyData, keyType = 'RSA-OAEP') {
    const keyBuffer = new Uint8Array(keyData.key);
    
    if (keyType === 'RSA-OAEP') {
      return await window.crypto.subtle.importKey(
        'spki',
        keyBuffer,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['encrypt']
      );
    } else if (keyType === 'ECDH') {
      return await window.crypto.subtle.importKey(
        'spki',
        keyBuffer,
        { name: 'ECDH', namedCurve: 'P-256' },
        false,
        []
      );
    }
  }

  // Derive shared secret using ECDH
  async deriveSharedSecret(privateKey, publicKey) {
    return await window.crypto.subtle.deriveKey(
      { name: 'ECDH', public: publicKey },
      privateKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt message with AES-GCM
  async encryptMessage(message, key) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return {
      encrypted: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv)
    };
  }

  // Decrypt message with AES-GCM
  async decryptMessage(encryptedData, key) {
    const encrypted = new Uint8Array(encryptedData.encrypted);
    const iv = new Uint8Array(encryptedData.iv);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  // Initialize user's keys
  async initializeUserKeys() {
    const userId = localStorage.getItem('userEmail');
    if (!userId) throw new Error('User not authenticated');

    let userKeys = this.getUserKeys(userId);
    if (!userKeys) {
      // Generate new keys
      const rsaKeyPair = await this.generateRSAKeyPair();
      const ecdhKeyPair = await this.generateECDHKeyPair();
      
      userKeys = {
        rsa: rsaKeyPair,
        ecdh: ecdhKeyPair,
        userId
      };
      
      this.keyStore.set(userId, userKeys);
      
      // Store public keys for sharing
      const publicKeys = {
        rsa: await this.exportPublicKey(rsaKeyPair, 'RSA-OAEP'),
        ecdh: await this.exportPublicKey(ecdhKeyPair, 'ECDH')
      };
      
      localStorage.setItem(`publicKeys_${userId}`, JSON.stringify(publicKeys));
    }
    
    return userKeys;
  }

  // Get user's keys
  getUserKeys(userId) {
    return this.keyStore.get(userId);
  }

  // Get public keys for sharing
  getPublicKeys(userId) {
    const stored = localStorage.getItem(`publicKeys_${userId}`);
    return stored ? JSON.parse(stored) : null;
  }

  // Store other user's public keys
  storeOtherUserPublicKeys(userId, publicKeys) {
    localStorage.setItem(`otherPublicKeys_${userId}`, JSON.stringify(publicKeys));
  }

  // Get other user's public keys
  getOtherUserPublicKeys(userId) {
    const stored = localStorage.getItem(`otherPublicKeys_${userId}`);
    return stored ? JSON.parse(stored) : null;
  }

  // Initialize conversation encryption
  async initializeConversationEncryption(conversationId, otherUserEmail) {
    const currentUserId = localStorage.getItem('userEmail');
    const userKeys = await this.initializeUserKeys();
    
    // Try to get existing conversation key
    let conversationKey = this.conversationKeys.get(conversationId);
    if (conversationKey) {
      return conversationKey;
    }

    // Check if we have the other user's public keys
    const otherUserPublicKeys = this.getOtherUserPublicKeys(otherUserEmail);
    if (!otherUserPublicKeys) {
      throw new Error('Other user public keys not available');
    }

    // Import other user's ECDH public key
    const otherECDHPublicKey = await this.importPublicKey(otherUserPublicKeys.ecdh, 'ECDH');
    
    // Derive shared secret
    const sharedSecret = await this.deriveSharedSecret(userKeys.ecdh.privateKey, otherECDHPublicKey);
    
    // Store conversation key
    this.conversationKeys.set(conversationId, sharedSecret);
    
    return sharedSecret;
  }

  // Encrypt message for conversation
  async encryptConversationMessage(conversationId, message, otherUserEmail) {
    const conversationKey = await this.initializeConversationEncryption(conversationId, otherUserEmail);
    return await this.encryptMessage(message, conversationKey);
  }

  // Decrypt message from conversation
  async decryptConversationMessage(conversationId, encryptedData, otherUserEmail) {
    const conversationKey = await this.initializeConversationEncryption(conversationId, otherUserEmail);
    return await this.decryptMessage(encryptedData, conversationKey);
  }

  // Exchange public keys with other user
  async exchangePublicKeys(otherUserEmail) {
    const currentUserId = localStorage.getItem('userEmail');
    const userKeys = await this.initializeUserKeys();
    const publicKeys = this.getPublicKeys(currentUserId);
    
    return {
      action: 'key_exchange',
      from: currentUserId,
      to: otherUserEmail,
      publicKeys
    };
  }

  // Handle received key exchange
  async handleKeyExchange(keyExchangeData) {
    const { from, publicKeys } = keyExchangeData;
    this.storeOtherUserPublicKeys(from, publicKeys);
    
    // Return acknowledgment
    const currentUserId = localStorage.getItem('userEmail');
    const myPublicKeys = this.getPublicKeys(currentUserId);
    
    return {
      action: 'key_exchange_ack',
      from: currentUserId,
      to: from,
      publicKeys: myPublicKeys
    };
  }

  // Clear conversation keys (for security)
  clearConversationKeys() {
    this.conversationKeys.clear();
  }

  // Generate new keys for forward secrecy
  async rotateKeys() {
    const userId = localStorage.getItem('userEmail');
    if (!userId) return;

    const ecdhKeyPair = await this.generateECDHKeyPair();
    const userKeys = this.getUserKeys(userId);
    
    if (userKeys) {
      userKeys.ecdh = ecdhKeyPair;
      this.keyStore.set(userId, userKeys);
      
      // Update stored public keys
      const publicKeys = this.getPublicKeys(userId);
      publicKeys.ecdh = await this.exportPublicKey(ecdhKeyPair, 'ECDH');
      localStorage.setItem(`publicKeys_${userId}`, JSON.stringify(publicKeys));
    }
  }
}

export const cryptoService = new CryptoService();