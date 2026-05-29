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
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      <Sidebar isExpanded={sidebarExpanded} onClose={onCloseSidebar} />
      
      <div className="flex flex-col flex-1">
        <Header onToggleSidebar={onToggleSidebar} />
        
        <div className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out",
          sidebarExpanded ? "ml-0 md:ml-64" : "ml-0 md:ml-20"
        )}>
          <main className="flex-1 p-4 md:p-6 pt-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
