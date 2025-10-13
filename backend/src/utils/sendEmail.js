import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    console.log('Email configuration:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      from: process.env.EMAIL_FROM
    });

    // Try different ports for Render compatibility
    const ports = [587, 2587, 25];
    let transporter;
    let lastError;
    
    for (const port of ports) {
      try {
        transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: port,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          tls: {
            rejectUnauthorized: false
          },
          connectionTimeout: 10000, // 10 seconds
          greetingTimeout: 5000, // 5 seconds
          socketTimeout: 10000, // 10 seconds
          pool: true,
          maxConnections: 1,
          debug: false,
          logger: false
        });
        
        // Test connection
        await transporter.verify();
        console.log(`SMTP connection verified on port ${port}`);
        break;
      } catch (error) {
        console.log(`Port ${port} failed:`, error.message);
        lastError = error;
        transporter = null;
      }
    }
    
    if (!transporter) {
      throw new Error(`All SMTP ports failed. Last error: ${lastError.message}`);
    }

    // Connection already verified above

    const message = {
      from: `${process.env.EMAIL_FROM} <elyasyenealem95@gmail.com>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    console.log('Sending email to:', options.email);
    console.log('Email message:', message);
    const info = await transporter.sendMail(message);
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response
    });
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

export default sendEmail;