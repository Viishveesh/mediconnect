import { cryptoService } from './cryptoService';

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
      
      // Decrypt messages if they're encrypted
      if (data.messages && otherUserEmail) {
        for (let message of data.messages) {
          if (message.encrypted && message.message) {
            try {
              const decrypted = await cryptoService.decryptConversationMessage(
                conversationId, 
                message.message, 
                otherUserEmail
              );
              message.message = decrypted;
            } catch (decryptError) {
              console.error('Failed to decrypt message:', decryptError);
              message.message = '[Decryption failed]';
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
  sendMessage: async (conversationId, message, otherUserEmail) => {
    try {
      let messageToSend = message;
      
      // Encrypt message if we have the other user's keys
      if (otherUserEmail) {
        try {
          const encryptedMessage = await cryptoService.encryptConversationMessage(
            conversationId, 
            message, 
            otherUserEmail
          );
          messageToSend = encryptedMessage;
        } catch (encryptError) {
          console.error('Failed to encrypt message:', encryptError);
          // Fall back to unencrypted message
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: messageToSend })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Start a new conversation
  startConversation: async (otherUserEmail) => {
    try {
      // Initialize encryption and exchange keys
      await messageService.initializeEncryption(otherUserEmail);
      
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

  // Initialize encryption for a conversation
  initializeEncryption: async (otherUserEmail) => {
    try {
      // Initialize user's keys
      await cryptoService.initializeUserKeys();
      
      // Store public keys on server
      const currentUserId = localStorage.getItem('userEmail');
      const publicKeys = cryptoService.getPublicKeys(currentUserId);
      
      if (publicKeys) {
        await fetch(`${API_BASE_URL}/public-keys`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ public_keys: publicKeys })
        });
      }
      
      // Get other user's public keys
      const response = await fetch(`${API_BASE_URL}/public-keys/${otherUserEmail}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        cryptoService.storeOtherUserPublicKeys(otherUserEmail, data.public_keys);
      }
    } catch (error) {
      console.error('Error initializing encryption:', error);
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