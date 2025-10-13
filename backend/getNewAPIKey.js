console.log('🔑 How to get a new Brevo API key:\n');
console.log('1. Go to: https://app.brevo.com/settings/keys/api');
console.log('2. Click "Generate a new API key"');
console.log('3. Give it a name (e.g., "School Management System")');
console.log('4. Copy the key that starts with "xkeysib-"');
console.log('5. Replace BREVO_API_KEY in your .env file');
console.log('\n⚠️  Your current API key is invalid or expired');
console.log('Current key format:', process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.substring(0, 15) + '...' : 'Not found');