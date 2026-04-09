// נתיבי הודעות - מגדירים את הנתיבים לכל הפעולות הקשורות להודעות
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const isAuthenticated = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

// נתיבים ציבוריים (כל אחד יכול לשלוח הודעות - ללא אימות)
router.post('/', messageController.createMessage);

// נתיבי אדמין (דורשים אימות אדמין)
router.get('/', isAuthenticated, adminAuth, messageController.getAllMessages);
router.get('/unread-count', isAuthenticated, adminAuth, messageController.getUnreadCount);
router.get('/:messageId', isAuthenticated, adminAuth, messageController.getMessageById);
router.patch('/:messageId/status', isAuthenticated, adminAuth, messageController.updateMessageStatus);
router.delete('/:messageId', isAuthenticated, adminAuth, messageController.deleteMessage);

module.exports = router;

