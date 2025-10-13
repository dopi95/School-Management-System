import dotenv from 'dotenv';
dotenv.config();

const testBrevoAPI = async () => {
  console.log('Testing Brevo API configuration...\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.substring(0, 15) + '...' : 'Not set');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.substring(0, 15) + '...' : 'Not set');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('');
  
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    console.error('❌ BREVO_API_KEY not found in environment variables');
    return;
  }
  
  if (!apiKey.startsWith('xkeysib-')) {
    console.error('❌ Invalid API key format. Brevo API keys should start with "xkeysib-"');
    console.log('Your key starts with:', apiKey.substring(0, 10));
    console.log('\n📝 To get a valid API key:');
    console.log('1. Go to https://app.brevo.com/settings/keys/api');
    console.log('2. Create a new API key');
    console.log('3. Copy the key that starts with "xkeysib-"');
    console.log('4. Update your .env file with BREVO_API_KEY=your_new_key');
    return;
  }
  
  console.log('✅ API key format looks correct');
  console.log('Testing API connection...\n');
  
  try {
    // Test API connection with account info
    const response = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api-key': apiKey
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API connection failed:', response.status, errorText);
      
      if (response.status === 401) {
        console.log('\n📝 This means your API key is invalid or expired.');
        console.log('Please generate a new API key from your Brevo dashboard.');
      }
      return;
    }
    
    const accountInfo = await response.json();
    console.log('✅ API connection successful!');
    console.log('Account info:', {
      email: accountInfo.email,
      firstName: accountInfo.firstName,
      lastName: accountInfo.lastName,
      companyName: accountInfo.companyName
    });
    
    // Test sending a simple email
    console.log('\nTesting email sending...');
    
    const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        sender: {
          name: process.env.EMAIL_FROM || 'Bluelight Academy',
          email: 'elyasyenealem95@gmail.com'
        },
        to: [{
          email: 'elyasyenealem95@gmail.com' // Send test email to yourself
        }],
        subject: 'Brevo API Test - Bluelight Academy',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Brevo API Test Successful!</h2>
            <p>This is a test email to verify that your Brevo API configuration is working correctly.</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">Bluelight Academy Management System</p>
          </div>
        `
      })
    });
    
    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('❌ Email sending failed:', emailResponse.status, errorText);
      return;
    }
    
    const emailResult = await emailResponse.json();
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', emailResult.messageId);
    console.log('\n🎉 Your Brevo API is working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
};

testBrevoAPI();