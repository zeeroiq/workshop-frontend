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
    LogOut
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
        if (typeof window === 'undefined') return undefined;

        const mediaQuery = window.matchMedia('(min-width: 1024px)');
        const handleMediaChange = (event) => setIsDesktop(event.matches);

        setIsDesktop(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleMediaChange);

        return () => mediaQuery.removeEventListener('change', handleMediaChange);
    }, []);

    const showLabels = isDesktop || isExpanded;

    const handleNavigate = () => {
        if (!isDesktop) {
            onClose?.();
        }
    };

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/';
    };

    const menuItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
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
            icon: <Settings2 size={20} />,
            subItems: [
                { path: '/manage/users&roles', icon: <Users size={20} />, label: 'Users & Roles' }
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
                    'fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
                    isDesktop ? 'hidden' : isExpanded ? 'block' : 'hidden'
                )}
                onClick={onClose}
            ></div>
            <aside
                className={cn(
                    'fixed left-0 top-0 z-40 h-full overflow-hidden border-r border-border bg-card transform transition-all duration-300 ease-in-out',
                    isDesktop
                        ? 'w-64 translate-x-0'
                        : isExpanded
                            ? 'w-72 translate-x-0'
                            : 'w-72 -translate-x-full'
                )}
            >
                <div className='flex h-20 items-center justify-between border-b border-border p-6'>
                    <div className='flex min-w-0 items-center gap-2.5'>
                        <div className='bg-emerald-500 p-1.5 rounded-lg shadow-lg shadow-emerald-500/20'>
                            <Wrench className='w-5 h-5 text-emerald-950' />
                        </div>
                        {showLabels && (
                            <div className='flex flex-col leading-none'>
                                <span className='text-lg font-black text-foreground tracking-tight'>YourWorkshop</span>
                            </div>
                        )}
                    </div>
                    {!isDesktop && (
                        <Button variant='ghost' size='icon' className='text-muted-foreground lg:hidden' onClick={onClose} aria-label="Close navigation menu">
                            <X size={20} />
                        </Button>
                    )}
                </div>
                <nav className='h-[calc(100dvh-10rem)] overflow-y-auto p-3'>
                    <TooltipProvider>
                        <ul className='space-y-1.5'>
                            {menuItems.map(item => (
                                <li key={item.label}>
                                    {item.subItems ? (
                                        <>
                                            <div
                                                className={cn(
                                                    'flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all cursor-pointer',
                                                    manageOpen ? 'bg-accent/50 text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground hover:bg-accent/30 hover:text-foreground'
                                                )}
                                                onClick={handleManageClick}
                                            >
                                                <div className='flex items-center gap-3'>
                                                    <span className={cn('transition-colors', manageOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500')}>
                                                        {item.icon}
                                                    </span>
                                                    {showLabels && <span>{item.label}</span>}
                                                </div>
                                                {showLabels && <ChevronDown size={16} className={cn('transition-transform opacity-50', manageOpen && 'rotate-180')} />}
                                            </div>
                                            {
                                                manageOpen && showLabels && (
                                                    <ul className='mt-1 space-y-1 border-l border-border ml-6 pl-4'>
                                                        {item.subItems.map(subItem => (
                                                            <li key={subItem.path}>
                                                                <Link
                                                                    to={subItem.path}
                                                                    className={cn(
                                                                        'flex items-center gap-3 p-2.5 rounded-xl text-sm font-medium transition-all',
                                                                        location.pathname === subItem.path
                                                                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                                                                : 'text-muted-foreground hover:text-foreground hover:bg-accent/20'
                                                                    )}
                                                                    onClick={handleNavigate}
                                                                    >
                                                                        {subItem.icon}
                                                                        <span>{subItem.label}</span>
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )
                                            }
                                        </>
                                    ) : (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Link
                                                    to={item.path}
                                                    className={cn(
                                                        'flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-all',
                                                        location.pathname === item.path
                                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] border border-emerald-500/20'
                                                            : 'text-muted-foreground hover:bg-accent/30 hover:text-foreground',
                                                        !showLabels && 'justify-center'
                                                    )}
                                                    onClick={handleNavigate}
                                                >
                                                    <span className={cn('transition-colors', location.pathname === item.path ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500')}>
                                                        {item.icon}
                                                    </span>
                                                    {showLabels && <span>{item.label}</span>}
                                                </Link>
                                            </TooltipTrigger>
                                            {!showLabels && (
                                                <TooltipContent side='right' className='bg-popover border-border text-popover-foreground'>
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
                <div className='absolute bottom-0 left-0 w-full border-t border-border bg-card/50 p-4 backdrop-blur-md'>
                    {showLabels ? (
                        <>
                        <p className='text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60'>Workshop Management v1.0</p>
                        <Button variant="ghost" className="mt-3 w-full justify-start text-destructive hover:text-destructive" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                        </>
                    ) : (
                        <Button variant="ghost" size="icon" className="mx-auto text-destructive hover:text-destructive" onClick={handleLogout} aria-label="Logout">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
