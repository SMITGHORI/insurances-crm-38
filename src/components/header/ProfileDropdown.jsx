
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  Activity,
  Clock,
  Bell,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { headerBackendApi } from '@/services/api/headerApiBackend';
import { toast } from 'sonner';

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load profile data on component mount
  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const data = await headerBackendApi.getProfileData();
      setProfileData(data);
    } catch (error) {
      console.error('Failed to load profile data:', error);
      // Use auth context user as fallback
      setProfileData(user);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout');
    }
  };

  const handleProfileClick = () => {
    navigate('/settings');
  };

  const handleActivityClick = () => {
    navigate('/recent-activities');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleBadgeVariant = (role) => {
    const roleName = typeof role === 'string' ? role : role?.name || role?.displayName || role?.title || '';
    
    switch (roleName) {
      case 'super_admin':
        return 'destructive';
      case 'manager':
        return 'default';
      case 'agent':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatRole = (role) => {
    if (typeof role === 'string') {
      return role.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    if (typeof role === 'object' && role !== null) {
      const roleName = role.name || role.displayName || role.title || '';
      return roleName.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return 'User';
  };

  const currentUser = profileData || user;

  if (!currentUser) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center space-x-2 h-auto p-2 rounded-full hover:bg-gray-100"
          disabled={loading}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback className="text-xs">
              {getInitials(currentUser.name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-gray-900">
              {currentUser.name}
            </div>
            <div className="text-xs text-gray-500">
              {formatRole(currentUser.role)}
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel>
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback>
                {getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                {currentUser.name}
              </div>
              <div className="text-sm text-gray-500">
                {currentUser.email}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={getRoleBadgeVariant(currentUser.role)} className="text-xs">
                  {formatRole(currentUser.role)}
                </Badge>
                {currentUser.isOnline && (
                  <div className="flex items-center space-x-1">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-500">Online</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        
        {currentUser.jobTitle && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1">
              <div className="text-xs text-gray-500">Job Title</div>
              <div className="text-sm font-medium">{currentUser.jobTitle}</div>
            </div>
          </>
        )}

        {currentUser.lastActivity && (
          <div className="px-2 py-1">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>Last active: {new Date(currentUser.lastActivity).toLocaleDateString()}</span>
            </div>
          </div>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile & Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleActivityClick} className="cursor-pointer">
          <Activity className="mr-2 h-4 w-4" />
          <span>Recent Activity</span>
        </DropdownMenuItem>

        {(() => {
          const roleName = typeof currentUser.role === 'string' ? currentUser.role : currentUser.role?.name || currentUser.role?.displayName || currentUser.role?.title;
          return (roleName === 'super_admin' || roleName === 'manager');
        })() && (
          <DropdownMenuItem 
            onClick={() => navigate('/settings')} 
            className="cursor-pointer"
          >
            <Shield className="mr-2 h-4 w-4" />
            <span>Admin Settings</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem 
          onClick={() => navigate('/settings')} 
          className="cursor-pointer"
        >
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
