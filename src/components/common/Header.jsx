import React, { useState, useEffect } from 'react';
import { Bell, UserCircle, LogOut, Menu, Wrench, Settings } from 'lucide-react';
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

const Header = ({ onToggleSidebar, sidebarExpanded }) => {
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
        <header className="sticky top-0 z-40 flex items-center justify-between p-3 md:p-4 border-b bg-card/80 backdrop-blur-md w-full">
            <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="shrink-0">
                    <Menu size={20} />
                </Button>
                <div className="flex items-center gap-2 overflow-hidden">
                    {workshopInfo.logoUrl ? (
                        <img src={getAuthenticatedUrl(workshopInfo.logoUrl)} alt="Logo" className="h-7 w-7 md:h-8 md:w-8 object-contain rounded shrink-0" />
                    ) : (
                        <div className="bg-primary p-1 rounded hidden xs:flex shrink-0">
                            <Wrench size={14} className="text-primary-foreground md:w-4 md:h-4" />
                        </div>
                    )}
                    <span className="font-black text-sm md:text-xl tracking-tight truncate">
                        {workshopInfo.name}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1 md:gap-4 shrink-0">
                <div className="hidden xs:flex">
                    <ThemeToggle />
                </div>

                <Button variant="ghost" size="icon" className="relative hidden sm:flex">
                    <Bell size={18} className="md:w-5 md:h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
                    <span className="sr-only">Notifications</span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 md:gap-3 px-1 md:px-2 hover:bg-muted transition-colors rounded-xl h-10 md:h-12">
                            <UserCircle size={24} className="text-muted-foreground md:w-7 md:h-7" />
                            <div className="text-left hidden sm:block overflow-hidden">
                                <p className="text-xs md:text-sm font-black leading-none truncate max-w-[120px]">{user?.firstName} {user?.lastName}</p>
                                <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                    {user?.roles?.[0]?.replace('ROLE_', '') || 'Access Denied'}
                                </p>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-2xl border-border/50">
                        <DropdownMenuLabel className="font-normal p-3">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-black leading-none">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs font-medium leading-none text-muted-foreground mt-1">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="cursor-pointer lg:hidden p-3 rounded-xl focus:bg-accent/50">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-sm font-bold">Theme</span>
                                <ThemeToggle />
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-xl focus:bg-accent/50">
                            <Link to="/settings" className="flex items-center w-full">
                                <Settings className="mr-3 h-4 w-4 opacity-70" />
                                <span className="font-bold text-sm">System Settings</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 p-3 rounded-xl">
                            <LogOut className="mr-3 h-4 w-4" />
                            <span className="font-black text-sm uppercase tracking-widest">Terminate Session</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default Header;
