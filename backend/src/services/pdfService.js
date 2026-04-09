const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// שירות PDF - מטפל ביצירת כל ה-PDF במערכת
// משתמש ב-PDFKit
class PDFService {
    constructor() {
        // יצירת תיקיית PDFs אם לא קיימת
        this.pdfsDirectory = path.join(__dirname, '../../temp/pdfs');
        if (!fs.existsSync(this.pdfsDirectory)) {
            fs.mkdirSync(this.pdfsDirectory, { recursive: true });
        }
    }

    // generateOrderReceipt - יוצר קבלה PDF להזמנה
    // orderData - נתוני הזמנה מלאים
    // orderData.order_number - מספר הזמנה
    // orderData.customer_name - שם לקוח
    // orderData.customer_email - אימייל לקוח
    // orderData.phone_number - מספר טלפון (אופציונלי)
    // orderData.address - כתובת משלוח (JSON או אובייקט)
    // orderData.items - מערך מוצרים (product_id, quantity, selected_size, product_name, product_price)
    // orderData.base_amount - סכום בסיס
    // orderData.tax_amount - סכום מס
    // orderData.delivery_cost - עלות משלוח
    // orderData.total_amount - סכום כולל
    // orderData.payment_method - שיטת תשלום
    // orderData.created_at - תאריך הזמנה
    // orderData.currency - מטבע (ברירת מחדל: ILS)
    // תגובה: Buffer של PDF שניתן להוריד
    async generateOrderReceipt(orderData) {
        return new Promise((resolve, reject) => {
            try {
                // יצירת מסמך PDF חדש
                const doc = new PDFDocument({ 
                    size: 'A4',
                    margins: { top: 50, bottom: 50, left: 50, right: 50 }
                });

                // יצירת buffer לאחסון ה-PDF
                const buffers = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfBuffer = Buffer.concat(buffers);
                    resolve(pdfBuffer);
                });
                doc.on('error', reject);

                const currency = orderData.currency || 'ILS';
                const formatCurrency = (amount) => {
                    const formatted = parseFloat(amount || 0).toFixed(2);
                    if (currency === 'ILS') {
                        // Using shekel symbol (₪) - Unicode U+20AA (New Israeli Shekel)
                        // Using Unicode escape to ensure proper encoding in PDFKit
                        const shekelSymbol = '\u20AA';
                        return `${shekelSymbol}${formatted}`;
                    }
                    return `${currency} ${formatted}`;
                };

                // כותרת ראשית
                doc.fontSize(24)
                   .font('Helvetica-Bold')
                   .fillColor('#667eea')
                   .text('Order Receipt', 50, 50, { align: 'center' });

                // מספר הזמנה
                doc.fontSize(16)
                   .font('Helvetica-Bold')
                   .fillColor('#333333')
                   .text(`Order #${orderData.order_number}`, 50, 90, { align: 'center' });

                // תאריך הזמנה
                const orderDate = orderData.created_at 
                    ? new Date(orderData.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })
                    : new Date().toLocaleDateString();
                doc.fontSize(12)
                   .font('Helvetica')
                   .fillColor('#666666')
                   .text(`Date: ${orderDate}`, 50, 115, { align: 'center' });

                let yPosition = 160;

                // פרטי לקוח
                doc.fontSize(14)
                   .font('Helvetica-Bold')
                   .fillColor('#333333')
                   .text('Customer Information', 50, yPosition);

                yPosition += 25;
                doc.fontSize(11)
                   .font('Helvetica')
                   .fillColor('#000000')
                   .text(`Name: ${orderData.customer_name || 'N/A'}`, 50, yPosition);
                
                yPosition += 18;
                doc.text(`Email: ${orderData.customer_email || 'N/A'}`, 50, yPosition);
                
                if (orderData.phone_number) {
                    yPosition += 18;
                    doc.text(`Phone: ${orderData.phone_number}`, 50, yPosition);
                }

                yPosition += 30;

                // כתובת משלוח
                if (orderData.address) {
                    doc.fontSize(14)
                       .font('Helvetica-Bold')
                       .fillColor('#333333')
                       .text('Delivery Address', 50, yPosition);

                    yPosition += 25;
                    doc.fontSize(11)
                       .font('Helvetica')
                       .fillColor('#000000');

                    const address = typeof orderData.address === 'string' 
                        ? JSON.parse(orderData.address) 
                        : orderData.address;

                    if (address.house_number) {
                        doc.text(`House Number: ${address.house_number}`, 50, yPosition);
                        yPosition += 18;
                    }
                    if (address.street) {
                        doc.text(`Street: ${address.street}`, 50, yPosition);
                        yPosition += 18;
                    }
                    if (address.city) {
                        doc.text(`City: ${address.city}`, 50, yPosition);
                        yPosition += 18;
                    }
                    if (address.zipcode) {
                        doc.text(`Zip Code: ${address.zipcode}`, 50, yPosition);
                        yPosition += 18;
                    }

                    yPosition += 20;
                }

                // מוצרים
                doc.fontSize(14)
                   .font('Helvetica-Bold')
                   .fillColor('#333333')
                   .text('Order Items', 50, yPosition);

                yPosition += 25;

                // כותרת טבלת מוצרים
                const tableTop = yPosition;
                doc.fontSize(10)
                   .font('Helvetica-Bold')
                   .fillColor('#666666')
                   .text('Product', 50, tableTop)
                   .text('Size', 200, tableTop)
                   .text('Quantity', 270, tableTop)
                   .text('Price', 340, tableTop)
                   .text('Total', 410, tableTop);

                // קו תחתון לכותרת
                doc.moveTo(50, tableTop + 15)
                   .lineTo(550, tableTop + 15)
                   .strokeColor('#cccccc')
                   .lineWidth(1)
                   .stroke();

                yPosition += 25;

                // רשימת מוצרים
                if (orderData.items && Array.isArray(orderData.items) && orderData.items.length > 0) {
                    orderData.items.forEach((item, index) => {
                        const productName = item.product_name || item.name || `Product #${item.product_id}`;
                        const size = item.selected_size || 'N/A';
                        const quantity = item.quantity || 1;
                        const unitPrice = parseFloat(item.product_price || item.price || 0);
                        const itemTotal = unitPrice * quantity;

                        // בדיקה אם צריך דף חדש
                        if (yPosition > 700) {
                            doc.addPage();
                            yPosition = 50;
                        }

                        doc.fontSize(10)
                           .font('Helvetica')
                           .fillColor('#000000')
                           .text(productName.substring(0, 25), 50, yPosition, { width: 140 })
                           .text(size.toString(), 200, yPosition)
                           .text(quantity.toString(), 270, yPosition)
                           .text(formatCurrency(unitPrice), 340, yPosition)
                           .text(formatCurrency(itemTotal), 410, yPosition);

                        yPosition += 20;
                    });
                } else {
                    doc.fontSize(10)
                       .font('Helvetica')
                       .fillColor('#666666')
                       .text('No items found', 50, yPosition);
                    yPosition += 20;
                }

                yPosition += 20;

                // קו מפריד לפני סיכום
                doc.moveTo(50, yPosition)
                   .lineTo(550, yPosition)
                   .strokeColor('#cccccc')
                   .lineWidth(1)
                   .stroke();

                yPosition += 20;

                // סיכום הזמנה
                doc.fontSize(14)
                   .font('Helvetica-Bold')
                   .fillColor('#333333')
                   .text('Order Summary', 50, yPosition);

                yPosition += 25;

                // סכום בסיס
                doc.fontSize(11)
                   .font('Helvetica')
                   .fillColor('#000000')
                   .text('Base Amount:', 350, yPosition)
                   .font('Helvetica-Bold')
                   .text(formatCurrency(orderData.base_amount || orderData.total_amount || 0), 470, yPosition, { align: 'right' });

                yPosition += 20;

                // מס
                if (orderData.tax_amount && parseFloat(orderData.tax_amount) > 0) {
                    doc.font('Helvetica')
                       .fillColor('#000000')
                       .text('Tax Included:', 350, yPosition)
                       .font('Helvetica-Bold')
                       .text(formatCurrency(orderData.tax_amount), 470, yPosition, { align: 'right' });
                    yPosition += 20;
                }

                // עלות משלוח
                doc.font('Helvetica')
                   .fillColor('#000000')
                   .text('Delivery:', 350, yPosition);
                
                if (orderData.delivery_cost && parseFloat(orderData.delivery_cost) > 0) {
                    doc.font('Helvetica-Bold')
                       .text(formatCurrency(orderData.delivery_cost), 470, yPosition, { align: 'right' });
                } else {
                    doc.font('Helvetica-Bold')
                       .fillColor('#28a745')
                       .text('FREE', 470, yPosition, { align: 'right' });
                }

                yPosition += 25;

                // קו כפול לפני סה"כ
                doc.moveTo(350, yPosition)
                   .lineTo(550, yPosition)
                   .strokeColor('#333333')
                   .lineWidth(2)
                   .stroke();

                yPosition += 20;

                // סה"כ כולל
                doc.fontSize(16)
                   .font('Helvetica-Bold')
                   .fillColor('#667eea')
                   .text('Total Amount:', 350, yPosition)
                   .text(formatCurrency(orderData.total_amount || orderData.final_total || 0), 470, yPosition, { align: 'right' });

                yPosition += 40;

                // שיטת תשלום
                if (orderData.payment_method) {
                    doc.fontSize(12)
                       .font('Helvetica-Bold')
                       .fillColor('#333333')
                       .text('Payment Method:', 50, yPosition);
                    
                    yPosition += 20;
                    doc.fontSize(11)
                       .font('Helvetica')
                       .fillColor('#000000')
                       .text(this.formatPaymentMethod(orderData.payment_method), 50, yPosition);
                    
                    yPosition += 30;
                }

                // הערות תחתונות
                doc.fontSize(9)
                   .font('Helvetica')
                   .fillColor('#666666')
                   .text('Thank you for your purchase!', 50, yPosition, { align: 'center' });

                yPosition += 15;
                doc.text('If you have any questions about your order, please contact our support team.', 50, yPosition, { align: 'center' });

                // סיום המסמך
                doc.end();

            } catch (error) {
                console.error('Error generating PDF receipt:', error);
                reject(new Error('Failed to generate PDF receipt'));
            }
        });
    }

    // formatPaymentMethod - מעצב את שיטת התשלום לטקסט קריא
    // paymentMethod - שיטת תשלום (credit-card, paypal, etc.)
    // תגובה: טקסט מעוצב
    formatPaymentMethod(paymentMethod) {
        const methods = {
            'credit-card': 'Credit Card',
            'paypal': 'PayPal',
            'cash': 'Cash on Delivery',
            'bank-transfer': 'Bank Transfer'
        };
        return methods[paymentMethod] || paymentMethod;
    }
}

module.exports = new PDFService();

