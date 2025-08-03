const sgMail = require('@sendgrid/mail');
const config = require('../config/config');

// Configure SendGrid with your API key
sgMail.setApiKey(config.sendgrid.apiKey);
console.log('SendGrid API Key:', config.sendgrid.apiKey);

class EmailService {
    constructor() {
        this.fromEmail = config.sendgrid.fromEmail;
        this.fromName = config.sendgrid.fromName;
    }

    /**
     * Send a simple text email
     * @param {string} to - Recipient email
     * @param {string} subject - Email subject
     * @param {string} text - Plain text content
     * @param {string} html - HTML content (optional)
     */
    async sendEmail(to, subject, text, html = null) {
        try {
            const msg = {
                to: to,
                from: {
                    email: this.fromEmail,
                    name: this.fromName
                },
                subject: subject,
                text: text,
                html: html || text
            };

            console.log('Sending email with config:', {
                to: to,
                from: this.fromEmail,
                fromName: this.fromName,
                subject: subject
            });

            const response = await sgMail.send(msg);
            console.log('Email sent successfully:', response[0].statusCode);
            return { success: true, messageId: response[0].headers['x-message-id'] };
        } catch (error) {
            console.error('Email sending failed:', error);
            console.error('Error details:', {
                code: error.code,
                message: error.message,
                response: error.response?.body
            });
            throw new Error('Failed to send email');
        }
    }

    /**
     * Test email function
     */
    async sendTestEmail(to) {
        return this.sendEmail(
            to,
            'Test Email from XSneakers',
            'This is a test email to verify SendGrid is working.',
            '<h1>Test Email</h1><p>This is a test email to verify SendGrid is working.</p>'
        );
    }

    /**
     * Send password reset email
     * @param {string} to - User email
     * @param {string} resetToken - Password reset token
     * @param {string} resetUrl - Password reset URL
     */
    async sendPasswordResetEmail(to, resetToken, resetUrl) {
        const subject = 'Password Reset Request';
        const text = `You requested a password reset. Click this link to reset your password: ${resetUrl}`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
                        
                        <div style="text-align: center;">
                            <a href="${resetUrl}" class="button">Reset Password</a>
                        </div>
                        
                        <div class="warning">
                            <strong>Security Notice:</strong> This link will expire in 1 hour for your security.
                        </div>
                        
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
                        
                        <p>Best regards,<br>Your Store Team</p>
                    </div>
                    <div class="footer">
                        <p>This email was sent from your store. If you have any questions, please contact support.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail(to, subject, text, html);
    }

    /**
     * Send welcome email
     * @param {string} to - User email
     * @param {string} userName - User's name
     */
    async sendWelcomeEmail(to, userName) {
        const subject = 'Welcome to Our Store!';
        const text = `Welcome ${userName}! Thank you for joining our store.`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome!</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Our Store!</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${userName},</p>
                        <p>Welcome to our store! We're excited to have you as a customer.</p>
                        
                        <div style="text-align: center;">
                            <a href="${config.sendgrid.frontendUrl}" class="button">Start Shopping</a>
                        </div>
                        
                        <p>Here's what you can do:</p>
                        <ul>
                            <li>Browse our products</li>
                            <li>Create your first order</li>
                            <li>Save your favorite items</li>
                            <li>Track your orders</li>
                        </ul>
                        
                        <p>If you have any questions, feel free to contact our support team.</p>
                        
                        <p>Happy shopping!<br>Your Store Team</p>
                    </div>
                    <div class="footer">
                        <p>Thank you for choosing our store!</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail(to, subject, text, html);
    }

    /**
     * Send order confirmation email
     * @param {string} to - Customer email
     * @param {Object} order - Order details
     */
    async sendOrderConfirmationEmail(to, order) {
        const subject = `Order Confirmation - #${order.order_number}`;
        const text = `Thank you for your order #${order.order_number}. Total: $${order.total_amount}`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Order Confirmation</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .order-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                    .total { font-size: 18px; font-weight: bold; color: #667eea; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Order Confirmation</h1>
                        <p>Order #${order.order_number}</p>
                    </div>
                    <div class="content">
                        <p>Thank you for your order!</p>
                        
                        <div class="order-details">
                            <h3>Order Details:</h3>
                            <p><strong>Order Number:</strong> ${order.order_number}</p>
                            <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                            <p><strong>Status:</strong> ${order.status}</p>
                            <p class="total"><strong>Total Amount:</strong> $${parseFloat(order.total_amount).toFixed(2)}</p>
                        </div>
                        
                        <p>We'll send you updates as your order progresses.</p>
                        
                        <p>Thank you for shopping with us!<br>Your Store Team</p>
                    </div>
                    <div class="footer">
                        <p>If you have any questions about your order, please contact support.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail(to, subject, text, html);
    }
}

module.exports = new EmailService(); 