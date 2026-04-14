// בקר הודעות - מטפל בבקשות הקשורות להודעות
const Message = require('../models/Message');
const emailService = require('../services/emailService');
const { getSettings } = require('../models/Settings');
const {
    validateMessageIdParam,
    validateCreateMessagePayload,
    validateUpdateMessageStatusPayload
} = require('../validation/messageValidator');

// קבלת כל ההודעות (סינון נעשה ב-frontend)
const getAllMessages = async (req, res) => {
    try {
        const messages = await Message.getAllMessages();
        
        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('Error in getAllMessages:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// קבלת הודעה בודדת לפי ID
const getMessageById = async (req, res) => {
    try {
        const { messageId } = req.params;
        
        const message = await Message.getMessageById(messageId);
        
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: message
        });
    } catch (error) {
        console.error('Error in getMessageById:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// יצירת הודעה חדשה
const createMessage = async (req, res) => {
    try {
        const validation = validateCreateMessagePayload(req.body);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

       
        
        // אם המשתמש מאומת, הגדרת sender_user_id
        const senderUserId = req.user ? req.user.id : null;
        const {
            messageType,
            name,
            email,
            phone,
            recipientEmail,
            subject,
            message,
            orderId,
            productId
        } = validation.sanitizedData;
        
        const messageData = {
            messageType,
            senderUserId,
            senderName: name,
            senderEmail: email,
            senderPhone: phone,
            recipientEmail: recipientEmail || null,
            subject,
            message,
            orderId: orderId || null,
            productId: productId || null
        };
        
        // שמירת הודעה במסד הנתונים
        const result = await Message.createMessage(messageData);
        
        // שליחת אימייל (למעט הודעות אדמין לאדמין)
        if (messageType !== 'admin_to_admin') {
            try {
                await sendMessageEmail(messageData, messageType);
            } catch (emailError) {
                console.error('Error sending email, but message was saved:', emailError);
                // המשך גם אם אימייל נכשל - ההודעה עדיין נשמרה
            }
        }
        
        res.status(201).json({
            success: true,
            data: result,
            message: 'Message sent successfully'
        });
    } catch (error) {
        console.error('Error in createMessage:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// פונקציית עזר לשליחת אימיילי הודעות באמצעות פונקציות שירות אימייל מתאימות
const sendMessageEmail = async (messageData, messageType) => {
    const settings = await getSettings();
    
    switch (messageType) {
        case 'guest_to_admin':
        case 'customer_to_admin':
        case 'customer_to_admin_urgent':
            // שימוש בפונקציית אימייל קשר לקוח ספציפית
            await emailService.sendCustomerContactEmail({
                name: messageData.senderName,
                email: messageData.senderEmail,
                subject: messageType === 'customer_to_admin_urgent' 
                    ? `[URGENT] ${messageData.subject}` 
                    : messageData.subject,
                message: messageData.message
            });
            break;
            
        case 'admin_to_supplier':
            // הודעת אדמין לספק - שימוש באימייל גנרי
            const supplierEmail = messageData.recipientEmail || settings.supplier_email;
            await emailService.sendEmail(
                supplierEmail,
                messageData.subject,
                messageData.message,
                `<p>${messageData.message.replace(/\n/g, '<br>')}</p>`
            );
            break;
            
        case 'low_stock_alert':
            // שימוש בפונקציית אימייל מילוי מלאי ספציפית
            // הערה: זה מצפה למערך מוצרים, אז עבור מלאי נמוך אולי נצטרך לעצב את זה
            const supplierEmailForStock = messageData.recipientEmail || settings.supplier_email;
            await emailService.sendEmail(
                supplierEmailForStock,
                messageData.subject,
                messageData.message,
                `<p>${messageData.message.replace(/\n/g, '<br>')}</p>`
            );
            break;
            
        case 'reply':
            // תשובה ללקוח - שליחה מאימייל אדמין
            await emailService.sendEmail(
                messageData.recipientEmail,
                messageData.subject,
                messageData.message,
                `<p>${messageData.message.replace(/\n/g, '<br>')}</p>`,
                messageData.senderEmail, // מ: אימייל אדמין
                messageData.senderName   // מ: שם אדמין
            );
            break;
    }
};

// עדכון סטטוס הודעה
const updateMessageStatus = async (req, res) => {
    try {
        const idValidation = validateMessageIdParam(req.params.messageId);
        if (!idValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: idValidation.errors
            });
        }

        const validation = validateUpdateMessageStatusPayload(req.body);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const message = await Message.updateMessageStatus(idValidation.sanitized, validation.sanitizedData.status);
        
        res.status(200).json({
            success: true,
            data: message,
            message: 'Message status updated'
        });
    } catch (error) {
        console.error('Error in updateMessageStatus:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// מחיקת הודעה (רק הודעות שטופלו)
const deleteMessage = async (req, res) => {
    try {
        const idValidation = validateMessageIdParam(req.params.messageId);
        if (!idValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: idValidation.errors
            });
        }

        await Message.deleteMessage(idValidation.sanitized);
        
        res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteMessage:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// קבלת מספר הודעות שלא נקראו
const getUnreadCount = async (req, res) => {
    try {
        const count = await Message.getUnreadCount();
        
        res.status(200).json({
            success: true,
            data: { count }
        });
    } catch (error) {
        console.error('Error in getUnreadCount:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllMessages,
    getMessageById,
    createMessage,
    updateMessageStatus,
    deleteMessage,
    getUnreadCount
};

