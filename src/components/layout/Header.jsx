
import React, { useEffect } from 'react';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import MessagesDropdown from '../header/MessagesDropdown';
import NotificationsDropdown from '../header/NotificationsDropdown';
import ProfileDropdown from '../header/ProfileDropdown';
import useWebSocket from '@/hooks/useWebSocket';

const Header = ({ onMenuClick }) => {
  const isMobile = useIsMobile();
  const { connected, lastMessage } = useWebSocket();

  // Log WebSocket connection status
  useEffect(() => {
    console.log('Header WebSocket connection status:', connected);
  }, [connected]);

  // Log incoming WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      console.log('Header received WebSocket message:', lastMessage);
    }
  }, [lastMessage]);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm py-2 px-2 sm:px-4">
      <div className="flex items-center justify-between max-w-full">
        <div className="flex items-center">
          <button
            data-menu-button="true"
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-600 hover:text-amba-blue hover:bg-gray-100 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Right side icons */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 ml-auto">
          {/* WebSocket connection indicator (only show when disconnected) */}
          {!connected && (
            <div className="flex items-center space-x-1 text-xs text-red-500 mr-2">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <span className="hidden sm:inline">Offline</span>
            </div>
          )}
          
          {!isMobile && (
            <>
              <MessagesDropdown />
              <NotificationsDropdown />
              <div className="border-l border-gray-300 h-6 mx-1 hidden md:block"></div>
            </>
          )}
          
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
