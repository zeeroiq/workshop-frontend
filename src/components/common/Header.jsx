import React, { useState, useEffect } from 'react';
import { Bell, UserCircle, LogOut, Menu, Wrench, Settings, Search } from 'lucide-react';
import { authService } from '@/services/authService';
import { workshopService } from '@/services/workshopService';
import { getAuthenticatedUrl } from "@/utils/storage";
import { useNavigate, Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = ({ onToggleSidebar }) => {
    const navigate = useNavigate();
    const user = authService.getUser();
    const [workshopInfo, setWorkshopInfo] = useState({
        name: user?.workshopName || 'Vishwakarma',
        logoUrl: null
    });

    useEffect(() => {
        const fetchWorkshopInfo = async () => {
            try {
                const data = await workshopService.getSettings();
                setWorkshopInfo({
                    name: data.name,
                    logoUrl: data.logoUrl
                });
            } catch (error) {
                console.error('Failed to fetch workshop info:', error);
            }
        };

        if (authService.isAuthenticated()) {
            fetchWorkshopInfo();
        }

        const handleSettingsUpdate = (event) => {
            if (event.detail) {
                setWorkshopInfo({
                    name: event.detail.name,
                    logoUrl: event.detail.logoUrl
                });
            }
        };

        window.addEventListener('workshop-settings-updated', handleSettingsUpdate);
        return () => window.removeEventListener('workshop-settings-updated', handleSettingsUpdate);
    }, [user?.workshopName]);

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/';
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-md lg:px-8">
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden hover:bg-emerald-500/10 hover:text-emerald-500" 
                    onClick={onToggleSidebar}
                    aria-label="Toggle Menu"
                >
                    <Menu size={20} />
                </Button>
                
                <div className="flex items-center gap-2 lg:hidden">
                    {workshopInfo.logoUrl ? (
                        <img 
                            src={getAuthenticatedUrl(workshopInfo.logoUrl)} 
                            alt="Logo" 
                            className="h-7 w-7 object-contain rounded shadow-sm" 
                        />
                    ) : (
                        <div className="rounded bg-emerald-500 p-1 shadow-lg shadow-emerald-500/20">
                            <Wrench size={14} className="text-emerald-950" />
                        </div>
                    )}
                    <span className="text-sm font-bold tracking-tight truncate max-w-[120px]">
                        {workshopInfo.name}
                    </span>
                </div>

                {/* Desktop Search Placeholder or Breadcrumbs could go here */}
                <div className="hidden lg:flex items-center gap-2 text-muted-foreground">
                    <span className="text-xs font-medium uppercase tracking-[0.2em]">Operational Console</span>
                </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
                <div className="hidden sm:flex">
                    <ThemeToggle />
                </div>

                <Button variant="ghost" size="icon" className="relative hover:bg-emerald-500/10 group" aria-label="Notifications">
                    <Bell size={20} className="group-hover:text-emerald-500 transition-colors" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-3 px-1 lg:px-2 hover:bg-emerald-500/5 transition-all duration-300 rounded-full lg:rounded-lg">
                            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                                <UserCircle size={20} className="text-emerald-500" />
                            </div>
                            <div className="text-left hidden lg:block">
                                <p className="text-xs font-bold leading-none">{user?.firstName} {user?.lastName}</p>
                                <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">
                                    {user?.roles?.[0]?.replace('ROLE_', '') || 'User'}
                                </p>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 mt-2 border-border/50 bg-card/95 backdrop-blur-md">
                        <DropdownMenuLabel className="font-normal p-4">
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold leading-none">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-xs leading-none text-muted-foreground mt-1">{user?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border/50" />
                        <DropdownMenuItem asChild className="cursor-pointer py-3 focus:bg-emerald-500/10 focus:text-emerald-500">
                            <Link to="/settings" className="flex items-center w-full">
                                <Settings className="mr-3 h-4 w-4" />
                                <span className="font-medium">Workshop Settings</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/50" />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-3 text-destructive focus:bg-destructive/10 focus:text-destructive">
                            <LogOut className="mr-3 h-4 w-4" />
                            <span className="font-medium">Logout Session</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default Header;
