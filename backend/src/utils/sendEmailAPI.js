const sendEmailAPI = async (options) => {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    
    console.log('Environment check:', {
      hasApiKey: !!apiKey,
      keyPrefix: apiKey ? apiKey.substring(0, 15) : 'none',
      nodeEnv: process.env.NODE_ENV
    });
    
    if (!apiKey) {
      throw new Error('BREVO_API_KEY not found in environment variables');
    }
    
    if (!apiKey.startsWith('xkeysib-')) {
      throw new Error(`Invalid Brevo API key format. Got: ${apiKey.substring(0, 15)}...`);
    }
    
    console.log('Sending email via Brevo API to:', options.email);
    console.log('Using API key format:', apiKey.substring(0, 15) + '...');
    
    const emailPayload = {
      sender: {
        name: process.env.EMAIL_FROM || 'Bluelight Academy',
        email: 'elyasyenealem95@gmail.com'
      },
      to: [{
        email: options.email
      }],
      subject: options.subject,
      htmlContent: options.html || `<p>${options.message}</p>`
    };
    
    console.log('Email payload:', JSON.stringify(emailPayload, null, 2));
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(emailPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Brevo API error response:', errorText);
      let errorMessage;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorJson.code || response.statusText;
        console.error('Parsed error:', errorJson);
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