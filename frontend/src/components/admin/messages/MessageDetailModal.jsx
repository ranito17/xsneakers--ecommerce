// MessageDetailModal.jsx - Modal for viewing message details
import React from 'react';
import { formatDateTime } from '../../../utils/date.utils';
import { getMessageTypeLabel, getMessagePriorityLabel } from '../../../utils/user.utils';
import styles from './messages.module.css';

const MessageDetailModal = ({ 
    message, 
    isOpen, 
    onClose, 
    onMarkAsRead, 
    onMarkAsResolved, 
    onMarkAsArchived, 
    onReply, 
    onDelete 
}) => {
    if (!isOpen || !message) return null;

    const isUrgent = message.message_type === 'customer_to_admin_urgent';
    const canDelete = message.status === 'resolved' || message.status === 'archived';
    const canResolve = message.status !== 'resolved' && message.status !== 'archived';
    const canArchive = message.status !== 'archived';
    const isInboxMessage = message.message_type === 'customer_to_admin' || 
                          message.message_type === 'customer_to_admin_urgent' ||
                          message.message_type === 'guest_to_admin';

    const messageTypeLabel = getMessageTypeLabel(message.message_type);
    const priorityLabel = getMessagePriorityLabel(message.priority || 'normal');
    const priorityClassName = styles[`priority${(message.priority || 'normal').charAt(0).toUpperCase() + (message.priority || 'normal').slice(1)}`];

    return (
        <div 
            className={styles.modalOverlay}
            onClick={onClose}
        >
            <div 
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className={styles.modalHeader}>
                    <div className={styles.modalHeaderTitle}>
                        <h2>Message Details</h2>
                    </div>
                    <div className={styles.modalHeaderActions}>
                        {isInboxMessage && (
                            <button 
                                className={`${styles.actionButton} ${styles.replyButton}`}
                                onClick={() => {
                                    onReply(message);
                                    onClose();
                                }}
                            >
                                📧 Reply
                            </button>
                        )}
                        {canResolve && (
                            <button 
                                className={`${styles.actionButton} ${styles.resolveButton}`}
                                onClick={async () => {
                                    await onMarkAsResolved(message.message_id);
                                    onClose();
                                }}
                            >
                                ✓ Resolve
                            </button>
                        )}
                        {canArchive && (
                            <button 
                                className={`${styles.actionButton} ${styles.archiveButton}`}
                                onClick={async () => {
                                    await onMarkAsArchived(message.message_id);
                                    onClose();
                                }}
                            >
                                📥 Archive
                            </button>
                        )}
                        {canDelete && (
                            <button 
                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                onClick={async () => {
                                    await onDelete(message.message_id);
                                    onClose();
                                }}
                            >
                                🗑️ Delete
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className={styles.closeButton}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className={styles.modalBody}>
                    {/* Header Section */}
                    <div className={styles.modalHeaderSection}>
                        <div className={styles.modalHeaderContent}>
                            {isUrgent && (
                                <span className={styles.urgentBadge}>
                                    🚨 URGENT
                                </span>
                            )}
                            <h2 className={styles.modalTitle}>
                                {message.subject}
                            </h2>
                            <div className={styles.badgeRow}>
                                <span className={styles.typeBadge}>{messageTypeLabel}</span>
                                <span className={`${styles.priorityBadge} ${priorityClassName}`}>
                                    {priorityLabel}
                                </span>
                                <span className={`${styles.statusBadge} ${styles[`status${message.status.charAt(0).toUpperCase() + message.status.slice(1)}`]}`}>
                                    {message.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className={styles.modalSection}>
                        <div className={styles.modalInfoGrid}>
                            <div className={styles.infoCard}>
                                <h3 className={styles.infoLabel}>
                                    From
                                </h3>
                                <div>
                                <p className={styles.infoValue}>
                                    {message.sender_name}
                                </p>
                                <p className={styles.infoText}>
                                    📧 {message.sender_email}
                                </p>
                                {message.sender_phone ? (
                                    <p className={styles.infoText}>
                                        📞 {message.sender_phone}
                                    </p>
                                ) : (
                                    <p className={styles.infoText}>
                                        📞 No number registered
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className={styles.infoCard}>
                            <h3 className={styles.infoLabel}>
                                Date
                            </h3>
                            <div>
                                <p className={styles.infoValue} style={{ margin: 0 }}>
                                    {formatDateTime(message.created_at)}
                                </p>
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* Related Items */}
                    {(message.order_number || message.product_name) && (
                        <div className={styles.modalSection}>
                            <div className={styles.relatedItems}>
                            <h3 className={styles.infoLabel} style={{ color: '#1e40af' }}>
                                Related Items
                            </h3>
                            <div className={styles.relatedItemsList}>
                                {message.order_number && (
                                    <span className={styles.orderBadge}>
                                        📦 Order: {message.order_number}
                                    </span>
                                )}
                                {message.product_name && (
                                    <span className={styles.productBadge}>
                                        👟 Product: {message.product_name}
                                    </span>
                                )}
                            </div>
                            </div>
                        </div>
                    )}

                    {/* Message Body */}
                    <div className={styles.modalSection}>
                        <div className={styles.messageBodySection}>
                        <h3 className={styles.infoLabel}>
                            Message
                        </h3>
                        <div className={styles.messageBodyContent}>
                            {message.message.split('\n').map((line, i) => (
                                <p key={i}>
                                    {line || '\u00A0'}
                                </p>
                            ))}
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageDetailModal;

