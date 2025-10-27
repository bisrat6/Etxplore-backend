const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = process.env.EMAIL_FROM || 'noreply@etxplore.com';
  }

  newTransport() {
    // Try port 465 with SSL for better compatibility with Railway
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for 587
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    // 2) Send email using Gmail via Nodemailer
    console.log('📧 Attempting to send email to:', this.to);
    console.log('📧 Using Gmail account:', process.env.GMAIL_USER);
    
    try {
      const transporter = this.newTransport();
      
      // Verify connection configuration
      await transporter.verify();
      console.log('✅ SMTP connection verified');
      
      const mailOptions = {
        from: `"Etxplore" <${this.from}>`,
        to: this.to,
        subject,
        html,
        text: htmlToText.convert(html)
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      
      return info;
    } catch (error) {
      console.error('❌ Email sending failed:', {
        message: error.message,
        code: error.code,
        command: error.command
      });
      throw error;
    }
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Etxplore Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }

  async sendEmailVerification() {
    await this.send('emailVerification', 'Please verify your email address');
  }
};
