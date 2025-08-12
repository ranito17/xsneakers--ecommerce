const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

/**
 * POST /api/contact
 * Send customer contact email
 */
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Send the contact email
        await emailService.sendCustomerContactEmail({
            name,
            email,
            subject,
            message
        });

        res.json({
            success: true,
            message: 'Contact message sent successfully'
        });

    } catch (error) {
        console.error('Contact email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send contact message. Please try again later.'
        });
    }
});

module.exports = router; 