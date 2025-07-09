
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
import { Mail, User, MessageSquare, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { headerBackendApi } from '@/services/api/headerApiBackend';
import { toast } from 'sonner';
import useWebSocket from '@/hooks/useWebSocket';

const MessagesDropdown = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { lastMessage } = useWebSocket();

  // Load messages on component mount
  useEffect(() => {
    loadMessages();
  }, []);

  // Listen for real-time message updates
  useEffect(() => {
    if (lastMessage?.type === 'message' || lastMessage?.type === 'new_message') {
      loadMessages();
      toast.info('New message received');
    }
  }, [lastMessage]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await headerBackendApi.getMessages(10);
      setMessages(data.messages || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = async (messageId) => {
    try {
      await headerBackendApi.markMessageAsRead(messageId);
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
      
      // Navigate to communication page or message detail
      navigate('/communication');
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      toast.error('Failed to mark message as read');
    }
  };

  const handleViewAllMessages = () => {
    navigate('/communication');
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

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'client_inquiry':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'internal':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'management':
        return <Clock className="h-4 w-4 text-purple-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
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
          <Mail className="h-5 w-5" />
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
          <span>Messages</span>
          <Badge variant="secondary">{unreadCount} new</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Mail className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No messages</p>
          </div>
        ) : (
          messages.map((message) => (
            <DropdownMenuItem 
              key={message.id}
              className="flex flex-col items-start p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => handleMessageClick(message.id)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  {message.sender.avatar ? (
                    <img 
                      src={message.sender.avatar} 
                      alt={message.sender.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                      {getInitials(message.sender.name)}
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    {getMessageTypeIcon(message.type)}
                    <span className="font-medium text-sm">{message.sender.name}</span>
                    {!message.isRead && (
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(message.createdAt)}
                </span>
              </div>
              <div className="mt-1 w-full">
                <p className="font-medium text-sm text-gray-900 truncate">
                  {message.subject}
                </p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {message.preview}
                </p>
              </div>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-center py-3 cursor-pointer"
          onClick={handleViewAllMessages}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          View All Messages
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MessagesDropdown;
