import React, { useState, useEffect } from 'react';
import { Bell, UserCircle, LogOut, Menu, Wrench, Settings, Shield, User } from 'lucide-react';
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
import { cn } from "@/lib/utils";

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
        <header className="sticky top-0 z-[90] flex items-center justify-between p-4 md:p-5 border-b border-border/50 bg-card/80 backdrop-blur-xl w-full">
            {/* Left Node: Brand & Toggle */}
            <div className="flex items-center gap-3 md:gap-5 overflow-hidden">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onToggleSidebar} 
                    className="shrink-0 h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-colors active:scale-90"
                >
                    <Menu size={22} />
                </Button>
                <div className="flex items-center gap-3 overflow-hidden">
                    {workshopInfo.logoUrl ? (
                        <div className="h-9 w-9 rounded-xl bg-background border border-border/50 p-1 flex items-center justify-center shadow-inner shrink-0">
                            <img src={getAuthenticatedUrl(workshopInfo.logoUrl)} alt="Logo" className="max-h-full max-w-full object-contain" />
                        </div>
                    ) : (
                        <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 shrink-0 hidden xs:flex">
                            <Wrench size={16} className="text-primary-foreground" />
                        </div>
                    )}
                    <div className="flex flex-col overflow-hidden">
                        <span className="font-black text-sm md:text-xl tracking-tight truncate text-foreground leading-tight">
                            {workshopInfo.name}
                        </span>
                        <span className="hidden sm:block text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">Operational Intelligence</span>
                    </div>
                </div>
            </div>

            {/* Right Node: System Controls */}
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
                <div className="hidden sm:flex items-center gap-2">
                    <ThemeToggle />
                </div>

                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-accent group">
                    <Bell size={20} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-background animate-pulse" />
                    <span className="sr-only">System Notifications</span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-3 px-1.5 md:px-3 hover:bg-muted/50 transition-all rounded-2xl h-11 md:h-12 border border-transparent hover:border-border/50 shadow-sm active:scale-95">
                            <div className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                                <UserCircle size={22} />
                            </div>
                            <div className="text-left hidden lg:block overflow-hidden max-w-[150px]">
                                <p className="text-xs font-black leading-none truncate text-foreground">{user?.firstName} {user?.lastName}</p>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-70">
                                    {user?.roles?.[0]?.replace('ROLE_', '') || 'Analyst'}
                                </p>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72 p-2 rounded-[1.5rem] shadow-2xl border-border/50 bg-card/95 backdrop-blur-2xl animate-in zoom-in-95 duration-200">
                        <DropdownMenuLabel className="font-normal p-4">
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black leading-none text-foreground">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-[10px] font-medium leading-none text-muted-foreground mt-1 truncate">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 pt-2">
                                    <Shield size={10} className="text-emerald-500" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500/80">Authorized Node Access</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border/50" />
                        
                        <div className="p-1 space-y-1">
                            <DropdownMenuItem asChild className="cursor-pointer sm:hidden p-3 rounded-xl focus:bg-accent transition-colors">
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-xs font-black uppercase tracking-widest">Interface Theme</span>
                                    <ThemeToggle />
                                </div>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-xl focus:bg-primary/10 focus:text-primary transition-all group">
                                <Link to="/settings" className="flex items-center w-full">
                                    <Settings className="mr-3 h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:rotate-45 transition-all" />
                                    <span className="font-black text-xs uppercase tracking-widest">System Configuration</span>
                                </Link>
                            </DropdownMenuItem>
                        </div>
                        
                        <DropdownMenuSeparator className="bg-border/50" />
                        
                        <div className="p-1">
                            <DropdownMenuItem 
                                onClick={handleLogout} 
                                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 p-4 rounded-xl transition-all"
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className="font-black text-xs uppercase tracking-widest">Terminate Session</span>
                                    <LogOut className="h-4 w-4" />
                                </div>
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default Header;
