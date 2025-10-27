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
    // Gmail SMTP configuration
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
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
    try {
      const mailOptions = {
        from: `"Etxplore" <${this.from}>`,
        to: this.to,
        subject,
        html,
        text: htmlToText.convert(html)
      };
      
      const info = await this.newTransport().sendMail(mailOptions);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Email sent successfully:', info.messageId);
      }
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
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
