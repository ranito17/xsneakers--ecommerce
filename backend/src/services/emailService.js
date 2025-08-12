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
     * @param {string} fromEmail - Custom from email (optional)
     * @param {string} fromName - Custom from name (optional)
     */
    async sendEmail(to, subject, text, html = null, fromEmail = null, fromName = null) {
        try {
            const msg = {
                to: to,
                from: {
                    email: fromEmail || this.fromEmail,
                    name: fromName || this.fromName
                },
                subject: subject,
                text: text,
                html: html || text
            };

            console.log('Sending email with config:', {
                to: to,
                from: fromEmail || this.fromEmail,
                fromName: fromName || this.fromName,
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

    /**
     * Send customer contact email to admin
     * @param {Object} contactData - Contact form data
     * @param {string} contactData.name - Customer name
     * @param {string} contactData.email - Customer email
     * @param {string} contactData.subject - Email subject
     * @param {string} contactData.message - Email message
     */
    async sendCustomerContactEmail(contactData) {
        try {
            const { name, email, subject, message } = contactData;
            
            // Check if admin email is configured
            if (!config.sendgrid.adminEmail) {
                console.error('Admin email not configured. Please set ADMIN_EMAIL in your environment variables.');
                throw new Error('Admin email not configured. Please contact support.');
            }
            
            // Email to admin
            const adminSubject = `Customer Contact: ${subject}`;
            const adminText = `
                New customer contact message:
                
                Name: ${name}
                Email: ${email}
                Subject: ${subject}
                Message: ${message}
            `;
            
            const adminHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Customer Contact</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .contact-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                        .message-box { background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 15px 0; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Customer Contact Message</h1>
                            <p>New inquiry from website</p>
                        </div>
                        <div class="content">
                            <div class="contact-details">
                                <h3>Contact Information:</h3>
                                <p><strong>Name:</strong> ${name}</p>
                                <p><strong>Email:</strong> ${email}</p>
                                <p><strong>Subject:</strong> ${subject}</p>
                            </div>
                            
                            <div class="message-box">
                                <h3>Message:</h3>
                                <p>${message.replace(/\n/g, '<br>')}</p>
                            </div>
                            
                            <p>Please respond to this customer inquiry as soon as possible.</p>
                        </div>
                        <div class="footer">
                            <p>This message was sent from your store's contact form.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            // Send to admin
            await this.sendEmail(config.sendgrid.adminEmail, adminSubject, adminText, adminHtml);

            // Send confirmation to customer
            const customerSubject = 'Thank you for contacting us';
            const customerText = `
                Dear ${name},
                
                Thank you for contacting us. We have received your message and will get back to you as soon as possible.
                
                Your message:
                Subject: ${subject}
                Message: ${message}
                
                Best regards,
                Your Store Team
            `;
            
            const customerHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Message Received</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .message-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Message Received</h1>
                            <p>Thank you for contacting us</p>
                        </div>
                        <div class="content">
                            <p>Dear ${name},</p>
                            
                            <p>Thank you for contacting us. We have received your message and will get back to you as soon as possible.</p>
                            
                            <div class="message-box">
                                <h3>Your Message:</h3>
                                <p><strong>Subject:</strong> ${subject}</p>
                                <p><strong>Message:</strong></p>
                                <p>${message.replace(/\n/g, '<br>')}</p>
                            </div>
                            
                            <p>We typically respond within 24 hours during business days.</p>
                            
                            <p>Best regards,<br>Your Store Team</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated confirmation. Please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            // Send confirmation to customer (from store email to customer)
            await this.sendEmail(email, customerSubject, customerText, customerHtml);

            return { success: true, message: 'Contact email sent successfully' };
            
        } catch (error) {
            console.error('Error sending customer contact email:', error);
            throw new Error('Failed to send contact email. Please try again later.');
        }
    }
}

module.exports = new EmailService(); 