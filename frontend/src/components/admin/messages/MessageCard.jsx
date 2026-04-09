// MessageCard.jsx
import React from 'react';
import { formatRelativeTime } from '../../../utils/date.utils';
import { getMessageTypeLabel, getMessagePriorityLabel } from '../../../utils/user.utils';
import styles from './messages.module.css';

const MessageCard = ({ message, onClick }) => {
    const isUrgent = message.message_type === 'customer_to_admin_urgent';
    const isUnread = message.status === 'new';

    return (
        <div 
            className={`${styles.messageCard} ${isUnread ? styles.messageCardUnread : ''} ${isUrgent ? styles.messageCardUrgent : ''}`}
            onClick={onClick}
        >
            <div className={styles.messageHeader}>
                <div className={styles.messageBadges}>
                    {isUrgent && (
                        <span className={styles.urgentBadge}>
                            🚨 URGENT
                        </span>
                    )}
                    <span className={styles.typeBadge}>
                        {getMessageTypeLabel(message.message_type)}
                    </span>
                    {message.priority && (
                        <span className={`${styles.priorityBadge} ${styles[`priority${message.priority.charAt(0).toUpperCase() + message.priority.slice(1)}`]}`}>
                            {getMessagePriorityLabel(message.priority)}
                        </span>
                    )}
                    <span className={`${styles.statusBadge} ${styles[`status${message.status.charAt(0).toUpperCase() + message.status.slice(1)}`]}`}>
                        {message.status}
                    </span>
                </div>
                <span className={styles.messageDate}>
                    {formatRelativeTime(message.created_at)}
                </span>
            </div>

            <div className={styles.messageContent}>
                <div className={styles.messageSubject}>
                    {message.subject}
                </div>
                <div className={styles.messageSender}>
                    <span className={styles.senderName}>{message.sender_name}</span>
                    <span className={styles.senderDivider}>•</span>
                    <span>{message.sender_email}</span>
                    {message.sender_phone && (
                        <>
                            <span className={styles.senderDivider}>•</span>
                            <span>📞 {message.sender_phone}</span>
                        </>
                    )}
                </div>
            </div>

            <div className={styles.messagePreview}>
                {message.message.substring(0, 150)}
                {message.message.length > 150 && '...'}
            </div>

            {(message.order_number || message.product_name) && (
                <div className={styles.messageLinks}>
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
            )}
        </div>
    );
};

export default MessageCard;

