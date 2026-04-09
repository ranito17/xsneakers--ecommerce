// MessagesPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuthentication';
import { useToast } from '../../components/common/toast';
import { messageApi } from '../../services';
import { ContactFormModal } from '../../components/contactForm';
import { StockRefuelModal } from '../../components/admin/dashboard';
import { LoadingContainer, ErrorContainer } from '../../components/contactForm';
import MessageTabs from '../../components/admin/messages/MessageTabs';
import MessageCard from '../../components/admin/messages/MessageCard';
import MessageDetailModal from '../../components/admin/messages/MessageDetailModal';
import ProtectedRoute from '../../components/ProtectedRoute';
import styles from './adminPages.module.css';
import msgStyles from '../../components/admin/messages/messages.module.css';

const MessagesPage = () => {
    const { user } = useAuth();
    const { showSuccess, showError, showConfirmation } = useToast();
    const [activeTab, setActiveTab] = useState('customer');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [contactModalType, setContactModalType] = useState('customer');
    const [contactModalInitialData, setContactModalInitialData] = useState({});
    const [stockModalOpen, setStockModalOpen] = useState(false);

    // loadMessages - טוען את כל ההודעות מהשרת
    // שליחה לשרת: getAllMessages()
    // תגובה מהשרת: { success: true, data: [...] }
    const loadMessages = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await messageApi.getAllMessages();
            if (response.success) {
                setMessages(response.data || []);
            } else {
                setError('Failed to load messages');
            }
        } catch (err) {
            console.error('Error loading messages:', err);
            setError('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };


    // handleContactModalSubmit - שולח הודעה חדשה
    // שליחה לשרת: createMessage({ messageType, name, email, phone, recipientEmail, subject, message, orderId, productId })
    // תגובה מהשרת: { success: true }
    const handleContactModalSubmit = async (formData) => {
        try {
            const response = await messageApi.createMessage({
                messageType: formData.messageType,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                recipientEmail: formData.recipientEmail,
                subject: formData.subject,
                message: formData.message,
                orderId: formData.orderId,
                productId: formData.productId
            });
            if (response.success) {
                showSuccess('Message sent successfully!');
                setContactModalOpen(false);
                setContactModalInitialData({});
                loadMessages();
            } else {
                showError('Failed to send message: ' + response.message);
            }
        } catch (err) {
            console.error('Error sending message:', err);
            showError('Failed to send message. Please try again.');
        }
    };


    // handleMarkAsRead - מסמן הודעה כנקראה
    // שליחה לשרת: updateMessageStatus(messageId, 'read')
    // תגובה מהשרת: { success: true }
    const handleMarkAsRead = async (messageId) => {
        try {
            const response = await messageApi.updateMessageStatus(messageId, 'read');
            if (response.success) {
                loadMessages();
            }
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };


    // handleMarkAsResolved - מסמן הודעה כטופלה
    // שליחה לשרת: updateMessageStatus(messageId, 'resolved')
    // תגובה מהשרת: { success: true }
    const handleMarkAsResolved = async (messageId) => {
        try {
            const response = await messageApi.updateMessageStatus(messageId, 'resolved');
            if (response.success) {
                showSuccess('Message marked as resolved!');
                setSelectedMessage(null);
                loadMessages();
            }
        } catch (err) {
            console.error('Error marking as resolved:', err);
            showError('Failed to mark as resolved');
        }
    };


    // handleMarkAsArchived - מסמן הודעה כארכיון
    // שליחה לשרת: updateMessageStatus(messageId, 'archived')
    // תגובה מהשרת: { success: true }
    const handleMarkAsArchived = async (messageId) => {
        try {
            const response = await messageApi.updateMessageStatus(messageId, 'archived');
            if (response.success) {
                showSuccess('Message archived!');
                setSelectedMessage(null);
                loadMessages();
            }
        } catch (err) {
            console.error('Error archiving message:', err);
            showError('Failed to archive message');
        }
    };


    // handleDeleteMessage - מוחק הודעה
    // שליחה לשרת: deleteMessage(messageId)
    // תגובה מהשרת: { success: true }
    const handleDeleteMessage = async (messageId) => {
        const confirmed = await showConfirmation(
            'Are you sure you want to delete this message? This action cannot be undone.'
        );
        if (!confirmed) {
            return;
        }
        try {
            const response = await messageApi.deleteMessage(messageId);
            if (response.success) {
                showSuccess('Message deleted successfully!');
                setSelectedMessage(null);
                loadMessages();
            }
        } catch (err) {
            console.error('Error deleting message:', err);
            showError(err.response?.data?.message || 'Failed to delete message. Only resolved messages can be deleted.');
        }
    };


    // handleReply - פותח מודל תשובה להודעה
    const handleReply = (message) => {
        setContactModalType('reply');
        setContactModalInitialData({
            recipientEmail: message.sender_email,
            subject: `Re: ${message.subject || ''}`
        });
        setContactModalOpen(true);
    };


    // handleSendMessageToSupplier - פותח מודל שליחת הודעה לספק
    const handleSendMessageToSupplier = () => {
        setContactModalType('admin_to_supplier');
        setContactModalOpen(true);
    };


    // handleStockRefuel - פותח מודל בקשת מילוי מלאי
    const handleStockRefuel = () => {
        setStockModalOpen(true);
    };


    // handleCloseStockModal - סוגר מודל מילוי מלאי
    const handleCloseStockModal = () => {
        setStockModalOpen(false);
    };


    // handleStockRefuelSuccess - מטפל בהצלחת שליחת בקשת מילוי מלאי
    const handleStockRefuelSuccess = () => {
        showSuccess('Stock refuel request sent!');
        setStockModalOpen(false);
        loadMessages();
    };


    useEffect(() => {
        loadMessages();
    }, []);


    const getFilteredMessages = () => {
        let filtered = messages;
        if (activeTab === 'customer') {
            filtered = filtered.filter(m =>
                m.message_type === 'customer_to_admin' ||
                m.message_type === 'customer_to_admin_urgent'
            );
        } else if (activeTab === 'guest') {
            filtered = filtered.filter(m => m.message_type === 'guest_to_admin');
        }
        if (filterStatus !== 'all') {
            filtered = filtered.filter(m => m.status === filterStatus);
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(m =>
                m.subject.toLowerCase().includes(query) ||
                m.message.toLowerCase().includes(query) ||
                m.sender_name.toLowerCase().includes(query) ||
                m.sender_email.toLowerCase().includes(query)
            );
        }
        return filtered;
    };
    const customerCount = messages.filter(m =>
        m.message_type === 'customer_to_admin' || m.message_type === 'customer_to_admin_urgent'
    ).length;
    const guestCount = messages.filter(m =>
        m.message_type === 'guest_to_admin'
    ).length;
    const filteredMessages = getFilteredMessages();
    if (loading) {
        return (
            <ProtectedRoute requiredRole="admin">
                <LoadingContainer message="Loading messages..." size="large" />
            </ProtectedRoute>
        );
    }
    if (error) {
        return (
            <ProtectedRoute requiredRole="admin">
                <ErrorContainer message={error} onRetry={loadMessages} />
            </ProtectedRoute>
        );
    }
    return (
        <ProtectedRoute requiredRole="admin">
            <div className={styles.pageContainer} style={{ padding: '2rem' }}>
                <div className={msgStyles.topSection}>
                    <div className={msgStyles.tabsSection}>
                        <MessageTabs
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            tabs={[
                                {
                                    id: 'customer',
                                    label: 'Customer Messages',
                                    icon: '👥',
                                    badge: customerCount
                                },
                                {
                                    id: 'guest',
                                    label: 'Guest Messages',
                                    icon: '👤',
                                    badge: guestCount
                                },
                            ]}
                        />
                    </div>
                    <div className={msgStyles.actionButtonsSection}>
                        <button
                            className={`${msgStyles.actionButton} ${msgStyles.messageSupplierButton}`}
                            onClick={handleSendMessageToSupplier}
                        >
                            <span style={{ fontSize: '1.1rem' }}>📦</span>
                            Message Supplier
                        </button>
                        <button
                            className={`${msgStyles.actionButton} ${msgStyles.lowStockButton}`}
                            onClick={handleStockRefuel}
                        >
                            <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                            Low Stock Alert
                        </button>
                    </div>
                </div>
                <div className={msgStyles.filtersContainer}>
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={msgStyles.searchInput}
                    />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={msgStyles.statusSelect}
                    >
                        <option value="all">All Status</option>
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="resolved">Resolved</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
                <div className={msgStyles.contentContainer}>
                    {filteredMessages.length === 0 ? (
                        <div className={msgStyles.emptyState}>
                            <div className={msgStyles.emptyStateIcon}>📭</div>
                            <h3 className={msgStyles.emptyStateTitle}>No messages found</h3>
                            <p>
                                {activeTab === 'customer'
                                    ? 'No customer messages yet'
                                    : 'No guest messages yet'}
                            </p>
                        </div>
                    ) : (
                        <div className={msgStyles.messageList}>
                            {filteredMessages.map((message) => (
                                <MessageCard
                                    key={message.message_id}
                                    message={message}
                                    onClick={() => {
                                        setSelectedMessage(message);
                                        if (message.status === 'new') {
                                            handleMarkAsRead(message.message_id);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <ContactFormModal
                isOpen={contactModalOpen}
                onClose={() => {
                    setContactModalOpen(false);
                    setContactModalInitialData({});
                }}
                onSubmit={handleContactModalSubmit}
                type={contactModalType}
                initialData={contactModalType === 'reply' ? contactModalInitialData : {}}
            />
            <StockRefuelModal
                isOpen={stockModalOpen}
                onClose={handleCloseStockModal}
                onSuccess={handleStockRefuelSuccess}
            />
            <MessageDetailModal
                isOpen={!!selectedMessage}
                message={selectedMessage}
                onClose={() => setSelectedMessage(null)}
                onMarkAsRead={handleMarkAsRead}
                onMarkAsResolved={handleMarkAsResolved}
                onMarkAsArchived={handleMarkAsArchived}
                onReply={handleReply}
                onDelete={handleDeleteMessage}
            />
        </ProtectedRoute>
    );
};

export default MessagesPage;
