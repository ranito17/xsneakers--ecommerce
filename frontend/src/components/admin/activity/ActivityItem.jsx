import React from 'react';
import styles from './activity.module.css';

const getActionIcon = (actionType) => {
    if (actionType.includes('ORDER')) return '📦';
    if (actionType.includes('PRODUCT')) return '🏷️';
    if (actionType.includes('STOCK')) return '📊';
    if (actionType.includes('CATEGORY')) return '📁';
    if (actionType.includes('USER')) return '👤';
    if (actionType.includes('SETTINGS')) return '⚙️';
    if (actionType.includes('MESSAGE')) return '💬';
    if (actionType.includes('SUPPLIER')) return '🚚';
    return '📋';
};

const getActionColor = (actionType) => {
    if (actionType.includes('CREATED')) return 'success';
    if (actionType.includes('DELETED') || actionType.includes('CANCELLED')) return 'danger';
    if (actionType.includes('UPDATED') || actionType.includes('CHANGED')) return 'warning';
    if (actionType.includes('PLACED') || actionType.includes('FULFILLED')) return 'info';
    return 'default';
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
};

const formatActionType = (actionType) => {
    return actionType
        .split('_')
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
};

const ActivityItem = ({ activity, isExpanded, onToggleExpand }) => {
    const icon = getActionIcon(activity.action_type);
    const colorClass = getActionColor(activity.action_type);

    return (
        <div className={`${styles.activityItem} ${isExpanded ? styles.expanded : ''}`}>
            <div className={styles.itemMain} onClick={onToggleExpand}>
                <div className={styles.iconWrapper}>
                    <span className={`${styles.icon} ${styles[colorClass]}`}>
                        {icon}
                    </span>
                </div>

                <div className={styles.itemContent}>
                    <div className={styles.itemHeader}>
                        <h3 className={styles.description}>{activity.description}</h3>
                        <span className={`${styles.badge} ${styles[colorClass]}`}>
                            {formatActionType(activity.action_type)}
                        </span>
                    </div>

                    <div className={styles.itemMeta}>
                        <span className={styles.user}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {activity.username || 'System'}
                        </span>
                        <span className={styles.separator}>•</span>
                        <span className={styles.time}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDate(activity.created_at)}
                        </span>
                        <span className={styles.separator}>•</span>
                        <span className={styles.entity}>
                            {activity.entity_type}
                        </span>
                    </div>
                </div>

                <button 
                    className={styles.expandBtn} 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        onToggleExpand(); 
                    }}
                >
                    <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor"
                        className={isExpanded ? styles.rotated : ''}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {isExpanded && (
                <div className={styles.itemDetails}>
                    <div className={styles.detailsGrid}>
                        {activity.email && (
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Email:</span>
                                <span className={styles.detailValue}>{activity.email}</span>
                            </div>
                        )}
                        
                        {activity.role && (
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Role:</span>
                                <span className={styles.detailValue}>{activity.role}</span>
                            </div>
                        )}
                        
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Timestamp:</span>
                            <span className={styles.detailValue}>
                                {new Date(activity.created_at).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityItem;

