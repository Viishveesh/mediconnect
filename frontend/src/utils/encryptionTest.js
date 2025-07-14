// Test file for encryption functionality
import encryptionManager from './encryption';

// Test encryption and decryption
export const testEncryption = async () => {
  console.log('🔐 Testing end-to-end encryption...');
  
  if (!encryptionManager.isEncryptionSupported()) {
    console.error('❌ Encryption not supported in this browser');
    return false;
  }

  const testConversationId = 'test-conversation-123';
  const testMessage = 'Hello, this is a secret message! 🔒';
  
  try {
    console.log('📝 Original message:', testMessage);
    
    // Test encryption
    const encrypted = await encryptionManager.encryptMessage(testConversationId, testMessage);
    console.log('🔒 Encrypted message:', encrypted);
    
    // Verify it's actually encrypted (should be different from original)
    if (encrypted === testMessage) {
      console.error('❌ Message was not encrypted properly');
      return false;
    }
    
    // Test decryption
    const decrypted = await encryptionManager.decryptMessage(testConversationId, encrypted);
    console.log('🔓 Decrypted message:', decrypted);
    
    // Verify decryption worked
    if (decrypted === testMessage) {
      console.log('✅ Encryption/decryption test passed!');
      
      // Test with empty message
      const emptyEncrypted = await encryptionManager.encryptMessage(testConversationId, '');
      const emptyDecrypted = await encryptionManager.decryptMessage(testConversationId, emptyEncrypted);
      
      if (emptyDecrypted === '') {
        console.log('✅ Empty message test passed!');
      } else {
        console.warn('⚠️ Empty message test failed');
      }
      
      // Test multiple messages with same key
      const msg1 = await encryptionManager.encryptMessage(testConversationId, 'Message 1');
      const msg2 = await encryptionManager.encryptMessage(testConversationId, 'Message 2');
      
      if (msg1 !== msg2) {
        console.log('✅ Multiple message encryption test passed!');
      } else {
        console.warn('⚠️ Multiple messages produced same ciphertext');
      }
      
      // Clean up test data
      encryptionManager.clearConversationKey(testConversationId);
      console.log('🧹 Test data cleaned up');
      
      return true;
    } else {
      console.error('❌ Decryption failed - messages do not match');
      console.error('Expected:', testMessage);
      console.error('Got:', decrypted);
      return false;
    }
  } catch (error) {
    console.error('❌ Encryption test failed:', error);
    return false;
  }
};

// Test key persistence
export const testKeyPersistence = async () => {
  console.log('💾 Testing key persistence...');
  
  const testConversationId = 'persistence-test-456';
  const testMessage = 'This message tests key persistence';
  
  try {
    // Generate key and encrypt message
    await encryptionManager.generateConversationKey(testConversationId);
    const encrypted = await encryptionManager.encryptMessage(testConversationId, testMessage);
    
    // Clear memory but keep localStorage
    encryptionManager.conversationKeys.delete(testConversationId);
    
    // Try to decrypt - should reload key from localStorage
    const decrypted = await encryptionManager.decryptMessage(testConversationId, encrypted);
    
    if (decrypted === testMessage) {
      console.log('✅ Key persistence test passed!');
      encryptionManager.clearConversationKey(testConversationId);
      return true;
    } else {
      console.error('❌ Key persistence test failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Key persistence test error:', error);
    return false;
  }
};

// Run all tests
export const runAllTests = async () => {
  console.log('🚀 Running all encryption tests...');
  
  const results = {
    encryptionTest: await testEncryption(),
    keyPersistenceTest: await testKeyPersistence()
  };
  
  const allPassed = Object.values(results).every(result => result === true);
  
  console.log('📊 Test Results:', results);
  
  if (allPassed) {
    console.log('🎉 All encryption tests passed!');
  } else {
    console.log('❌ Some encryption tests failed');
  }
  
  // Show encryption status
  console.log('📈 Encryption Status:', encryptionManager.getEncryptionStatus());
  
  return allPassed;
};

// Auto-run tests in development
if (process.env.NODE_ENV === 'development') {
  // Run tests after a short delay to ensure everything is loaded
  setTimeout(() => {
    runAllTests().catch(console.error);
  }, 1000);
}