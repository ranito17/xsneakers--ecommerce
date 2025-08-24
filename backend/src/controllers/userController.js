// backend/src/controllers/userController.js
// בקר המשתמשים - מנהל את כל הפעולות הקשורות למשתמשים
// מתחבר למודל User לביצוע פעולות בסיס הנתונים
const User = require('../models/User');
const config = require('../config/config');
const emailService = require('../services/emailService');
const jwt = require('jsonwebtoken');
const cartService = require('../services/cartService');

// התחברות משתמש למערכת
// Check if user is authenticated (has valid JWT)
// Returns user data from JWT payload
const me = async (req, res) => {
    try {
        console.log('👤 /me endpoint called');
        
        // User data is already set by auth middleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        console.log('✅ Returning user data:', req.user);
        
        res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        console.error('❌ Error in me endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking authentication'
        });
    }
};  

const logout = async (req, res) => {
    try {
        // Clear JWT cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
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

        // Create JWT payload
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            name: user.full_name
        };

        // Generate JWT token
        const token = jwt.sign(payload, config.jwtSecret, {
            expiresIn: '24h' // Token expires in 24 hours
        });

        console.log('✅ JWT token created for user:', user.email);
        
        // Set JWT token as HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true, // Prevents XSS attacks
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'strict', // CSRF protection
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        // Merge guest cart into user cart if user had items in guest cart
        try {
            await cartService.mergeGuestCart(req);
            console.log('✅ Guest cart merged successfully');
        } catch (mergeError) {
            console.error('⚠️ Error merging guest cart:', mergeError);
            // Don't fail login if cart merge fails
        }
        
        // Return user data (token is in HTTP-only cookie)
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
        // User data is already set by auth middleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const user = await User.findUserByEmail(req.user.email);
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

// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.getAllUsers();
        
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching users'
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
    verifyResetToken,
    getAllUsers
};