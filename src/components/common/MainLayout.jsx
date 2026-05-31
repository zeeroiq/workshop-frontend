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
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300 font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden">
      <Sidebar isExpanded={sidebarExpanded} onClose={onCloseSidebar} />
      
      <div className="flex flex-col flex-1 min-w-0">
        <Header onToggleSidebar={onToggleSidebar} sidebarExpanded={sidebarExpanded} />
        
        <div className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out",
          sidebarExpanded ? "md:ml-64" : "md:ml-20"
        )}>
          <main className="flex-1 p-4 sm:p-6 md:p-8 pt-6 w-full max-w-[100vw]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
