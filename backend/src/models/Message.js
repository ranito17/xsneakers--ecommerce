// מודל ההודעות - מנהל את כל הפעולות הקשורות להודעות במסד הנתונים
const dbSingleton = require('../config/database');

class Message {
    // קבלת כל ההודעות (ללא סינון, כל הסינון נעשה ב-frontend)
    static async getAllMessages() {
        try {
            const db = await dbSingleton.getConnection();
            
            const [messages] = await db.query(`
                SELECT 
                    cm.*,
                    o.order_number,
                    p.name as product_name,
                    u.full_name as sender_full_name
                FROM contact_messages cm
                LEFT JOIN orders o ON cm.order_id = o.order_id
                LEFT JOIN products p ON cm.product_id = p.id
                LEFT JOIN users u ON cm.sender_user_id = u.id
                ORDER BY cm.created_at DESC
            `);
            
            return messages;
        } catch (error) {
            console.error('Error getting messages:', error);
            throw error;
        }
    }
    
    // קבלת הודעה לפי מזהה
    static async getMessageById(messageId) {
        try {
            const db = await dbSingleton.getConnection();
            
            const [messages] = await db.query(`
                SELECT 
                    cm.*,
                    o.order_number,
                    p.name as product_name,
                    u.full_name as sender_full_name
                FROM contact_messages cm
                LEFT JOIN orders o ON cm.order_id = o.order_id
                LEFT JOIN products p ON cm.product_id = p.id
                LEFT JOIN users u ON cm.sender_user_id = u.id
                WHERE cm.message_id = ?
            `, [messageId]);
            
            return messages[0] || null;
        } catch (error) {
            console.error('Error getting message by ID:', error);
            throw error;
        }
    }
    
    // יצירת הודעה חדשה
    static async createMessage(messageData) {
        try {
            const db = await dbSingleton.getConnection();
            
            const {
                messageType,
                senderUserId,
                senderName,
                senderEmail,
                senderPhone,
                recipientEmail,
                subject,
                message,
                orderId,
                productId
            } = messageData;
            
            const [result] = await db.query(`
                INSERT INTO contact_messages (
                    message_type,
                    sender_user_id,
                    sender_name,
                    sender_email,
                    sender_phone,
                    recipient_email,
                    subject,
                    message,
                    order_id,
                    product_id,
                    status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')
            `, [
                messageType,
                senderUserId || null,
                senderName,
                senderEmail,
                senderPhone || null,
                recipientEmail || null,
                subject,
                message,
                orderId || null,
                productId || null
            ]);
            
            return {
                messageId: result.insertId,
                ...messageData
            };
        } catch (error) {
            console.error('Error creating message:', error);
            throw error;
        }
    }
    
    // עדכון סטטוס הודעה
    static async updateMessageStatus(messageId, status) {
        try {
            const db = await dbSingleton.getConnection();
            
            await db.query(
                'UPDATE contact_messages SET status = ?, updated_at = NOW() WHERE message_id = ?',
                [status, messageId]
            );
            
            return await this.getMessageById(messageId);
        } catch (error) {
            console.error('Error updating message status:', error);
            throw error;
        }
    }
    
    // מחיקת הודעה (רק אם resolved או archived)
    static async deleteMessage(messageId) {
        try {
            const db = await dbSingleton.getConnection();
            
            // בדיקה אם ההודעה resolved או archived
            const [messages] = await db.query(
                'SELECT status FROM contact_messages WHERE message_id = ?',
                [messageId]
            );
            
            if (messages.length === 0) {
                throw new Error('Message not found');
            }
            
            if (messages[0].status !== 'resolved' && messages[0].status !== 'archived') {
                throw new Error('Only resolved or archived messages can be deleted');
            }
            
            await db.query(
                'DELETE FROM contact_messages WHERE message_id = ?',
                [messageId]
            );
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    }
    
    // קבלת ספירת הודעות שלא נקראו
    static async getUnreadCount() {
        try {
            const db = await dbSingleton.getConnection();
            
            const [result] = await db.query(`
                SELECT COUNT(*) as count 
                FROM contact_messages 
                WHERE status = 'new' 
                AND message_type IN ('guest_to_admin', 'customer_to_admin', 'customer_to_admin_urgent')
            `);
            
            return result[0].count;
        } catch (error) {
            console.error('Error getting unread count:', error);
            throw error;
        }
    }
}

module.exports = Message;

