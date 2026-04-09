// MessageTabs.jsx - Reusable tabs component for messages
import React from 'react';
import styles from './messages.module.css';

const MessageTabs = ({ activeTab, onTabChange, tabs }) => {
    return (
        <div className={styles.tabNavigation}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.icon && <span>{tab.icon}</span>}
                    <span>{tab.label}</span>
                    {tab.badge && tab.badge > 0 && (
                        <span 
                            className={`${styles.tabBadge} ${activeTab === tab.id ? styles.tabBadgeActive : styles.tabBadgeInactive}`}
                        >
                            {tab.badge}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
};

export default MessageTabs;

