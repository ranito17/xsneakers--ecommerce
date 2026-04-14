import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuthentication';
import { useToast } from '../components/common/toast';
import { userApi } from '../services/userApi';
import ProtectedRoute from '../components/ProtectedRoute';
import { useNavigate } from 'react-router-dom';
import { LoadingContainer, ErrorContainer } from '../components/contactForm';
import { 
    validateProfileUpdate, 
    validateAddress, 
    formatAddress,
    formatUserName,
    getUserInitials,
    getUserRoleLabel
} from '../utils/user.utils';
import { formatDate } from '../utils/date.utils';
import styles from './pages.module.css';

const ProfilePage = () => {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { showError, showSuccess } = useToast();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState({
        personalInfo: false,
        address: false
    });
    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        house_number: '',
        street: '',
        city: '',
        zipcode: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // fetchProfile - טוען את פרופיל המשתמש
    // שליחה לשרת: getProfile()
    // תגובה מהשרת: { success: true, data: {...} }
    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await userApi.getProfile();
            if (response.success) {
                const user = response.data;
                setUserData(user);
                setFormData({
                    full_name: user.full_name || '',
                    phone_number: user.phone_number || '',
                    house_number: user.address?.house_number || '',
                    street: user.address?.street || '',
                    city: user.address?.city || '',
                    zipcode: user.address?.zipcode || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            showError('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };


    // handlePersonalInfoSubmit - מעדכן מידע אישי
    // שליחה לשרת: updateProfile({ full_name, phone_number })
    // תגובה מהשרת: { success: true, data: {...} }
    const handlePersonalInfoSubmit = async (e) => {
        e.preventDefault();
        const profileData = {
            full_name: formData.full_name,
            phone_number: formData.phone_number
        };
        const validation = validateProfileUpdate(profileData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }
        try {
            setIsSubmitting(true);
            const response = await userApi.updateProfile(profileData);
            if (response.success) {
                setUserData(response.data);
                setEditMode(prev => ({ ...prev, personalInfo: false }));
                showSuccess('Personal information updated successfully!');
            } else {
                showError(response.message || 'Failed to update profile. Please try again.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setErrors({ submit: 'Failed to update profile. Please try again.' });
            showError('Failed to update profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };


    // handleAddressSubmit - מעדכן כתובת
    // שליחה לשרת: updateAddress({ house_number, street, city, zipcode })
    // תגובה מהשרת: { success: true, data: {...} }
    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        const addressData = {
            house_number: formData.house_number,
            street: formData.street,
            city: formData.city,
            zipcode: formData.zipcode
        };
        const validation = validateAddress(addressData, false);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }
        try {
            setIsSubmitting(true);
            const response = await userApi.updateAddress(addressData);
            if (response.success) {
                setUserData(response.data);
                setEditMode(prev => ({ ...prev, address: false }));
                showSuccess('Address updated successfully!');
            } else {
                showError(response.message || 'Failed to update address. Please try again.');
            }
        } catch (error) {
            console.error('Error updating address:', error);
            setErrors({ submit: 'Failed to update address. Please try again.' });
            showError('Failed to update address. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };


    // toggleEditMode - מחליף מצב עריכה
    const toggleEditMode = (section) => {
        setEditMode(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
        if (editMode[section]) {
            setFormData({
                full_name: userData?.full_name || '',
                phone_number: userData?.phone_number || '',
                house_number: userData?.address?.house_number || '',
                street: userData?.address?.street || '',
                city: userData?.address?.city || '',
                zipcode: userData?.address?.zipcode || ''
            });
            setErrors({});
            setSuccessMessage('');
        }
    };


    // handleChange - מעדכן שדה בטופס
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        if (successMessage) {
            setSuccessMessage('');
        }
    };


  
    
    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchProfile();
    }, [authLoading, isAuthenticated]);
    if (loading) {
        return <LoadingContainer message="Loading your profile..." size="medium" />;
    }
    if (!userData) {
        return <ErrorContainer message="Failed to load profile data" onRetry={fetchProfile} />;
    }
    return (
        <ProtectedRoute redirectToLogin={true}>
            <div className={styles.profilePage}>
            <div className={styles.profileContainer}>
                {successMessage && (
                    <div className={styles.successBanner}>
                        ✓ {successMessage}
                    </div>
                )}
                <div className={styles.profileHeader}>
                    <div className={styles.profileAvatar}>
                        <div className={styles.avatarInitial}>
                            {getUserInitials(userData)}
                        </div>
                    </div>
                    <div className={styles.profileInfo}>
                        <h1 className={styles.profileName}>{formatUserName(userData)}</h1>
                        <p className={styles.profileEmail}>{userData.email}</p>
                        <span className={styles.profileRole}>
                            {getUserRoleLabel(userData.role)}
                        </span>
                    </div>
                </div>
                <div className={styles.profileSections}>
                    <div className={styles.profileSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Personal Information</h2>
                            <button 
                                className={styles.editButton}
                                onClick={() => toggleEditMode('personalInfo')}
                            >
                                {editMode.personalInfo ? 'Cancel' : 'Edit'}
                            </button>
                        </div>
                        {editMode.personalInfo ? (
                            <form onSubmit={handlePersonalInfoSubmit} className={styles.editForm}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="full_name">Full Name *</label>
                                    <input
                                        type="text"
                                        id="full_name"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        disabled={isSubmitting}
                                        className={errors.full_name ? styles.errorInput : ''}
                                    />
                                    {errors.full_name && <span className={styles.error}>{errors.full_name}</span>}
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="phone_number">Phone Number *</label>
                                    <input
                                        type="tel"
                                        id="phone_number"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        placeholder="10 digits (e.g., 0501234567)"
                                        disabled={isSubmitting}
                                        className={errors.phone_number ? styles.errorInput : ''}
                                    />
                                    {errors.phone_number && <span className={styles.error}>{errors.phone_number}</span>}
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={userData.email}
                                        disabled
                                        className={styles.disabledInput}
                                    />
                                    <small className={styles.helpText}>Email cannot be changed</small>
                                </div>
                                {errors.submit && <div className={styles.submitError}>{errors.submit}</div>}
                                <div className={styles.formActions}>
                                    <button 
                                        type="submit" 
                                        className={styles.saveButton}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className={styles.infoDisplay}>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Full Name:</span>
                                    <span className={styles.infoValue}>{formatUserName(userData)}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Phone Number:</span>
                                    <span className={styles.infoValue}>{userData.phone_number || 'Not set'}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Email:</span>
                                    <span className={styles.infoValue}>{userData.email}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Member Since:</span>
                                    <span className={styles.infoValue}>{formatDate(userData.created_at, 'long')}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className={styles.profileSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Address Information</h2>
                            <button 
                                className={styles.editButton}
                                onClick={() => toggleEditMode('address')}
                            >
                                {editMode.address ? 'Cancel' : 'Edit'}
                            </button>
                        </div>
                        {editMode.address ? (
                            <form onSubmit={handleAddressSubmit} className={styles.editForm}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="house_number">House Number *</label>
                                        <input
                                            type="text"
                                            id="house_number"
                                            name="house_number"
                                            value={formData.house_number}
                                            onChange={handleChange}
                                            placeholder="e.g., 123 or 123A"
                                            disabled={isSubmitting}
                                            className={errors.house_number ? styles.errorInput : ''}
                                        />
                                        {errors.house_number && <span className={styles.error}>{errors.house_number}</span>}
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="zipcode">Zipcode *</label>
                                        <input
                                            type="text"
                                            id="zipcode"
                                            name="zipcode"
                                            value={formData.zipcode}
                                            onChange={handleChange}
                                            placeholder="5-7 digits"
                                            disabled={isSubmitting}
                                            className={errors.zipcode ? styles.errorInput : ''}
                                        />
                                        {errors.zipcode && <span className={styles.error}>{errors.zipcode}</span>}
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="street">Street *</label>
                                    <input
                                        type="text"
                                        id="street"
                                        name="street"
                                        value={formData.street}
                                        onChange={handleChange}
                                        placeholder="Enter street name"
                                        disabled={isSubmitting}
                                        className={errors.street ? styles.errorInput : ''}
                                    />
                                    {errors.street && <span className={styles.error}>{errors.street}</span>}
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="city">City *</label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Enter city name"
                                        disabled={isSubmitting}
                                        className={errors.city ? styles.errorInput : ''}
                                    />
                                    {errors.city && <span className={styles.error}>{errors.city}</span>}
                                </div>
                                {errors.submit && <div className={styles.submitError}>{errors.submit}</div>}
                                <div className={styles.formActions}>
                                    <button 
                                        type="submit" 
                                        className={styles.saveButton}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className={styles.infoDisplay}>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>House Number:</span>
                                    <span className={styles.infoValue}>{userData.address?.house_number || 'Not set'}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Street:</span>
                                    <span className={styles.infoValue}>{userData.address?.street || 'Not set'}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>City:</span>
                                    <span className={styles.infoValue}>{userData.address?.city || 'Not set'}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Zipcode:</span>
                                    <span className={styles.infoValue}>{userData.address?.zipcode || 'Not set'}</span>
                                </div>
                                {userData.address && (
                                    <div className={styles.fullAddressDisplay}>
                                        <strong>Full Address:</strong>
                                        <p>{formatAddress(userData.address)}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            </div>
        </ProtectedRoute>
    );
};

export default ProfilePage;
