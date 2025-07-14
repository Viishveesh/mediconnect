// Quick test to verify encryption fixes
import encryptionManager from './encryption';

export const quickTest = async () => {
  console.log('🔧 Running quick encryption fix test...');
  
  const testConversationId = 'fix-test-789';
  
  try {
    // Test 1: Empty string handling
    console.log('Testing empty string...');
    const emptyEncrypted = await encryptionManager.encryptMessage(testConversationId, '');
    const emptyDecrypted = await encryptionManager.decryptMessage(testConversationId, emptyEncrypted);
    console.log('Empty string test:', emptyEncrypted === '' && emptyDecrypted === '' ? '✅ PASS' : '❌ FAIL');
    
    // Test 2: Normal message
    console.log('Testing normal message...');
    const normalMessage = 'Hello World!';
    const normalEncrypted = await encryptionManager.encryptMessage(testConversationId, normalMessage);
    const normalDecrypted = await encryptionManager.decryptMessage(testConversationId, normalEncrypted);
    console.log('Normal message test:', normalDecrypted === normalMessage ? '✅ PASS' : '❌ FAIL');
    
    // Test 3: Legacy plain text handling
    console.log('Testing legacy plain text...');
    const legacyMessage = 'This is a legacy plain text message';
    const legacyDecrypted = await encryptionManager.decryptMessage(testConversationId, legacyMessage);
    console.log('Legacy text test:', legacyDecrypted === legacyMessage ? '✅ PASS' : '❌ FAIL');
    
    // Test 4: Invalid base64 handling
    console.log('Testing invalid base64...');
    const invalidBase64 = 'This is not base64!@#$%';
    const invalidDecrypted = await encryptionManager.decryptMessage(testConversationId, invalidBase64);
    console.log('Invalid base64 test:', invalidDecrypted === invalidBase64 ? '✅ PASS' : '❌ FAIL');
    
    // Clean up
    encryptionManager.clearConversationKey(testConversationId);
    
    console.log('🎉 Quick test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Quick test failed:', error);
    return false;
  }
};

// Auto-run if in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    quickTest().catch(console.error);
  }, 3000);
}