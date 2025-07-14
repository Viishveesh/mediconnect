import encryptionManager from '../utils/encryption';

const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const messageService = {
  // Get all conversations for current user
  getConversations: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  // Get messages for a specific conversation
  getMessages: async (conversationId, otherUserEmail) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      
      // Decrypt messages on the client side
      if (data.messages && Array.isArray(data.messages)) {
        for (let message of data.messages) {
          if (message.message && encryptionManager.isEncryptionSupported()) {
            const originalMessage = message.message;
            console.log('🔍 Attempting to decrypt message:', originalMessage.substring(0, 50) + '...');
            console.log('🆔 Using conversation ID for decryption:', conversationId);
            
            try {
              // Attempt to decrypt the message
              const decryptedMessage = await encryptionManager.decryptMessage(conversationId, message.message);
              message.message = decryptedMessage;
              console.log('✅ Decrypted successfully:', decryptedMessage);
            } catch (error) {
              console.warn('Failed to decrypt message:', error);
              // Keep the original message if decryption fails (could be legacy plain text)
              console.log('⚠️ Keeping original message:', originalMessage);
            }
          }
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Send a message
  sendMessage: async (conversationId, message, otherUserEmail, imageAttachment = null) => {
    try {
      console.log('Sending message:', { conversationId, message: '[ENCRYPTED]', imageAttachment });
      console.log('🆔 Using conversation ID for encryption:', conversationId);
      
      // Encrypt the message before sending
      let encryptedMessage = '';
      if (message && message.trim()) {
        if (encryptionManager.isEncryptionSupported()) {
          encryptedMessage = await encryptionManager.encryptMessage(conversationId, message.trim());
          console.log('Message encrypted successfully');
          
          // Debug: Log key info during encryption
          const key = await encryptionManager.loadConversationKey(conversationId);
          const keyData = await crypto.subtle.exportKey('jwk', key);
          console.log('🔑 Encryption key fingerprint:', keyData.k?.substring(0, 10) + '...');
        } else {
          console.warn('Encryption not supported, sending plain text');
          encryptedMessage = message.trim();
        }
      }
      
      const payload = { message: encryptedMessage };
      if (imageAttachment) {
        payload.file_attachment = imageAttachment;
      }
      
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      
      console.log('API response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('API error response:', errorData);
        throw new Error(`Failed to send message: ${response.status} ${errorData}`);
      }
      
      const result = await response.json();
      console.log('Message sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Upload image
  uploadImage: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to upload image: ${response.status} ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Get image URL
  getImageUrl: (fileId) => {
    return `${API_BASE_URL}/files/${fileId}`;
  },

  // Start a new conversation
  startConversation: async (otherUserEmail) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/start`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ other_user_email: otherUserEmail })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start conversation');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  },


  // Format timestamp for display
  formatTime: (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    }
  },

  // Format timestamp for message display
  formatMessageTime: (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
};