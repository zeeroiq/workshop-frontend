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
                    'fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300',
                    isExpanded ? 'opacity-100 block' : 'opacity-0 hidden'
                )}
                onClick={onClose}
            ></div>
            <aside
                className={cn(
                    'fixed top-0 left-0 h-full bg-card border-r border-border z-50 transform transition-all duration-300 ease-in-out overflow-hidden',
                    isExpanded ? 'w-full sm:w-64' : 'w-0 md:w-20'
                )}
            >
                <div className='flex items-center justify-between p-6 border-b border-border h-20'>
                    <div className='flex items-center gap-2.5 overflow-hidden'>
                        <div className='bg-emerald-500 p-1.5 rounded-lg shadow-lg shadow-emerald-500/20 shrink-0'>
                            <Wrench className='w-5 h-5 text-emerald-950' />
                        </div>
                        {isExpanded && (
                            <div className='flex flex-col leading-none whitespace-nowrap animate-in fade-in duration-300'>
                                <span className='text-lg font-black text-foreground tracking-tight'>YourWorkshop</span>
                            </div>
                        )}
                    </div>
                    <Button variant='ghost' size='icon' className='md:hidden text-muted-foreground' onClick={onClose}>
                        <X size={20} />
                    </Button>
                </div>
                <nav className='p-3 overflow-y-auto h-[calc(100vh-80px-60px)] no-scrollbar'>
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
                                                <div className='flex items-center gap-3 overflow-hidden'>
                                                    <span className={cn('transition-colors shrink-0', manageOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500')}>
                                                        {item.icon}
                                                    </span>
                                                    {isExpanded && <span className="truncate animate-in fade-in duration-300">{item.label}</span>}
                                                </div>
                                                {isExpanded && <ChevronDown size={16} className={cn('transition-transform opacity-50 shrink-0', manageOpen && 'rotate-180')} />}
                                            </div>
                                            {
                                                manageOpen && isExpanded && (
                                                    <ul className='mt-1 space-y-1 border-l border-border ml-6 pl-4 animate-in slide-in-from-top-2 duration-200'>
                                                        {item.subItems.map(subItem => (
                                                            <li key={subItem.path}>
                                                                <Link
                                                                    to={subItem.path}
                                                                    onClick={() => window.innerWidth < 768 && onClose()}
                                                                    className={cn(
                                                                        'flex items-center gap-3 p-2.5 rounded-xl text-sm font-medium transition-all',
                                                                        location.pathname === subItem.path
                                                                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                                                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/20'
                                                                    )}
                                                                >
                                                                    <span className="shrink-0">{subItem.icon}</span>
                                                                    <span className="truncate">{subItem.label}</span>
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
                                                    onClick={() => window.innerWidth < 768 && onClose()}
                                                    className={cn(
                                                        'flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-all',
                                                        location.pathname === item.path
                                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] border border-emerald-500/20'
                                                            : 'text-muted-foreground hover:bg-accent/30 hover:text-foreground',
                                                        !isExpanded && 'justify-center'
                                                    )}
                                                >
                                                    <span className={cn('transition-colors shrink-0', location.pathname === item.path ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500')}>
                                                        {item.icon}
                                                    </span>
                                                    {isExpanded && <span className="truncate animate-in fade-in duration-300">{item.label}</span>}
                                                </Link>
                                            </TooltipTrigger>
                                            {!isExpanded && (
                                                <TooltipContent side='right' className='bg-popover border-border text-popover-foreground shadow-2xl'>
                                                    <p className="font-bold">{item.label}</p>
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
                    <div className='absolute bottom-0 left-0 w-full p-6 border-t border-border bg-card/50 backdrop-blur-md'>
                        <p className='text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 whitespace-nowrap overflow-hidden'>Workshop Mgmt v1.0</p>
                    </div>
                )}
            </aside>
        </>
    );
};

export default Sidebar;
