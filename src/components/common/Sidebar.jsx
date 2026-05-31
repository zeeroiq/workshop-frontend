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
    Shield,
    ChevronRight
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
            {/* Backdrop for mobile - absolute full-screen dim */}
            <div
                className={cn(
                    'fixed inset-0 bg-black/80 backdrop-blur-md z-[100] md:hidden transition-all duration-300',
                    isExpanded ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                )}
                onClick={onClose}
            ></div>

            {/* Main Sidebar Node */}
            <aside
                className={cn(
                    'fixed top-0 left-0 h-full bg-card border-r border-border z-[110] transform transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) overflow-hidden shadow-2xl md:shadow-none',
                    isExpanded ? 'w-[85vw] sm:w-64 translate-x-0' : 'w-0 md:w-20 -translate-x-full md:translate-x-0'
                )}
            >
                {/* Branding Section */}
                <div className='flex items-center justify-between p-6 border-b border-border/50 h-20 bg-muted/10'>
                    <div className='flex items-center gap-3 overflow-hidden'>
                        <div className='bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 shrink-0 transform hover:rotate-12 transition-transform cursor-pointer'>
                            <Wrench className='w-5 h-5 text-primary-foreground' />
                        </div>
                        {isExpanded && (
                            <div className='flex flex-col leading-none whitespace-nowrap animate-in slide-in-from-left-4 duration-500'>
                                <span className='text-lg font-black text-foreground tracking-tight'>Vishwakarma</span>
                                <span className='text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60'>Workshop OS</span>
                            </div>
                        )}
                    </div>
                    {isExpanded && (
                        <Button variant='ghost' size='icon' className='md:hidden text-muted-foreground hover:bg-accent rounded-full' onClick={onClose}>
                            <X size={20} />
                        </Button>
                    )}
                </div>
                
                {/* Navigation Links */}
                <nav className='p-3 overflow-y-auto h-[calc(100vh-80px-60px)] no-scrollbar'>
                    <TooltipProvider>
                        <ul className='space-y-1.5'>
                            {menuItems.map(item => (
                                <li key={item.label}>
                                    {item.subItems ? (
                                        <>
                                            <div
                                                className={cn(
                                                    'flex items-center justify-between p-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all cursor-pointer group',
                                                    manageOpen ? 'bg-primary/10 text-primary border border-primary/20 shadow-inner' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                                                )}
                                                onClick={handleManageClick}
                                            >
                                                <div className='flex items-center gap-4 overflow-hidden'>
                                                    <span className={cn('transition-colors shrink-0 p-1 rounded-lg', manageOpen ? 'bg-primary text-primary-foreground' : 'bg-muted text-slate-500 group-hover:text-foreground')}>
                                                        {item.icon}
                                                    </span>
                                                    {isExpanded && <span className="truncate animate-in fade-in duration-500">{item.label}</span>}
                                                </div>
                                                {isExpanded && <ChevronRight size={14} className={cn('transition-transform opacity-50 shrink-0', manageOpen && 'rotate-90')} />}
                                            </div>
                                            {
                                                manageOpen && isExpanded && (
                                                    <ul className='mt-2 space-y-1 border-l-2 border-primary/20 ml-6 pl-4 animate-in slide-in-from-top-4 duration-300'>
                                                        {item.subItems.map(subItem => (
                                                            <li key={subItem.path}>
                                                                <Link
                                                                    to={subItem.path}
                                                                    onClick={() => window.innerWidth < 768 && onClose()}
                                                                    className={cn(
                                                                        'flex items-center gap-4 p-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all group',
                                                                        location.pathname === subItem.path
                                                                            ? 'text-primary bg-primary/10 border border-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.1)]'
                                                                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
                                                                    )}
                                                                >
                                                                    <span className={cn("shrink-0 transition-transform group-hover:scale-110", location.pathname === subItem.path ? "text-primary" : "opacity-50")}>{subItem.icon}</span>
                                                                    <span className="truncate">{subItem.label}</span>
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )
                                            }
                                        </>
                                    ) : (
                                        <Tooltip delayDuration={0}>
                                            <TooltipTrigger asChild>
                                                <Link
                                                    to={item.path}
                                                    onClick={() => window.innerWidth < 768 && onClose()}
                                                    className={cn(
                                                        'flex items-center gap-4 p-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all group',
                                                        location.pathname === item.path
                                                            ? 'bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary),0.15)] border border-primary/20'
                                                            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                                                        !isExpanded && 'justify-center px-0'
                                                    )}
                                                >
                                                    <span className={cn('transition-all shrink-0 p-1 rounded-lg group-active:scale-90', 
                                                        location.pathname === item.path ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted text-slate-500 group-hover:text-foreground')}>
                                                        {item.icon}
                                                    </span>
                                                    {isExpanded && <span className="truncate animate-in slide-in-from-left-2 duration-300">{item.label}</span>}
                                                </Link>
                                            </TooltipTrigger>
                                            {!isExpanded && (
                                                <TooltipContent side='right' className='bg-card border-border/50 text-foreground shadow-2xl font-black uppercase tracking-widest text-[10px] p-2 px-3 rounded-lg'>
                                                    {item.label}
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </TooltipProvider>
                </nav>

                {/* System Footnote */}
                {isExpanded && (
                    <div className='absolute bottom-0 left-0 w-full p-6 border-t border-border/30 bg-card/80 backdrop-blur-md'>
                        <div className='flex flex-col gap-1'>
                            <p className='text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 whitespace-nowrap overflow-hidden'>Systems Logic v1.2</p>
                            <div className='flex items-center gap-1.5'>
                                <div className='w-1 h-1 rounded-full bg-emerald-500 animate-pulse' />
                                <span className='text-[8px] font-bold text-emerald-500/60 uppercase tracking-tighter'>Node Operational</span>
                            </div>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
};

export default Sidebar;
