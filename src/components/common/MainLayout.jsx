import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '@/lib/utils';

const MainLayout = ({ 
  children, 
  sidebarExpanded, 
  onToggleSidebar, 
  onCloseSidebar 
}) => {
  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300 font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden relative">
      {/* Navigation Overlay (Sidebar) */}
      <Sidebar isExpanded={sidebarExpanded} onClose={onCloseSidebar} />
      
      <div className="flex flex-col flex-1 min-w-0 w-full relative">
        {/* Persistent Sticky Top Header Node */}
        <Header onToggleSidebar={onToggleSidebar} sidebarExpanded={sidebarExpanded} />
        
        <div className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out w-full",
          sidebarExpanded ? "md:pl-64" : "md:pl-20"
        )}>
          {/* Main Intelligent Content Area */}
          <main className="flex-1 w-full max-w-screen-2xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10 pt-6">
            <div className="animate-in fade-in duration-500">
                {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
