
import React, { useState, useEffect, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { PageSkeleton } from '@/components/ui/professional-skeleton';

const MainLayout = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setShowMobileSidebar(false);
    }
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById('sidebar-container');
      if (isMobile && showMobileSidebar && sidebar && !sidebar.contains(event.target)) {
        const isMenuButton = event.target.closest('[data-menu-button]');
        if (!isMenuButton) {
          setShowMobileSidebar(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, showMobileSidebar]);

  // Close sidebar when route changes
  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  // Professional skeleton loading component - no blue spinner
  const InlineLoader = () => (
    <div className="bg-gray-50 min-h-screen">
      <PageSkeleton isMobile={isMobile} />
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden animate-fade-in"
          onClick={toggleMobileSidebar}
        ></div>
      )}
      
      {/* Sidebar */}
      <div 
        id="sidebar-container"
        className={`fixed lg:relative lg:block z-30 h-full transition-transform duration-300 ease-in-out ${
          showMobileSidebar ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0 lg:shadow-none'
        }`}
      >
        <Sidebar onNavItemClick={closeSidebar} />
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden w-full bg-gray-50">
        <Header onMenuClick={toggleMobileSidebar} />
        <main className="flex-1 overflow-y-auto p-1 md:p-4 max-w-full relative bg-gray-50">
          <div className="container mx-auto max-w-full overflow-x-hidden px-0 bg-gray-50">
            <Suspense fallback={<InlineLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
