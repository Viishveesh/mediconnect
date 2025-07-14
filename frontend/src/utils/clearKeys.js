// Utility to clear all existing encryption keys for testing
export const clearAllEncryptionKeys = () => {
  console.log('🧹 Clearing all encryption keys...');
  
  // Get all localStorage keys
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('chat_key_')) {
      keysToRemove.push(key);
    }
  }
  
  // Remove all chat keys
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log('🗑️ Removed key:', key);
  });
  
  console.log(`✅ Cleared ${keysToRemove.length} encryption keys`);
  
  // Also clear memory keys if encryption manager is available
  if (window.encryptionManager) {
    window.encryptionManager.conversationKeys.clear();
    console.log('🗑️ Cleared memory keys');
  }
  
  return keysToRemove.length;
};

// Auto-export for console use
if (typeof window !== 'undefined') {
  window.clearAllEncryptionKeys = clearAllEncryptionKeys;
}