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
        <header className="sticky top-0 z-40 flex items-center justify-between p-3 md:p-4 border-b bg-card/80 backdrop-blur-md">
            <div className="flex items-center gap-2 md:gap-4">
                <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="flex">
                    <Menu size={20} />
                </Button>
                <div className="flex items-center gap-2 overflow-hidden">
                    {workshopInfo.logoUrl ? (
                        <img src={getAuthenticatedUrl(workshopInfo.logoUrl)} alt="Logo" className="h-7 w-7 md:h-8 md:w-8 object-contain rounded" />
                    ) : (
                        <div className="bg-primary p-1 rounded hidden xs:flex">
                            <Wrench size={14} className="text-primary-foreground md:w-4 md:h-4" />
                        </div>
                    )}
                    <span className="font-bold text-sm md:text-lg tracking-tight truncate max-w-[120px] sm:max-w-none">
                        {workshopInfo.name}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1 md:gap-4">
                <div className="hidden xs:flex">
                    <ThemeToggle />
                </div>

                <Button variant="ghost" size="icon" className="relative hidden xs:flex">
                    <Bell size={18} className="md:w-5 md:h-5" />
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 md:w-2 md:h-2 bg-destructive rounded-full" />
                    <span className="sr-only">Notifications</span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 md:gap-3 px-1 md:px-2 hover:bg-muted transition-colors">
                            <UserCircle size={20} className="text-muted-foreground md:w-6 md:h-6" />
                            <div className="text-left hidden sm:block">
                                <p className="text-xs md:text-sm font-semibold leading-none">{user?.firstName} {user?.lastName}</p>
                                <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                                    {user?.roles?.[0]?.replace('ROLE_', '') || 'User'}
                                </p>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="cursor-pointer lg:hidden">
                            <div className="flex items-center justify-between w-full px-2 py-1.5">
                                <span className="text-sm">Theme</span>
                                <ThemeToggle />
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link to="/settings" className="flex items-center w-full">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default Header;
