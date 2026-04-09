// backend/src/controllers/userController.js
// בקר המשתמשים - מנהל את כל הפעולות הקשורות למשתמשים
// מתחבר למודל User לביצוע פעולות בסיס הנתונים
const User = require('../models/User');
const config = require('../config/config');
const emailService = require('../services/emailService');
const jwt = require('jsonwebtoken');
const isProduction = process.env.NODE_ENV === 'production';
const {
    validateSignupPayload,
    validateLoginPayload,
    validateForgotPasswordPayload,
    validateResetPasswordPayload,
    validateProfilePayload,
    validateAddressPayload,
    validateChangePasswordPayload
} = require('../validation/userValidator');

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
};
// בדיקת אימות משתמש - מחזיר נתוני משתמש מ-JWT
const me = async (req, res) => {
    try {
        // נתוני משתמש כבר נקבעו על ידי auth middleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        
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

// התנתקות משתמש - מנקה JWT cookie
const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax'
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
        const validation = validateLoginPayload(req.body);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid login data',
                errors: validation.errors
            });
        }
        const { email, password } = validation.sanitizedData;
        const user = await User.findUser(email, password);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // יצירת JWT payload ו-token
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            name: user.full_name
        };

        const token = jwt.sign(payload, config.jwtSecret, {
            expiresIn: '24h'
        });
        
        // הגדרת JWT token כ-HTTP-only cookie
        res.cookie('token', token, cookieOptions);
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
const findUser = async (req, res) => {
    try {
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

// יצירת משתמש חדש
const createUser = async (req, res) => {
    try {
        const validation = validateSignupPayload(req.body);
    
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid signup data',
                    errors: validation.errors
                });
            }
    
            const { full_name, email, address, phone_number, password } = validation.sanitizedData;
    
            const userId = await User.createUser({
                full_name,
                email,
                address,
                phone_number,
                password,
                role: 'customer'
            });
        // שליחת אימייל ברכה
        try {
            await emailService.sendWelcomeEmail(email, full_name);
        } catch (emailError) {
            // לא נכשל אם אימייל נכשל - המשתמש עדיין נוצר
        }
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            userId: userId,
        });
    } catch (error) {
        console.error('❌ Error creating user:', error.message);
        
        // טיפול בסוגי שגיאות ספציפיים
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

// איפוס סיסמה - שליחת קוד איפוס באימייל
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // בדיקה אם המשתמש קיים
        const user = await User.findUserByEmail(email);
        if (!user) {
            // לא חושף אם המשתמש קיים או לא מטעמי אבטחה
            return res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a password reset code has been sent.'
            });
        }

        // יצירת קוד איפוס ושליחת אימייל
        const resetCode = await User.createPasswordResetCode(email);
        await emailService.sendPasswordResetCode(email, resetCode);

        res.status(200).json({
            success: true,
            message: 'If an account with that email exists, a password reset code has been sent.'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request'
        });
    }
};

// איפוס סיסמה עם קוד
const resetPassword = async (req, res) => {
    try {
            const validation = validateResetPasswordPayload(req.body);
    
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid reset password data',
                    errors: validation.errors
                });
            }
    
            const { email, code, newPassword, confirmPassword } = validation.sanitizedData;

    // בדיקת התאמה בין סיסמאות
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // אימות חוזק סיסמה
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // איפוס סיסמה דרך המודל
        await User.resetPassword(email, code, newPassword);

        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        
        if (error.message.includes('Invalid or expired')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset code'
            });
        }

        res.status(500).json({
            success: false,
            message: 'An error occurred while resetting your password'
        });
    }
};


// קבלת כל המשתמשים (אדמין בלבד)
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

// קבלת פרופיל משתמש
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findUserByEmail(req.user.email);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // פענוח כתובת JSON אם קיימת
        let address = null;
        if (user.address) {
            try {
                address = typeof user.address === 'string' ? JSON.parse(user.address) : user.address;
            } catch (err) {
                console.error('Error parsing address:', err);
                address = null;
            }
        }

        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone_number: user.phone_number,
                address: address,
                role: user.role,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching profile'
        });
    }
};

// עדכון פרופיל (שם, טלפון)
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const validation = validateProfilePayload(req.body);

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid profile data',
                errors: validation.errors
            });
        }

        const { full_name, phone_number } = validation.sanitizedData;
        const updatedUser = await User.updateProfile(userId, {
            full_name,
            phone_number
        });

        // פענוח כתובת JSON אם קיימת
        let address = null;
        if (updatedUser.address) {
            try {
                address = typeof updatedUser.address === 'string' ? JSON.parse(updatedUser.address) : updatedUser.address;
            } catch (err) {
                console.error('Error parsing address:', err);
                address = null;
            }
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                ...updatedUser,
                address: address
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'An error occurred while updating profile'
        });
    }
};

// עדכון כתובת
const updateAddress = async (req, res) => {
    try {
        const userId = req.user.id;

        const validation = validateAddressPayload(req.body);

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid address data',
                errors: validation.errors
            });
        }

        const { house_number, street, city, zipcode } = validation.sanitizedData;

        const updatedUser = await User.updateAddress(userId, {
            house_number,
            street,
            city,
            zipcode
        });

        // פענוח כתובת JSON
        let address = null;
        if (updatedUser.address) {
            try {
                address = typeof updatedUser.address === 'string' ? JSON.parse(updatedUser.address) : updatedUser.address;
            } catch (err) {
                console.error('Error parsing address:', err);
                address = null;
            }
        }

        res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            data: {
                ...updatedUser,
                address: address
            }
        });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'An error occurred while updating address'
        });
    }
};

// שינוי סיסמה
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;

        const validation = validateChangePasswordPayload(req.body);

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid password data',
                errors: validation.errors
            });
        }

        const { currentPassword, newPassword } = validation.sanitizedData;

        await User.changePassword(userId, currentPassword, newPassword);

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        
        if (error.message.includes('incorrect')) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'An error occurred while changing password'
        });
    }
};

// קבלת רשימת משאלות
const getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const wishlist = await User.getWishlist(userId);

        res.status(200).json({
            success: true,
            wishlist
        });
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'An error occurred while getting wishlist'
        });
    }
};

// הוספה לרשימת משאלות
const addToWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        const wishlist = await User.addToWishlist(userId, parseInt(productId));

        res.status(200).json({
            success: true,
            message: 'Product added to wishlist',
            wishlist
        });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'An error occurred while adding to wishlist'
        });
    }
};

// הסרה מרשימת משאלות
const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        const wishlist = await User.removeFromWishlist(userId, parseInt(productId));

        res.status(200).json({
            success: true,
            message: 'Product removed from wishlist',
            wishlist
        });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'An error occurred while removing from wishlist'
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
    getAllUsers,
    getProfile,
    updateProfile,
    updateAddress,
    changePassword,
    getWishlist,
    addToWishlist,
    removeFromWishlist
};