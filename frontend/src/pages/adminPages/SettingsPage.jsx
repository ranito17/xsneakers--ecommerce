    // SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuthentication';
import { useSettings } from '../../context/SettingsProvider';
import { validateSettingsForm } from '../../utils/form.validation';
import { useToast } from '../../components/common/toast';
import ProtectedRoute from '../../components/ProtectedRoute';
import { LoadingContainer, ErrorContainer } from '../../components/contactForm';
import styles from './adminPages.module.css';

const SETTINGS_DESCRIPTIONS = {
    store_name: 'Store name displayed to customers',
    supplier_name: 'Supplier company name',
    supplier_email: 'Supplier contact email address',
    tax_rate: 'Tax rate as decimal (e.g., 0.09 for 9%)',
    currency: 'Currency code used throughout the store',
    default_delivery_cost: 'Default shipping cost applied to orders',
    free_delivery_threshold: 'Minimum order amount for free delivery',
    email_notification: 'Admin email for order and system notifications',
    store_instagram: 'Instagram handle displayed in footer (without @)',
    low_stock_threshold: 'Products with total stock below this will be flagged as low stock',
    low_stock_threshold_per_size: 'Products with any size below this quantity will be flagged',
    homepage_display_limit: 'Number of products displayed in Best Sellers and New Arrivals sections'
};

const SettingsPage = () => {
    const { isAuthenticated, user } = useAuth();
    const { showSuccess, showError } = useToast();
    const { settings: currentSettings, updateSettings, loading: settingsLoading, error: settingsError, fetchSettings } = useSettings();
    const [settings, setSettings] = useState({
        store_name: '',
        supplier_name: '',
        supplier_email: '',
        tax_rate: 0,
        currency: 'ILS',
        default_delivery_cost: 0,
        free_delivery_threshold: 0,
        email_notification: '',
        store_instagram: '',
        low_stock_threshold: 10,
        low_stock_threshold_per_size: 5,
        homepage_display_limit: 8
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    // handleSubmit - שומר את ההגדרות המעודכנות
    // שליחה לשרת: updateSettings(settings)
    // תגובה מהשרת: { success: true }
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validation = validateSettingsForm(settings);
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            showError('Please fix the validation errors below');
            return;
        }
        try {
            setSaving(true);
            setError('');
            setSuccess('');
            setValidationErrors({});
            const result = await updateSettings(settings);
            if (result.success) {
                showSuccess('Settings updated successfully!');
                setSuccess('');
                setError('');
            } else {
                // Handle backend validation errors
                if (result.errors && typeof result.errors === 'object') {
                    setValidationErrors(result.errors);
                    const errorKeys = Object.keys(result.errors);
                    const errorMsg = errorKeys.length > 0 
                        ? `Validation error: ${errorKeys[0]} - ${result.errors[errorKeys[0]]}`
                        : result.message || 'Failed to update settings';
                    showError(errorMsg);
                    setError(`Please fix the errors below`);
                } else {
                    const errorMsg = result.message || 'Failed to update settings';
                    showError(errorMsg);
                    setError(errorMsg);
                }
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            const errorMsg = error.response?.data?.message || 'Failed to update settings';
            showError(errorMsg);
            setError(errorMsg);
        } finally {
            setSaving(false);
        }
    };


    // handleReset - מאפס את ההגדרות לערכים השמורים
    const handleReset = () => {
        if (currentSettings) {
            setSettings({
                store_name: currentSettings.store_name || '',
                supplier_name: currentSettings.supplier_name || '',
                supplier_email: currentSettings.supplier_email || '',
                tax_rate: currentSettings.tax_rate || 0,
                currency: currentSettings.currency || 'ILS',
                default_delivery_cost: currentSettings.default_delivery_cost || 0,
                free_delivery_threshold: currentSettings.free_delivery_threshold || 0,
                email_notification: currentSettings.email_notification || '',
                store_instagram: currentSettings.store_instagram || '',
                low_stock_threshold: currentSettings.low_stock_threshold || 10,
                low_stock_threshold_per_size: currentSettings.low_stock_threshold_per_size || 5,
                homepage_display_limit: currentSettings.homepage_display_limit ?? 8
            });
        }
        setSuccess('');
        setError('');
    };


    // handleInputChange - מעדכן ערך שדה בהגדרות
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
        if (success || error) {
            setSuccess('');
            setError('');
        }
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };


    useEffect(() => {
        if (isAuthenticated && user) {
            fetchSettings();
        }
    }, [isAuthenticated, user, fetchSettings]);


    useEffect(() => {
        if (currentSettings) {
            setSettings({
                store_name: currentSettings.store_name || '',
                supplier_name: currentSettings.supplier_name || '',
                supplier_email: currentSettings.supplier_email || '',
                tax_rate: currentSettings.tax_rate || 0,
                currency: currentSettings.currency || 'ILS',
                default_delivery_cost: currentSettings.default_delivery_cost || 0,
                free_delivery_threshold: currentSettings.free_delivery_threshold || 0,
                email_notification: currentSettings.email_notification || '',
                store_instagram: currentSettings.store_instagram || '',
                low_stock_threshold: currentSettings.low_stock_threshold || 10,
                low_stock_threshold_per_size: currentSettings.low_stock_threshold_per_size || 5,
                homepage_display_limit: currentSettings.homepage_display_limit ?? 8
            });
        }
    }, [currentSettings]);
    if (settingsLoading && !currentSettings) {
        return (
            <ProtectedRoute requiredRole="admin">
                <LoadingContainer message="Loading settings..." size="medium" />
            </ProtectedRoute>
        );
    }
    if (settingsError) {
        return (
            <ProtectedRoute requiredRole="admin">
                <ErrorContainer 
                    message={settingsError}
                    onRetry={() => window.location.reload()}
                />
            </ProtectedRoute>
        );
    }
    return (
        <ProtectedRoute requiredRole="admin">
            <div className={styles.pageContainer}>
                <div className={styles.contentSection}>
                    {error && (
                        <div className={styles.errorMessage}>
                            <ErrorContainer message={error} />
                        </div>
                    )}
                    {success && (
                        <div className={styles.successMessage}>
                            <div className={styles.successContent}>
                                <span>✓ {success}</span>
                            </div>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className={styles.settingsForm}>
                        <div className={styles.settingsSection}>
                            <h3 className={styles.settingsSectionTitle}>Store Information</h3>
                            <div className={styles.settingsFormRow}>
                                <div className={styles.settingsFormGroup}>
                                    <label htmlFor="store_name">Store Name</label>
                                    <input
                                        type="text"
                                        id="store_name"
                                        name="store_name"
                                        value={settings.store_name}
                                        onChange={handleInputChange}
                                        placeholder="Enter store name"
                                        required
                                        disabled={saving}
                                        className={validationErrors.store_name ? styles.errorInput : ''}
                                    />
                                    <small className={styles.helpText}>{SETTINGS_DESCRIPTIONS.store_name}</small>
                                    {validationErrors.store_name && (
                                        <span className={styles.errorText}>{validationErrors.store_name}</span>
                                    )}
                                </div>
                                <div className={styles.settingsFormGroup}>
                                    <label htmlFor="store_instagram">Store Instagram</label>
                                    <input
                                        type="text"
                                        id="store_instagram"
                                        name="store_instagram"
                                        value={settings.store_instagram}
                                        onChange={handleInputChange}
                                        placeholder="Enter Instagram username (without @)"
                                        disabled={saving}
                                    />
                                    <small className={styles.helpText}>{SETTINGS_DESCRIPTIONS.store_instagram}</small>
                                </div>
                            </div>
                        </div>
                        <div className={styles.settingsSection}>
                            <h3 className={styles.settingsSectionTitle}>Supplier Information</h3>
                            <div className={styles.settingsFormRow}>
                                <div className={styles.settingsFormGroup}>
                                    <label htmlFor="supplier_name">Supplier Name</label>
                                    <input
                                        type="text"
                                        id="supplier_name"
                                        name="supplier_name"
                                        value={settings.supplier_name}
                                        onChange={handleInputChange}
                                        placeholder="Enter supplier name"
                                        required
                                        disabled={saving}
                                        className={validationErrors.supplier_name ? styles.errorInput : ''}
                                    />
                                    <small className={styles.helpText}>{SETTINGS_DESCRIPTIONS.supplier_name}</small>
                                    {validationErrors.supplier_name && (
                                        <span className={styles.errorText}>{validationErrors.supplier_name}</span>
                                    )}
                                </div>
                                <div className={styles.settingsFormGroup}>
                                    <label htmlFor="supplier_email">Supplier Email</label>
                                    <input
                                        type="email"
                                        id="supplier_email"
                                        name="supplier_email"
                                        value={settings.supplier_email}
                                        onChange={handleInputChange}
                                        placeholder="Enter supplier email"
                                        required
                                        disabled={saving}
                                        className={validationErrors.supplier_email ? styles.errorInput : ''}
                                    />
                                    <small className={styles.helpText}>{SETTINGS_DESCRIPTIONS.supplier_email}</small>
                                    {validationErrors.supplier_email && (
                                        <span className={styles.errorText}>{validationErrors.supplier_email}</span>
                                    )}
                                </div>
                            </div>
                            <div className={styles.settingsFormRow}>
                                <div className={styles.settingsFormGroup}>
                                    <label htmlFor="email_notification">Notification Email</label>
                                    <input
                                        type="email"
                                        id="email_notification"
                                        name="email_notification"
                                        value={settings.email_notification}
                                        onChange={handleInputChange}
                                        placeholder="Email for order notifications"
                                        required
                                        disabled={saving}
                                    />
                                    <small className={styles.helpText}>{SETTINGS_DESCRIPTIONS.email_notification}</small>
                                </div>
                            </div>
                        </div>
                        <div className={styles.settingsSection}>
                            <h3 className={styles.settingsSectionTitle}>Pricing & Delivery Settings</h3>
                            <div className={styles.settingsFormRow}>
                                <div className={styles.settingsFormGroup}>
                                    <label htmlFor="tax_rate">Tax Rate (0-1, e.g., 0.09 for 9%)</label>
                                    <input
                                        type="number"
                                        id="tax_rate"
                                        name="tax_rate"
                                        value={settings.tax_rate}
                                        onChange={handleInputChange}
                                        placeholder="0.09"
                                        step="0.01"
                                        min="0"
                                        max="1"
                                        disabled={saving}
                                        className={validationErrors.tax_rate ? styles.errorInput : ''}
                                    />
                                    <small className={styles.helpText}>{SETTINGS_DESCRIPTIONS.tax_rate}</small>
                                    {validationErrors.tax_rate && (
                                        <span className={styles.errorText}>{validationErrors.tax_rate}</span>
                                    )}
                                </div>
                                <div className={styles.settingsFormGroup}>
                                    <label htmlFor="default_delivery_cost">Default Delivery Cost</label>
                                    <input
                                        type="number"
                                        id="default_delivery_cost"
                                        name="default_delivery_cost"
                                        value={settings.default_delivery_cost}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        disabled={saving}
                                        className={validationErrors.default_delivery_cost ? styles.errorInput : ''}
                                    />
                                    <small className={styles.helpText}>{SETTINGS_DESCRIPTIONS.default_delivery_cost}</small>
                                    {validationErrors.default_delivery_cost && (
                                        <span className={styles.errorText}>{validationErrors.default_delivery_cost}</span>
                                    )}
                                </div>
                                <div className={styles.settingsFormGroup}>
                                    <label htmlFor="free_delivery_threshold">Free Delivery Threshold</label>
                                    <input
                                        type="number"
                                        id="free_delivery_threshold"
                                        name="free_delivery_threshold"
                                        value={settings.free_delivery_threshold}
                                        onChange={handleInputChange}
                                        placeholder="100.00"
                                        step="0.01"
                                        min="0"
                                        disabled={saving}
                                        className={validationErrors.free_delivery_threshold ? styles.errorInput : ''}
                                    />
                                    <small className={styles.helpText}>{SETTINGS_DESCRIPTIONS.free_delivery_threshold}</small>
                                    {validationErrors.free_delivery_threshold && (
                                        <span className={styles.errorText}>{validationErrors.free_delivery_threshold}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={styles.settingsSection}>
                            <h3 className={styles.settingsSectionTitle}>Stock Management</h3>
                            <div className={styles.settingsFormRow}>
                                <div className={styles.settingsFormGroup}>
                                    <label htmlFor="low_stock_threshold">Low Stock Threshold (Total)</label>
                                    <input
                                        type="number"
                                        id="low_stock_threshold"
                                        name="low_stock_threshold"
                                        value={settings.low_stock_threshold}
                                        onChange={handleInputChange}
                                        min="0"
                                        placeholder="10"
                                        disabled={saving}
                                        className={validationErrors.low_stock_threshold ? styles.errorInput : ''}
                                    />
                                    <small className={styles.helpText}>{SETTINGS_DESCRIPTIONS.low_stock_threshold}</small>
                                    {validationErrors.low_stock_threshold && (
                                        <span className={styles.errorText}>{validationErrors.low_stock_threshold}</span>
                                    )}
                                </div>
                                <div className={styles.settingsFormGroup}>
                                    <label htmlFor="low_stock_threshold_per_size">Low Stock Threshold (Per Size)</label>
                                    <input
                                        type="number"
                                        id="low_stock_threshold_per_size"
                                        name="low_stock_threshold_per_size"
                                        value={settings.low_stock_threshold_per_size}
                                        onChange={handleInputChange}
                                        min="0"
                                        placeholder="5"
                                        disabled={saving}
                                        className={validationErrors.low_stock_threshold_per_size ? styles.errorInput : ''}
                                    />
                                    <small className={styles.helpText}>{SETTINGS_DESCRIPTIONS.low_stock_threshold_per_size}</small>
                                    {validationErrors.low_stock_threshold_per_size && (
                                        <span className={styles.errorText}>{validationErrors.low_stock_threshold_per_size}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={styles.settingsSection}>
                            <h3 className={styles.settingsSectionTitle}>Display Settings</h3>
                            <div className={styles.settingsFormRow}>
                                <div className={styles.settingsFormGroup}>
                                    <label htmlFor="homepage_display_limit">Homepage Product Display Limit</label>
                                    <input
                                        type="number"
                                        id="homepage_display_limit"
                                        name="homepage_display_limit"
                                        value={settings.homepage_display_limit}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="20"
                                        placeholder="8"
                                        disabled={saving}
                                        className={validationErrors.homepage_display_limit ? styles.errorInput : ''}
                                    />
                                    <small className={styles.helpText}>{SETTINGS_DESCRIPTIONS.homepage_display_limit}</small>
                                    {validationErrors.homepage_display_limit && (
                                        <span className={styles.errorText}>{validationErrors.homepage_display_limit}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={styles.settingsActions}>
                            <button
                                type="button"
                                onClick={handleReset}
                                className={styles.settingsResetButton}
                                disabled={saving}
                            >
                                Reset to Saved
                            </button>
                            <button
                                type="submit"
                                className={styles.settingsSaveButton}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default SettingsPage;
