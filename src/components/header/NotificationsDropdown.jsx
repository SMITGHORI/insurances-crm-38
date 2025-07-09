
import React, { useState, useEffect } from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertCircle, CheckCircle, Clock, Settings, Info, AlertTriangle, XCircle } from 'lucide-react';
import { headerBackendApi } from '@/services/api/headerApiBackend';
import { toast } from 'sonner';
import useWebSocket from '@/hooks/useWebSocket';

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { lastMessage } = useWebSocket();

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications();
  }, []);

  // Listen for real-time notification updates
  useEffect(() => {
    if (lastMessage?.type === 'notification') {
      loadNotifications();
      toast.info(lastMessage.message || 'New notification received');
    }
  }, [lastMessage]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await headerBackendApi.getNotifications(10);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    const icons = {
      'alert': AlertTriangle,
      'warning': AlertTriangle,
      'success': CheckCircle,
      'info': Info,
      'error': XCircle
    };
    const IconComponent = icons[type] || Bell;
    return <IconComponent className="h-4 w-4" />;
  };

  const getIconColor = (type) => {
    const colors = {
      'alert': 'text-orange-500',
      'warning': 'text-yellow-500',
      'success': 'text-green-500',
      'info': 'text-blue-500',
      'error': 'text-red-500'
    };
    return colors[type] || 'text-gray-500';
  };

  const markAsRead = async (notificationId) => {
    try {
      await headerBackendApi.markNotificationAsRead(notificationId);
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(unreadNotifications.map(n => 
        headerBackendApi.markNotificationAsRead(n.id)
      ));
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-1 rounded-full text-gray-600 hover:text-amba-blue hover:bg-gray-100 relative"
          disabled={loading}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{unreadCount} new</Badge>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-6"
                onClick={markAllAsRead}
              >
                Mark all read
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className={`flex flex-col items-start p-4 cursor-pointer border-l-4 ${
                  notification.isRead ? 'border-l-gray-300 bg-gray-50' : 'border-l-blue-500 bg-white'
                } hover:border-l-blue-500`}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <span className={getIconColor(notification.type)}>
                      {getIcon(notification.type)}
                    </span>
                    <span className={`font-medium text-sm ${
                      notification.isRead ? 'text-gray-600' : 'text-gray-900'
                    }`}>
                      {notification.title}
                    </span>
                    {!notification.isRead && (
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(notification.createdAt)}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${
                  notification.isRead ? 'text-gray-500' : 'text-gray-700'
                }`}>
                  {notification.message}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center py-3 cursor-pointer">
          <Settings className="h-4 w-4 mr-2" />
          Notification Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
