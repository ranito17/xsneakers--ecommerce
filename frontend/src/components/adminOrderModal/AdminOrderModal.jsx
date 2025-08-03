import React, { useState, useEffect } from 'react';
import styles from './adminOrderModal.module.css';

const AdminOrderModal = ({ 
    isOpen, 
    onClose, 
    order, 
    onSave, 
    loading = false 
}) => {
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        shipping_address: '',
        status: 'pending',
        payment_status: 'pending',
        arrival_date_estimated: '',
        total_amount: 0
    });

    useEffect(() => {
        if (order) {
            setFormData({
                customer_name: order.customer_name || '',
                customer_email: order.customer_email || '',
                shipping_address: order.shipping_address || '',
                status: order.status || 'pending',
                payment_status: order.payment_status || 'pending',
                arrival_date_estimated: order.arrival_date_estimated ? new Date(order.arrival_date_estimated).toISOString().split('T')[0] : '',
                total_amount: parseFloat(order.total_amount) || 0
            });
        }
    }, [order]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Edit Order - {order?.order_number}</h2>
                    <button onClick={onClose} className={styles.closeButton}>×</button>
                </div>
                
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formSection}>
                        <h3>Customer Information</h3>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="customer_name">Customer Name</label>
                                <input
                                    type="text"
                                    id="customer_name"
                                    name="customer_name"
                                    value={formData.customer_name}
                                    onChange={handleInputChange}
                                    required
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="customer_email">Customer Email</label>
                                <input
                                    type="email"
                                    id="customer_email"
                                    name="customer_email"
                                    value={formData.customer_email}
                                    onChange={handleInputChange}
                                    required
                                    className={styles.input}
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="shipping_address">Shipping Address</label>
                            <textarea
                                id="shipping_address"
                                name="shipping_address"
                                value={formData.shipping_address}
                                onChange={handleInputChange}
                                required
                                className={styles.textarea}
                                rows="3"
                            />
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h3>Order Information</h3>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="status">Order Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className={styles.select}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="payment_status">Payment Status</label>
                                <select
                                    id="payment_status"
                                    name="payment_status"
                                    value={formData.payment_status}
                                    onChange={handleInputChange}
                                    className={styles.select}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="failed">Failed</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="arrival_date_estimated">Estimated Delivery Date</label>
                                <input
                                    type="date"
                                    id="arrival_date_estimated"
                                    name="arrival_date_estimated"
                                    value={formData.arrival_date_estimated}
                                    onChange={handleInputChange}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="total_amount">Total Amount</label>
                                <input
                                    type="number"
                                    id="total_amount"
                                    name="total_amount"
                                    value={formData.total_amount}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    min="0"
                                    className={styles.input}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.cancelButton}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.saveButton}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminOrderModal;
