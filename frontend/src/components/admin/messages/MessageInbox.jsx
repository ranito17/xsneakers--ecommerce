// MessageInbox.jsx
import React from 'react';
import { formatRelativeTime } from '../../../utils/date.utils';
import { getMessageTypeLabel, getMessagePriorityLabel, getMessageStatusClass } from '../../../utils/user.utils';

const MessageInbox = ({ messages, onMessageClick, view }) => {
    if (messages.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                    {view === 'inbox' ? '📭' : '📤'}
                </div>
                <h3 style={{ color: '#1e293b', fontSize: '1.5rem', marginBottom: '0.5rem' }}>No messages found</h3>
                <p>
                    {view === 'inbox' 
                        ? 'You don\'t have any messages from customers or guests yet.' 
                        : 'You haven\'t sent any messages yet.'}
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((message) => {
                const isUrgent = message.message_type === 'customer_to_admin_urgent';
                const isUnread = message.status === 'new';
                
                return (
                    <div
                        key={message.message_id}
                        style={{
                            background: isUnread ? '#f0f9ff' : '#ffffff',
                            border: `1px solid ${isUrgent ? '#fecaca' : isUnread ? '#bfdbfe' : '#e2e8f0'}`,
                            borderRadius: '12px',
                            padding: '1.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            borderLeft: isUrgent ? '4px solid #ef4444' : isUnread ? '4px solid #3b82f6' : '1px solid #e2e8f0',
                            boxShadow: isUnread ? '0 2px 8px rgba(59, 130, 246, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.05)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.15)';
                            e.currentTarget.style.borderColor = '#3b82f6';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = isUnread ? '0 2px 8px rgba(59, 130, 246, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.05)';
                            e.currentTarget.style.borderColor = isUrgent ? '#fecaca' : isUnread ? '#bfdbfe' : '#e2e8f0';
                        }}
                        onClick={() => onMessageClick(message)}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                {isUrgent && (
                                    <span style={{ 
                                        background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', 
                                        color: '#dc2626', 
                                        padding: '0.375rem 0.875rem', 
                                        borderRadius: '8px', 
                                        fontSize: '0.75rem', 
                                        fontWeight: 700,
                                        border: '1px solid #fca5a5',
                                        boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
                                    }}>
                                        🚨 URGENT
                                    </span>
                                )}
                                <span style={{ 
                                    background: '#f1f5f9',
                                    color: '#64748b',
                                    padding: '0.375rem 0.875rem',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    {getMessageTypeLabel(message.message_type)}
                                </span>
                                {message.priority && (
                                    <span style={{ 
                                        background: message.priority === 'urgent' ? '#fee2e2' : message.priority === 'high' ? '#fef3c7' : '#f1f5f9',
                                        color: message.priority === 'urgent' ? '#dc2626' : message.priority === 'high' ? '#d97706' : '#64748b',
                                        padding: '0.375rem 0.875rem',
                                        borderRadius: '8px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        border: `1px solid ${message.priority === 'urgent' ? '#fca5a5' : message.priority === 'high' ? '#fcd34d' : '#e2e8f0'}`
                                    }}>
                                        {getMessagePriorityLabel(message.priority)}
                                    </span>
                                )}
                                <span style={{ 
                                    background: isUnread ? '#3b82f6' : '#f1f5f9', 
                                    color: isUnread ? 'white' : '#64748b', 
                                    padding: '0.375rem 0.875rem', 
                                    borderRadius: '8px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: 600, 
                                    textTransform: 'capitalize',
                                    border: isUnread ? 'none' : '1px solid #e2e8f0'
                                }}>
                                    {message.status}
                                </span>
                            </div>
                            <span style={{ 
                                color: '#94a3b8', 
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                whiteSpace: 'nowrap'
                            }}>
                                {formatRelativeTime(message.created_at)}
                            </span>
                        </div>

                        <div style={{ marginBottom: '0.75rem' }}>
                            <div style={{ 
                                color: '#1e293b', 
                                fontWeight: 700, 
                                fontSize: '1.125rem', 
                                marginBottom: '0.5rem',
                                lineHeight: '1.4'
                            }}>
                                {message.subject}
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.75rem', 
                                flexWrap: 'wrap',
                                color: '#64748b', 
                                fontSize: '0.875rem'
                            }}>
                                <span style={{ color: '#1e293b', fontWeight: 600 }}>{message.sender_name}</span>
                                <span style={{ color: '#94a3b8' }}>•</span>
                                <span>{message.sender_email}</span>
                                {message.sender_phone && (
                                    <>
                                        <span style={{ color: '#94a3b8' }}>•</span>
                                        <span>📞 {message.sender_phone}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div style={{ 
                            color: '#475569', 
                            fontSize: '0.9rem', 
                            lineHeight: '1.6',
                            marginBottom: '0.75rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {message.message.substring(0, 150)}
                            {message.message.length > 150 && '...'}
                        </div>

                        {(message.order_number || message.product_name) && (
                            <div style={{ 
                                display: 'flex', 
                                gap: '0.75rem', 
                                marginTop: '0.75rem',
                                paddingTop: '0.75rem',
                                borderTop: '1px solid #e2e8f0',
                                flexWrap: 'wrap'
                            }}>
                                {message.order_number && (
                                    <span style={{ 
                                        background: '#eff6ff',
                                        color: '#2563eb',
                                        padding: '0.375rem 0.75rem',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        border: '1px solid #bfdbfe'
                                    }}>
                                        📦 Order: {message.order_number}
                                    </span>
                                )}
                                {message.product_name && (
                                    <span style={{ 
                                        background: '#f0fdf4',
                                        color: '#16a34a',
                                        padding: '0.375rem 0.75rem',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        border: '1px solid #bbf7d0'
                                    }}>
                                        👟 Product: {message.product_name}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default MessageInbox;

