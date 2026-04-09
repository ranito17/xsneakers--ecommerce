import React, { useState, useEffect } from 'react';
import { ActivityFilters, ActivityList, ActivityStats } from '../../components/admin/activity';
import { activityApi } from '../../services';
import LoadingContainer from '../../components/common/loading/LoadingContainer';
import ErrorContainer from '../../components/common/error/ErrorContainer';
import { useToast } from '../../components/common/toast/ToastProvider';
import ProtectedRoute from '../../components/ProtectedRoute';
import useAuthorization from '../../hooks/useAuthorization';
import pageStyles from './adminPages.module.css';

const ActivityPageAdmin = () => {
    const { showSuccess, showError, showConfirmation } = useToast();
    const [activities, setActivities] = useState([]);
    const [stats, setStats] = useState([]);
    const [filters, setFilters] = useState({
        days_back: 90,
        action_type: '',
        entity_type: '',
        user_email: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { isAuthorized, isLoading } = useAuthorization('admin');
    
    useEffect(() => {
        if (isAuthorized && !isLoading) {
            fetchActivities();
            fetchStats();
        }
    }, [filters, isAuthorized, isLoading]);
    
    // If still loading auth, show loading
    if (isLoading) {
        return <LoadingContainer message="Loading..." size="large" />;
    }
    
    // If not authorized, don't execute any component logic
    if (!isAuthorized) {
        return <ProtectedRoute requiredRole="admin"><div /></ProtectedRoute>;
    }

    // fetchActivities - טוען פעילויות מהשרת
    // שליחה לשרת: { days_back, action_type, entity_type, user_email,}
    // תגובה מהשרת: { success: true, data: { activities: [...] } }
    const fetchActivities = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await activityApi.getActivities({
                days_back: filters.days_back || 90,
                action_type: filters.action_type || undefined,
                entity_type: filters.entity_type || undefined,
                user_email: filters.user_email || undefined
            });
            if (response.success) {
                setActivities(response.data.activities || []);
            }
        } catch (err) {
            console.error('Error fetching activities:', err);
            setError(err.response?.data?.message || 'Failed to load activities');
            setActivities([]);
        } finally {
            setLoading(false);
        }
    };


    // fetchStats - טוען סטטיסטיקות פעילויות
    // שליחה לשרת: days_back
    // תגובה מהשרת: { success: true, data: [{ action_type, entity_type, count }] }
    const fetchStats = async () => {
        try {
            const response = await activityApi.getActivityStatistics(filters.days_back || 90);
            if (response.success) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };


    // handleDeleteOld - מוחק פעילויות ישנות יותר מ-90 ימים
    // שליחה לשרת: days_old: 90
    // תגובה מהשרת: { success: true, data: { deleted_count: number } }
    const handleDeleteOld = async () => {
        const confirmed = await showConfirmation(
            'Are you sure you want to delete all activities older than 90 days? This action cannot be undone.'
        );
        if (!confirmed) {
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const response = await activityApi.deleteOldActivities(90);
            if (response.success) {
                await fetchActivities();
                showSuccess(`Successfully deleted ${response.data.deleted_count} activities older than 90 days.`);
            }
        } catch (err) {
            console.error('Error deleting old activities:', err);
            setError(err.response?.data?.message || 'Failed to delete old activities');
            showError('Failed to delete old activities. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    // handleFilterChange - מעדכן את מסנני הפעילויות
    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters
        }));
    };


    if (loading && activities.length === 0) {
        return <LoadingContainer message="Loading activity log..." size="large" />;
    }
    if (error) {
        return (
            <ErrorContainer
                message={error}
                onRetry={fetchActivities}
                showRetry={true}
            />
        );
    }
    return (
        <div className={pageStyles.activityPage}>
            <div className={pageStyles.activityContent}>
                <ActivityFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onDeleteOld={handleDeleteOld}
                />
                <ActivityList
                    activities={activities}
                    loading={loading}
                />
                <ActivityStats stats={stats} />
            </div>
        </div>
    );
};

export default ActivityPageAdmin;
