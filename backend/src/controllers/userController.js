// backend/src/controllers/userController.js
// בקר המשתמשים - מנהל את כל הפעולות הקשורות למשתמשים
// מתחבר למודל User לביצוע פעולות בסיס הנתונים
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const emailService = require('../services/emailService');

// התחברות משתמש למערכת
// Check if user is authenticated (has valid token)
// Returns user data from JWT token
const me = async (req, res) => {
    try {
        console.log('👤 /me endpoint called');
        console.log('👤 req.user:', req.user);
        
        // If we reach here, the middleware has already verified the token
        // and set req.user, so we can trust it
        const userData = {
            id: req.user.userId,
            email: req.user.email,
            role: req.user.role,
            name: req.user.name
        };
        
        console.log('✅ Returning user data:', userData);
        
        res.status(200).json({
            success: true,
            user: userData
        });
    } catch (error) {
        console.error('❌ Error in me endpoint:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error checking authentication'
        });
    }
};  
const logout = async (req, res) => {
    try {
        // Clear the token cookie with the same options used when setting it
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure in production
            sameSite: 'strict',
            path: '/',
            maxAge: 0 // Immediately expire the cookie
        });
        
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during logout'
        });
    }
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // מציאת משתמש ואימות סיסמה דרך המודל
        const user = await User.findUser(email, password);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // בדיקה שהמפתח הסודי זמין
        if (!config.jwtSecret) {
            throw new Error('JWT secret is not configured');
        }
        
        // יצירת טוקן JWT עם כל המידע הנדרש
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                role: user.role,
                name: user.full_name
            },
            config.jwtSecret,
            { expiresIn: '24h' }
        );
        console.log('Token:', token);
        // הגדרת הטוקן בעוגיה
        res.cookie('token', token, {
            httpOnly: true, // עוזר למנוע התקפות XSS
           // Use secure cookies in production
            maxAge: 24 * 60 * 60 * 1000 // 24 שעות
        });
        
        // Return user data along with success
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.full_name,
                address: user.address,
                phone_number: user.phone_number
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during login'
        });
    }
};

// מציאת משתמש במסד הנתונים
// השליטה מקבלת אימייל ושולחת אותו למודל לחיפוש
const findUser = async (req, res) => {
    try {
        const user = await User.findUser(req.user.email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error finding user'
        });
    }
};

// יצירת משתמש חדש במסד הנתונים
// השליטה מקבלת נתוני משתמש חדש ושולחת אותם למודל ליצירה
const createUser = async (req, res) => {
    try {
        const { full_name, email, address, phone_number, password, role } = req.body;

        console.log('👤 Creating new user:', { email, full_name, role });

        // יצירת משתמש דרך המודל
        const userId = await User.createUser({ full_name, email, address, phone_number, password, role });

        console.log('✅ User created successfully with ID:', userId);

        // Send welcome email
        try {
            console.log('📧 Sending welcome email to:', email);
            await emailService.sendWelcomeEmail(email, full_name);
            console.log('✅ Welcome email sent successfully to:', email);
        } catch (emailError) {
            console.error('❌ Error sending welcome email:', emailError);
            console.error('❌ Email error details:', {
                message: emailError.message,
                stack: emailError.stack
            });
            // Don't fail the signup if email fails - user is still created
        }

        // החזרת תגובת הצלחה
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            userId: userId,
        });
    } catch (error) {
        console.error('❌ Error creating user:', error.message);
        
        // Handle specific error types
        if (error.message.includes('already exists')) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'An error occurred during user creation'
            });
        }
    }
};

// Forgot password - send reset email
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if user exists
        const user = await User.findUserByEmail(email);
        if (!user) {
            // Don't reveal if user exists or not for security
            return res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
        }

        // Create reset token
        const resetToken = await User.createPasswordResetToken(email);

        // Create reset URL
        const resetUrl = `${config.sendgrid.frontendUrl}/reset-password?token=${resetToken}`;

        // Send email
        await emailService.sendPasswordResetEmail(email, resetToken, resetUrl);

        res.status(200).json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request'
        });
    }
};

// Reset password with token
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required'
            });
        }

        // Validate password strength
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Reset password
        await User.resetPassword(token, newPassword);

        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        
        if (error.message.includes('Invalid or expired')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        res.status(500).json({
            success: false,
            message: 'An error occurred while resetting your password'
        });
    }
};

// Verify reset token
const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token is required'
            });
        }

        // Check if token is valid
        const user = await User.findUserByResetToken(token);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Token is valid'
        });

    } catch (error) {
        console.error('Verify reset token error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while verifying the token'
        });
    }
};

// ייצוא כל הפונקציות
module.exports = {
    login,
    findUser,
    createUser,
    me,
    logout,
    forgotPassword,
    resetPassword,
    verifyResetToken
};