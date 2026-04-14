const nodemailer = require('nodemailer');
const config = require('../config/config');
const { getSettings } = require('../models/Settings');

// שירות אימייל - מטפל בשליחת כל האימיילים במערכת
// משתמש ב-nodemailer
class EmailService {
    constructor() {
        this.fromEmail = config.email.fromEmail;
        this.fromName = config.email.fromName;
        
        // יצירת transporter ל-nodemailer - Gmail
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER || process.env.FROM_EMAIL,
                pass: process.env.GMAIL_APP_PASSWORD // Must be App Password, not regular password!
            }
        });

        // בדיקת חיבור
        this.transporter.verify((error, success) => {
            if (error) {
                console.error('SMTP connection error:', error);
            } else {
                }
        });
    }

    // שליחת אימייל טקסט פשוט
    // to - כתובת אימייל נמען
    // subject - נושא האימייל
    // text - תוכן טקסט רגיל
    // html - תוכן HTML (אופציונלי)
    // fromEmail - כתובת אימייל מותאמת אישית (אופציונלי)
    // fromName - שם מותאם אישית (אופציונלי)
    async sendEmail(to, subject, text, html = null, fromEmail = null, fromName = null) {
        try {
            const mailOptions = {
                from: `${fromName || this.fromName} <${fromEmail || this.fromEmail}>`,
                to: to,
                subject: subject,
                text: text,
                html: html || text
            };

            const info = await this.transporter.sendMail(mailOptions);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Email sending failed:', error);
            console.error('Error details:', {
                code: error.code,
                message: error.message,
                response: error.response
            });
            throw new Error('Failed to send email');
        }
    }

    // פונקציית אימייל בדיקה
    async sendTestEmail(to) {
        return this.sendEmail(
            to,
            'Test Email from XSneakers',
            'This is a test email to verify nodemailer is working.',
            '<h1>Test Email</h1><p>This is a test email to verify nodemailer is working.</p>'
        );
    }

    // שליחת אימייל איפוס סיסמה
    // to - כתובת אימייל משתמש
    // resetToken - טוקן איפוס סיסמה
    // resetUrl - כתובת URL לאיפוס סיסמה
    async sendPasswordResetCode(to, resetCode) {
        const subject = 'Password Reset Code';
        const text = `Your password reset code is: ${resetCode}. This code will expire in 15 minutes.`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset Code</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .code-box { background: white; border: 3px solid #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 30px 0; }
                    .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Code</h1>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>We received a request to reset your password. Use the code below to reset your password:</p>
                        
                        <div class="code-box">
                            <div class="code">${resetCode}</div>
                        </div>
                        
                        <div class="warning">
                            <strong>Security Notice:</strong> This code will expire in 15 minutes. If you didn't request this, please ignore this email.
                        </div>
                        
                        <p>Enter this code on the password reset page along with your new password.</p>
                        
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

    // שליחת אימייל ברכה
    // to - כתובת אימייל משתמש
    // userName - שם המשתמש
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
                            <a href="${config.email.frontendUrl}" class="button">Start Shopping</a>
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

    // שליחת אימייל אישור הזמנה
    // to - כתובת אימייל לקוח
    // order - פרטי הזמנה
    async sendOrderConfirmationEmail(to, order) {
        const subject = `Order Confirmation - #${order.order_number}`;
        const text = `Thank you for your order #${order.order_number}. Total: ${order.currency || 'ILS'} ${parseFloat(order.final_total || order.total_amount).toFixed(2)}`;
        
        // פורמט מטבע
        const formatCurrency = (amount) => {
            const currency = order.currency || 'ILS';
            if (currency === 'ILS') {
                return `₪${parseFloat(amount).toFixed(2)}`;
            }
            return `${currency}${parseFloat(amount).toFixed(2)}`;
        };
        
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
                    .pricing-breakdown { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #667eea; }
                    .pricing-row { display: flex; justify-content: space-between; margin: 8px 0; }
                    .pricing-label { font-weight: 600; color: #495057; }
                    .pricing-value { font-weight: 600; color: #212529; }
                    .total-row { border-top: 2px solid #dee2e6; padding-top: 10px; margin-top: 10px; }
                    .final-total { font-size: 18px; font-weight: bold; color: #667eea; }
                    .delivery-info { background: #e3f2fd; padding: 12px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #2196f3; }
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
                            ${order.arrival_date_estimated ? `<p><strong>Estimated Delivery:</strong> ${new Date(order.arrival_date_estimated).toLocaleDateString()}</p>` : ''}
                        </div>
                        
                        <div class="pricing-breakdown">
                            <h3>Payment Summary:</h3>
                            <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
                                <em>You paid: ${formatCurrency(order.final_total || order.total_amount)}</em>
                            </p>
                            <h4>Price Breakdown:</h4>
                            <div class="pricing-row">
                                <span class="pricing-label">Subtotal:</span>
                                <span class="pricing-value">${formatCurrency(order.base_amount || order.total_amount)}</span>
                            </div>
                            ${order.tax_rate > 0 ? `
                            <div class="pricing-row">
                                <span class="pricing-label">Tax (${order.tax_rate}%):</span>
                                <span class="pricing-value">${formatCurrency(order.tax_amount)}</span>
                            </div>
                            <div class="pricing-row">
                                <span class="pricing-label">Subtotal with Tax:</span>
                                <span class="pricing-value">${formatCurrency(order.total_with_tax)}</span>
                            </div>
                            ` : ''}
                            ${order.delivery_cost > 0 ? `
                            <div class="pricing-row">
                                <span class="pricing-label">Delivery Cost:</span>
                                <span class="pricing-value">${formatCurrency(order.delivery_cost)}</span>
                            </div>
                            ` : `
                            <div class="pricing-row">
                                <span class="pricing-label">Delivery Cost:</span>
                                <span class="pricing-value">Free</span>
                            </div>
                            `}
                            <div class="pricing-row total-row">
                                <span class="pricing-label final-total">Total Paid:</span>
                                <span class="pricing-value final-total">${formatCurrency(order.final_total || order.total_amount)}</span>
                            </div>
                        </div>
                        
                        ${order.delivery_cost > 0 ? `
                        <div class="delivery-info">
                            <h4>Delivery Information:</h4>
                            <p><strong>Free Delivery Threshold:</strong> ${formatCurrency(order.free_delivery_threshold)}</p>
                            <p><strong>Standard Delivery Cost:</strong> ${formatCurrency(order.default_delivery_cost)}</p>
                            <p><em>Add ${formatCurrency(order.free_delivery_threshold - (order.base_amount || order.total_amount))} more to your next order for free delivery!</em></p>
                        </div>
                        ` : `
                        <div class="delivery-info">
                            <h4>Delivery Information:</h4>
                            <p><strong>Free Delivery Threshold:</strong> ${formatCurrency(order.free_delivery_threshold)}</p>
                            <p><em>Congratulations! Your order qualifies for free delivery.</em></p>
                        </div>
                        `}
                        
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

    // שליחת אימייל קשר מלקוח לאדמין
    // contactData - נתוני טופס קשר
    // contactData.name - שם לקוח
    // contactData.email - כתובת אימייל לקוח
    // contactData.subject - נושא אימייל
    // contactData.message - הודעת אימייל
    async sendCustomerContactEmail(contactData) {
        try {
            const { name, email, subject, message } = contactData;
            const settings = await getSettings();
            const storeName = settings.store_name || this.fromName || 'Our Store';
            const storeEmail = settings.email_notification || config.email.adminEmail || this.fromEmail;
            
            if (!storeEmail) {
                console.error('Store email not configured. Please set email_notification in settings or ADMIN_EMAIL env var.');
                throw new Error('Store email not configured. Please contact support.');
            }
            
            // אימייל לאדמין/חנות
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
                            <p>This message was sent from ${storeName}'s contact form.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            // שליחה לאדמין
            await this.sendEmail(storeEmail, adminSubject, adminText, adminHtml, this.fromEmail, storeName);

            // שליחת אישור ללקוח
            const customerSubject = `Thank you for contacting ${storeName}`;
            const customerText = `
                Dear ${name},
                
                Thank you for contacting ${storeName}. We have received your message and will get back to you as soon as possible.
                
                Your message:
                Subject: ${subject}
                Message: ${message}
                
                Best regards,
                ${storeName} Team
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
                            
                            <p>Thank you for contacting ${storeName}. We have received your message and will get back to you as soon as possible.</p>
                            
                            <div class="message-box">
                                <h3>Your Message:</h3>
                                <p><strong>Subject:</strong> ${subject}</p>
                                <p><strong>Message:</strong></p>
                                <p>${message.replace(/\n/g, '<br>')}</p>
                            </div>
                            
                            <p>${storeName} typically responds within 24 hours during business days.</p>
                            
                            <p>Best regards,<br>${storeName} Team</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated confirmation. Please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            // שליחת אישור ללקוח (מאימייל החנות ללקוח)
            await this.sendEmail(email, customerSubject, customerText, customerHtml, this.fromEmail, storeName);

            return { success: true, message: 'Contact email sent successfully' };
            
        } catch (error) {
            console.error('Error sending customer contact email:', error);
            throw new Error('Failed to send contact email. Please try again later.');
        }
    }

    // שליחת אימייל מילוי מלאי לספק
    // refuelData - נתוני בקשת מילוי מלאי
    // refuelData.supplierEmail - כתובת אימייל ספק
    // refuelData.supplierName - שם ספק
    // refuelData.products - מערך מוצרים שצריכים מילוי
    // refuelData.notes - הערות נוספות לספק
    async sendStockRefuelEmail(refuelData) {
        try {
            const { supplierEmail, supplierName, products, notes } = refuelData;
            
            const subject = 'Stock Refuel Request';
            
            // יצירת תוכן טקסט עם כמויות לפי מידה
            const text = `
                Dear ${supplierName},
                
                We need to restock the following products. Please review the list below and ship the requested quantities.
                
                Products needed:
                ${products.map(product => {
                    if (product.sizeQuantities && product.sizeQuantities.length > 0) {
                        const sizeDetails = product.sizeQuantities.map(sq => 
                            `  - Size ${sq.size}: ${sq.quantity} units`
                        ).join('\n');
                        return `- ${product.name}:\n${sizeDetails}`;
                    } else {
                        return `- ${product.name}: ${product.quantity || 0} units`;
                    }
                }).join('\n')}
                
                ${notes ? `\nAdditional Notes:\n${notes}` : ''}
                
                Please ship these items as soon as possible and confirm via email when shipped.
                
                Thank you for your prompt attention to this matter.
                
                Best regards,
                Your Store Team
            `;
            
            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Stock Refuel Request</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; }
                        .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; }
                        .content { background: white; padding: 30px; }
                        .product-list { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
                        .product-item { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0; }
                        .product-item:last-child { border-bottom: none; margin-bottom: 0; }
                        .product-name { font-weight: bold; font-size: 16px; color: #1e3a8a; margin-bottom: 10px; }
                        .size-list { margin-left: 20px; }
                        .size-item { display: flex; justify-content: space-between; padding: 5px 0; }
                        .size-label { font-weight: 500; }
                        .size-quantity { color: #dc2626; font-weight: bold; }
                        .total-quantity { font-weight: bold; color: #1e3a8a; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0; }
                        .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
                        .urgent { color: #dc2626; font-weight: bold; }
                        .notes { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Stock Refuel Request</h1>
                            <p>Please Review and Ship</p>
                        </div>
                        <div class="content">
                            <p>Dear ${supplierName},</p>
                            
                            <p>We need to restock the following products. Please review the list below and ship the requested quantities.</p>
                            
                            <div class="product-list">
                                <h3>Products Needed:</h3>
                                ${products.map(product => {
                                    let totalQuantity = 0;
                                    let sizeDetails = '';
                                    
                                    if (product.sizeQuantities && product.sizeQuantities.length > 0) {
                                        sizeDetails = `
                                            <div class="size-list">
                                                ${product.sizeQuantities.map(sq => {
                                                    totalQuantity += sq.quantity;
                                                    return `
                                                        <div class="size-item">
                                                            <span class="size-label">Size ${sq.size}:</span>
                                                            <span class="size-quantity">${sq.quantity} units</span>
                                                        </div>
                                                    `;
                                                }).join('')}
                                                <div class="total-quantity">
                                                    Total: ${totalQuantity} units
                                                </div>
                                            </div>
                                        `;
                                    } else {
                                        totalQuantity = product.quantity || 0;
                                        sizeDetails = `
                                            <div class="size-item">
                                                <span class="size-label">Total Quantity:</span>
                                                <span class="size-quantity">${totalQuantity} units</span>
                                            </div>
                                        `;
                                    }
                                    
                                    return `
                                        <div class="product-item">
                                            <div class="product-name">${product.name}</div>
                                            ${sizeDetails}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                            
                            ${notes ? `
                                <div class="notes">
                                    <h3>Additional Notes:</h3>
                                    <p>${notes}</p>
                                </div>
                            ` : ''}
                            
                            <p><strong>Please ship these items as soon as possible and confirm via email when shipped.</strong></p>
                            
                            <p>Thank you for your prompt attention to this matter.</p>
                            
                            <p>Best regards,<br>Your Store Team</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated stock refuel request. Please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            await this.sendEmail(supplierEmail, subject, text, html);
            
            return { success: true, message: 'Stock refuel email sent successfully' };
            
        } catch (error) {
            console.error('Error sending stock refuel email:', error);
            throw new Error('Failed to send stock refuel email. Please try again later.');
        }
    }
}

module.exports = new EmailService();
