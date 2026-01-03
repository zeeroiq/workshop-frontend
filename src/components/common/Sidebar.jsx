import React, { useState } from 'react';
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
    Settings2,
    X,
    ChevronDown,
    Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Sidebar = ({ isExpanded, onClose }) => {
    const location = useLocation();
    const [manageOpen, setManageOpen] = useState(false);

    const menuItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/customers', icon: <Users size={20} />, label: 'Customers' },
        { path: '/vehicles', icon: <Car size={20} />, label: 'Vehicles' },
        { path: '/jobs', icon: <Wrench size={20} />, label: 'Jobs' },
        { path: '/calendar', icon: <Calendar size={20} />, label: 'Calendar' },
        { path: '/inventory', icon: <Boxes size={20} />, label: 'Inventory' },
        { path: '/invoices', icon: <FileText size={20} />, label: 'Invoices' },
        { path: '/reports', icon: <ChartBar size={20} />, label: 'Reports' },
        {
            label: 'Manage',
            icon: <Settings2 size={20} />,
            subItems: [
                { path: '/manage/users', icon: <Users size={20} />, label: 'Users' },
                { path: '/manage/roles', icon: <Shield size={20} />, label: 'Roles' }
            ]
        }
    ];

    const handleManageClick = () => {
        setManageOpen(!manageOpen);
    };

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
                    'fixed top-0 left-0 h-full bg-card border-r z-40 transform transition-all duration-300 ease-in-out overflow-hidden',
                    isExpanded ? 'w-64' : 'w-0 md:w-20'
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
                                <li key={item.label}>
                                    {item.subItems ? (
                                        <>
                                            <div
                                                className={cn(
                                                    'flex items-center justify-between p-3 rounded-md text-sm font-medium transition-colors cursor-pointer',
                                                    'hover:bg-muted'
                                                )}
                                                onClick={handleManageClick}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {item.icon}
                                                    {isExpanded && <span>{item.label}</span>}
                                                </div>
                                                {isExpanded && <ChevronDown size={16} className={cn('transition-transform', manageOpen && 'rotate-180')} />}
                                            </div>
                                            {manageOpen && isExpanded && (
                                                <ul className="pl-8">
                                                    {item.subItems.map(subItem => (
                                                        <li key={subItem.path}>
                                                            <Link
                                                                to={subItem.path}
                                                                className={cn(
                                                                    'flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-colors',
                                                                    location.pathname === subItem.path
                                                                        ? 'bg-primary text-primary-foreground'
                                                                        : 'hover:bg-muted'
                                                                )}
                                                            >
                                                                {subItem.icon}
                                                                <span>{subItem.label}</span>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </>
                                    ) : (
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
                                    )}
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
