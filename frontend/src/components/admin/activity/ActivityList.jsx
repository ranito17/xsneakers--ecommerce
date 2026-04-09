import React, { useState } from 'react';
import ActivityItem from './ActivityItem';
import LoadingContainer from '../../common/loading/LoadingContainer';
import styles from './activity.module.css';

const ActivityList = ({ activities, loading }) => {
    const [expandedId, setExpandedId] = useState(null);
    
    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (loading && (!activities || activities.length === 0)) {
        return <LoadingContainer message="Loading activities..." size="medium" />;
    }

    if (!activities || activities.length === 0) {
        return (
            <div className={styles.empty}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3>No Activities Found</h3>
                <p>There are no activities matching your filters.</p>
            </div>
        );
    }

    return (
        <div className={styles.activityList}>
            <div className={styles.listHeader}>
                <h2>Recent Activities</h2>
                <span className={styles.count}>
                    Showing {activities.length} activities
                </span>
            </div>

            <div className={styles.list}>
                {activities.map(activity => (
                    <ActivityItem 
                        key={activity.id} 
                        activity={activity}
                        isExpanded={expandedId === activity.id}
                        onToggleExpand={() => toggleExpand(activity.id)}
                    />
                ))}
            </div>

        </div>
    );
};

export default ActivityList;

