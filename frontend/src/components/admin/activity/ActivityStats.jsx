import React from 'react';
import styles from './activity.module.css';

const formatActionType = (actionType) => {
    return actionType
        .split('_')
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
};

const ActivityStats = ({ stats }) => {
    if (!stats || stats.length === 0) {
        return null;
    }

    // Calculate total activities
    const totalActivities = stats.reduce((sum, stat) => sum + stat.count, 0);

    // Get top 6 activities
    const topStats = stats.slice(0, 6);

    return (
        <div className={styles.statsSection}>
            <h2 className={styles.statsTitle}>Activity Overview</h2>
            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.totalCard}`}>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{totalActivities}</div>
                        <div className={styles.statLabel}>Total</div>
                    </div>
                </div>

                {topStats.map((stat, index) => (
                    <div key={index} className={styles.statCard}>
                        <div className={styles.statContent}>
                            <div className={styles.statValue}>{stat.count}</div>
                            <div className={styles.statLabel}>
                                {formatActionType(stat.action_type)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityStats;
