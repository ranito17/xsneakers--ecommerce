// frontend/src/services/messageApi.js
import api from './api';

export const messageApi = {
    // קבלת כל ההודעות (אדמין) - הסינון נעשה בפרונט
    getAllMessages: async () => {
        try {
            const response = await api.get('/api/messages');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // קבלת הודעה בודדת לפי ID (אדמין)
    getMessageById: async (messageId) => {
        try {
            const response = await api.get(`/api/messages/${messageId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // יצירת הודעה חדשה (אורח/לקוח/אדמין)
    createMessage: async (messageData) => {
        try {
            const response = await api.post('/api/messages', messageData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // עדכון סטטוס הודעה (אדמין)
    updateMessageStatus: async (messageId, status) => {
        try {
            const response = await api.patch(`/api/messages/${messageId}/status`, { status });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // מחיקת הודעה (אדמין, לאחר טיפול בלבד)
    deleteMessage: async (messageId) => {
        try {
            const response = await api.delete(`/api/messages/${messageId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // קבלת כמות הודעות שלא נקראו (אדמין)
    getUnreadCount: async () => {
        try {
            const response = await api.get('/api/messages/unread-count');
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

