import React, { useEffect, useState } from 'react';
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
    LogOut,
    Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { authService } from '@/services/authService';

const Sidebar = ({ isExpanded, onClose }) => {
    const location = useLocation();
    const [manageOpen, setManageOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(() => {
        if (typeof window === 'undefined') return true;
        return window.matchMedia('(min-width: 1024px)').matches;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 1024px)');
        const handleMediaChange = (event) => setIsDesktop(event.matches);
        mediaQuery.addEventListener('change', handleMediaChange);
        return () => mediaQuery.removeEventListener('change', handleMediaChange);
    }, []);

    const showLabels = isDesktop || isExpanded;

    const handleNavigate = () => {
        if (!isDesktop) onClose?.();
    };

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/';
    };

    const menuItems = [
        { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/customers', icon: <Users size={20} />, label: 'Customers' },
        { path: '/vehicles', icon: <Car size={20} />, label: 'Vehicles' },
        { path: '/jobs', icon: <Wrench size={20} />, label: 'Jobs' },
        { path: '/calendar', icon: <Calendar size={20} />, label: 'Calendar' },
        { path: '/inventory', icon: <Boxes size={20} />, label: 'Inventory' },
        { path: '/invoices', icon: <FileText size={20} />, label: 'Invoices' },
        { path: '/reports', icon: <ChartBar size={20} />, label: 'Reports' },
        { path: '/settings', icon: <Settings2 size={20} />, label: 'Settings' },
        {
            label: 'Manage',
            icon: <Shield size={20} />,
            subItems: [
                { path: '/manage/users&roles', icon: <Users size={18} />, label: 'Users & Roles' }
            ]
        }
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={cn(
                    'fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-all duration-500 lg:hidden',
                    !isDesktop && isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                onClick={onClose}
            ></div>

            {/* Sidebar Container */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-50 h-full border-r border-border/50 bg-card transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none',
                    isDesktop
                        ? 'w-64 translate-x-0'
                        : isExpanded
                            ? 'w-[280px] translate-x-0'
                            : 'w-[280px] -translate-x-full'
                )}
            >
                <div className='flex h-16 items-center justify-between border-b border-border/50 px-6'>
                    <div className='flex items-center gap-3'>
                        <div className="bg-emerald-500 p-1.5 rounded-lg shadow-lg shadow-emerald-500/20">
                            <Wrench className="w-4 h-4 text-emerald-950" />
                        </div>
                        {showLabels && (
                            <span className="text-lg font-black text-foreground tracking-tight">YourWorkshop</span>
                        )}
                    </div>
                    {!isDesktop && (
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-emerald-500/10 hover:text-emerald-500">
                            <X size={20} />
                        </Button>
                    )}
                </div>

                <nav className='h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden py-4 px-3 custom-scrollbar'>
                    <TooltipProvider>
                        <ul className='space-y-1'>
                            {menuItems.map(item => (
                                <li key={item.label}>
                                    {item.subItems ? (
                                        <div className="space-y-1">
                                            <button
                                                className={cn(
                                                    'flex w-full items-center justify-between p-3 rounded-xl text-sm font-bold transition-all',
                                                    manageOpen ? 'bg-emerald-500/5 text-emerald-500' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                                )}
                                                onClick={() => setManageOpen(!manageOpen)}
                                            >
                                                <div className='flex items-center gap-3'>
                                                    {item.icon}
                                                    {showLabels && <span>{item.label}</span>}
                                                </div>
                                                {showLabels && <ChevronDown size={14} className={cn('transition-transform duration-300', manageOpen && 'rotate-180')} />}
                                            </button>
                                            {manageOpen && showLabels && (
                                                <ul className='space-y-1 ml-4 pl-4 border-l border-border/50'>
                                                    {item.subItems.map(subItem => (
                                                        <li key={subItem.path}>
                                                            <Link
                                                                to={subItem.path}
                                                                className={cn(
                                                                    'flex items-center gap-3 p-2.5 rounded-lg text-xs font-bold transition-all',
                                                                    location.pathname === subItem.path
                                                                        ? 'text-emerald-500 bg-emerald-500/10'
                                                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                                                )}
                                                                onClick={handleNavigate}
                                                            >
                                                                {subItem.icon}
                                                                <span>{subItem.label}</span>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ) : (
                                        <Tooltip delayDuration={0}>
                                            <TooltipTrigger asChild>
                                                <Link
                                                    to={item.path}
                                                    className={cn(
                                                        'flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all duration-200',
                                                        location.pathname === item.path
                                                            ? 'bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-500/20'
                                                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                                                        !showLabels && 'justify-center'
                                                    )}
                                                    onClick={handleNavigate}
                                                >
                                                    <span className="shrink-0">{item.icon}</span>
                                                    {showLabels && <span>{item.label}</span>}
                                                </Link>
                                            </TooltipTrigger>
                                            {!showLabels && (
                                                <TooltipContent side='right' className='bg-emerald-500 text-emerald-950 font-bold border-none'>
                                                    {item.label}
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </TooltipProvider>

                    <div className='mt-8 pt-4 border-t border-border/50 px-2'>
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive font-bold text-xs gap-3 p-3 rounded-xl transition-all" 
                            onClick={handleLogout}
                        >
                            <LogOut size={18} />
                            {showLabels && <span>Logout Session</span>}
                        </Button>
                    </div>
                </nav>

                <div className='absolute bottom-0 left-0 w-full p-6'>
                    {showLabels && (
                        <div className="rounded-2xl bg-muted/30 p-4 border border-border/50">
                            <p className='text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-tight'>
                                Operational Platform<br/>
                                <span className="text-emerald-500/50">v1.0.42 stable</span>
                            </p>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
