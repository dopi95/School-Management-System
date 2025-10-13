// Alternative email service using Brevo API (more reliable on Render)
const sendEmailAPI = async (options) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY environment variable is not set');
    }
    
    console.log('Sending email via Brevo API to:', options.email);
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          name: process.env.EMAIL_FROM,
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
      const error = await response.json();
      throw new Error(`Brevo API error: ${error.message || response.statusText}`);
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