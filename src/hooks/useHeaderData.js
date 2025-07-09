
import { useState, useEffect } from 'react';
import { headerBackendApi } from '@/services/api/headerApiBackend';
import useWebSocket from './useWebSocket';

/**
 * Custom hook for managing header data (notifications, messages, profile)
 */
export const useHeaderData = () => {
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({
    notifications: 0,
    messages: 0
  });
  const [loading, setLoading] = useState({
    notifications: false,
    messages: false,
    profile: false
  });

  const { lastMessage, connected } = useWebSocket();

  // Load all header data
  const loadHeaderData = async () => {
    await Promise.all([
      loadNotifications(),
      loadMessages(),
      loadProfile()
    ]);
  };

  // Load notifications
  const loadNotifications = async () => {
    try {
      setLoading(prev => ({ ...prev, notifications: true }));
      const data = await headerBackendApi.getNotifications(10);
      setNotifications(data.notifications || []);
      setUnreadCounts(prev => ({ ...prev, notifications: data.unreadCount || 0 }));
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  };

  // Load messages
  const loadMessages = async () => {
    try {
      setLoading(prev => ({ ...prev, messages: true }));
      const data = await headerBackendApi.getMessages(10);
      setMessages(data.messages || []);
      setUnreadCounts(prev => ({ ...prev, messages: data.unreadCount || 0 }));
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  };

  // Load profile data
  const loadProfile = async () => {
    try {
      setLoading(prev => ({ ...prev, profile: true }));
      const data = await headerBackendApi.getProfileData();
      setProfileData(data);
    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await headerBackendApi.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCounts(prev => ({ 
        ...prev, 
        notifications: Math.max(0, prev.notifications - 1) 
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  };

  // Mark message as read
  const markMessageAsRead = async (messageId) => {
    try {
      await headerBackendApi.markMessageAsRead(messageId);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
      setUnreadCounts(prev => ({ 
        ...prev, 
        messages: Math.max(0, prev.messages - 1) 
      }));
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      throw error;
    }
  };

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'notification':
        case 'new_notification':
          loadNotifications();
          break;
        case 'message':
        case 'new_message':
          loadMessages();
          break;
        case 'profile_update':
          loadProfile();
          break;
        default:
          break;
      }
    }
  }, [lastMessage]);

  // Initial data load
  useEffect(() => {
    loadHeaderData();
  }, []);

  return {
    notifications,
    messages,
    profileData,
    unreadCounts,
    loading,
    connected,
    loadNotifications,
    loadMessages,
    loadProfile,
    markNotificationAsRead,
    markMessageAsRead,
    refreshAll: loadHeaderData
  };
};

export default useHeaderData;
