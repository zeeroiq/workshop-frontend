import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Car,
    Wrench,
    Boxes,
    FileText,
    ChartBar,
    Calendar,
    Settings,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Sidebar = ({ isExpanded, onClose }) => {
    const location = useLocation();

    const menuItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/customers', icon: <Users size={20} />, label: 'Customers' },
        { path: '/vehicles', icon: <Car size={20} />, label: 'Vehicles' },
        { path: '/jobs', icon: <Wrench size={20} />, label: 'Jobs' },
        { path: '/calendar', icon: <Calendar size={20} />, label: 'Calendar' },
        { path: '/inventory', icon: <Boxes size={20} />, label: 'Inventory' },
        { path: '/invoices', icon: <FileText size={20} />, label: 'Invoices' },
        { path: '/reports', icon: <ChartBar size={20} />, label: 'Reports' },
        { path: '/settings', icon: <Settings size={20} />, label: 'Settings' }
    ];

    return (
        <>
            <div
                className={cn(
                    'fixed inset-0 bg-black/50 z-30 md:hidden',
                    isExpanded ? 'block' : 'hidden'
                )}
                onClick={onClose}
            ></div>
            <aside
                className={cn(
                    'fixed top-0 left-0 h-full bg-card border-r z-40 transform transition-all duration-300 ease-in-out',
                    isExpanded ? 'w-64' : 'w-20',
                )}
            >
                <div className="flex items-center justify-between p-4 border-b h-16">
                    {isExpanded && <h2 className="text-lg font-semibold"></h2>}
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
                        <X size={20} />
                    </Button>
                </div>
                <nav className="p-2">
                    <TooltipProvider>
                        <ul>
                            {menuItems.map(item => (
                                <li key={item.path}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Link
                                                to={item.path}
                                                className={cn(
                                                    'flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-colors',
                                                    location.pathname === item.path
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'hover:bg-muted',
                                                    !isExpanded && 'justify-center'
                                                )}
                                                // Removed onClick={onClose} to prevent sidebar from closing on item click
                                            >
                                                {item.icon}
                                                {isExpanded && <span>{item.label}</span>}
                                            </Link>
                                        </TooltipTrigger>
                                        {!isExpanded && (
                                            <TooltipContent side="right">
                                                <p>{item.label}</p>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </li>
                            ))}
                        </ul>
                    </TooltipProvider>
                </nav>
                {isExpanded && (
                    <div className="absolute bottom-0 left-0 w-full p-4 border-t">
                        <p className="text-sm text-muted-foreground">Workshop Management v1.0</p>
                    </div>
                )}
            </aside>
        </>
    );
};

export default Sidebar;
