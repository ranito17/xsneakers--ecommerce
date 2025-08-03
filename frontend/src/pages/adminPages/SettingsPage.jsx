import React, { useState, useEffect } from 'react';
import { settingsApi } from '../../services/settingsApi';
import ProtectedRoute from '../../components/ProtectedRoute';
import styles from './adminPages.module.css';

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        store_name: '',
        supplier_name: '',
        supplier_email: '',
        supplier_phone: '',
        tax_rate: 0,
        currency: 'USD',
        default_shipping_cost: 0,
        free_shipping_threshold: 0,
        email_notification: ''
    });
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch settings on component mount
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await settingsApi.getSettings();
            
            if (response.success && response.data) {
                setSettings(response.data);
            } else {
                setError('Failed to load settings');
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear success/error messages when user starts editing
        if (success || error) {
            setSuccess('');
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setSaving(true);
            setError('');
            setSuccess('');
            
            const response = await settingsApi.updateSettings(settings);
            
            if (response.success) {
                setSuccess('Settings updated successfully!');
                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(response.message || 'Failed to update settings');
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            setError('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        fetchSettings();
        setSuccess('');
        setError('');
    };

    if (loading) {
        return (
            <div className={styles.settingsManagement}>
                <div className={styles.settingsLoading}>Loading settings...</div>
            </div>
        );
    }

    return (
        <ProtectedRoute requiredRole="admin">
            <div className={styles.settingsManagement}>
                <div className={styles.settingsMainContent}>
                <div className={styles.settingsPageHeader}>
                    <div className={styles.settingsHeaderContent}>
                        <h1>Store Settings</h1>
                        <p>Manage your store configuration and supplier information</p>
                    </div>
                </div>

                {error && (
                    <div className={styles.settingsErrorMessage}>
                        {error}
                        <button onClick={() => setError('')} className={styles.settingsCloseButton}>×</button>
                    </div>
                )}

                {success && (
                    <div className={styles.settingsSuccessMessage}>
                        {success}
                        <button onClick={() => setSuccess('')} className={styles.settingsCloseButton}>×</button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.settingsForm}>
                    {/* Store Information Section */}
                    <div className={styles.settingsSection}>
                        <h2 className={styles.settingsSectionTitle}>Store Information</h2>
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
                                />
                            </div>
                        </div>
                    </div>

                    {/* Supplier Information Section */}
                    <div className={styles.settingsSection}>
                        <h2 className={styles.settingsSectionTitle}>Supplier Information</h2>
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
                                />
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
                                />
                            </div>
                        </div>
                        <div className={styles.settingsFormRow}>
                            <div className={styles.settingsFormGroup}>
                                <label htmlFor="supplier_phone">Supplier Phone</label>
                                <input
                                    type="tel"
                                    id="supplier_phone"
                                    name="supplier_phone"
                                    value={settings.supplier_phone}
                                    onChange={handleInputChange}
                                    placeholder="Enter supplier phone number"
                                    disabled={saving}
                                />
                            </div>
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
                            </div>
                        </div>
                    </div>

                    {/* Financial Settings Section */}
                    <div className={styles.settingsSection}>
                        <h2 className={styles.settingsSectionTitle}>Financial Settings</h2>
                        <div className={styles.settingsFormRow}>
                            <div className={styles.settingsFormGroup}>
                                <label htmlFor="tax_rate">Tax Rate (%)</label>
                                <input
                                    type="number"
                                    id="tax_rate"
                                    name="tax_rate"
                                    value={settings.tax_rate}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    disabled={saving}
                                />
                            </div>
                            <div className={styles.settingsFormGroup}>
                                <label htmlFor="currency">Currency</label>
                                <select
                                    id="currency"
                                    name="currency"
                                    value={settings.currency}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="ILS">ILS (₪)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="CAD">CAD (C$)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Settings Section */}
                    <div className={styles.settingsSection}>
                        <h2 className={styles.settingsSectionTitle}>Shipping Settings</h2>
                        <div className={styles.settingsFormRow}>
                            <div className={styles.settingsFormGroup}>
                                <label htmlFor="default_shipping_cost">Default Shipping Cost</label>
                                <input
                                    type="number"
                                    id="default_shipping_cost"
                                    name="default_shipping_cost"
                                    value={settings.default_shipping_cost}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    disabled={saving}
                                />
                            </div>
                            <div className={styles.settingsFormGroup}>
                                <label htmlFor="free_shipping_threshold">Free Shipping Threshold</label>
                                <input
                                    type="number"
                                    id="free_shipping_threshold"
                                    name="free_shipping_threshold"
                                    value={settings.free_shipping_threshold}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    disabled={saving}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
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
