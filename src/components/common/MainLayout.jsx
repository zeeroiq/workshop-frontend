import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ 
  children, 
  sidebarExpanded, 
  onToggleSidebar, 
  onCloseSidebar 
}) => {
  return (
    <div className="flex min-h-screen overflow-x-hidden bg-background text-foreground transition-colors duration-300 font-['Plus_Jakarta_Sans',sans-serif]">
      <Sidebar isExpanded={sidebarExpanded} onClose={onCloseSidebar} />
      
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <Header onToggleSidebar={onToggleSidebar} />
        <main className="min-w-0 flex-1 p-4 pt-6 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
