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
  getMessages: async (conversationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Send a message
  sendMessage: async (conversationId, message) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message })
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