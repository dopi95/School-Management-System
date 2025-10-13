// Alternative email service using Brevo API (more reliable on Render)
const sendEmailAPI = async (options) => {
  try {
    // Use EMAIL_PASS as API key if BREVO_API_KEY is not set or invalid
    let apiKey = process.env.BREVO_API_KEY;
    
    // If BREVO_API_KEY is not set or doesn't start with xkeysib-, use EMAIL_PASS
    if (!apiKey || !apiKey.startsWith('xkeysib-')) {
      // Convert SMTP password to API key format
      apiKey = process.env.EMAIL_PASS;
      if (apiKey && apiKey.startsWith('xsmtpsib-')) {
        apiKey = apiKey.replace('xsmtpsib-', 'xkeysib-');
      }
    }
    
    if (!apiKey) {
      throw new Error('No valid API key found in environment variables');
    }
    
    console.log('Sending email via Brevo API to:', options.email);
    console.log('Using API key format:', apiKey.substring(0, 10) + '...');
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
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
          email: options.email
        }],
        subject: options.subject,
        htmlContent: options.html || `<p>${options.message}</p>`
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || response.statusText;
      } catch {
        errorMessage = errorText || response.statusText;
      }
      throw new Error(`Brevo API error (${response.status}): ${errorMessage}`);
    }

    const result = await response.json();
    console.log('Email sent via API successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Brevo API error:', error);
    throw error;
  }
};

export default sendEmailAPI;