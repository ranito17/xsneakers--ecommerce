// שירות API לפעילויות (Activity) - משמש לקריאה/איסוף לוגים וסטטיסטיקות
import api from './api';

// קבלת פעילויות עם פילטרים (תאריכים, סוג פעולה, משתמש ועוד)
export const getActivities = async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    if (filters.action_type) params.append('action_type', filters.action_type);
    if (filters.entity_type) params.append('entity_type', filters.entity_type);
    if (filters.user_id) params.append('user_id', filters.user_id);
    if (filters.user_email) params.append('user_email', filters.user_email);
    if (filters.days_back) params.append('days_back', filters.days_back);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    
    const response = await api.get(`/api/activityRoutes?${params.toString()}`);
    return response.data;
};

// קבלת סטטיסטיקות על פעילויות (בחתך זמן)
export const getActivityStatistics = async (daysBack = 90) => {
    const response = await api.get(`/api/activityRoutes/statistics?days_back=${daysBack}`);
    return response.data;
};

// מחיקת פעילויות ישנות לפי מספר ימים (ברירת מחדל 90)
export const deleteOldActivities = async (daysOld = 90) => {
    const response = await api.delete(`/api/activityRoutes/old?days_old=${daysOld}`);
    return response.data;
};

export default {
    getActivities,
    getActivityStatistics,
    deleteOldActivities
};

