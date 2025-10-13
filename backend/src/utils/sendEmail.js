import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    console.log('Email configuration:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      from: process.env.EMAIL_FROM
    });

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.BREVO_API_KEY,
      },
      tls: {
        rejectUnauthorized: false
      },
      debug: true,
      logger: true
    });

    // Verify connection
    await transporter.verify();
    console.log('SMTP connection verified successfully');

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