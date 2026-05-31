import React, { useState } from 'react';
import { authService } from '@/services/authService';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, useLocation } from 'react-router-dom';
import { Chrome, Key, Mail, ArrowRight } from 'lucide-react';
import { cn } from "@/lib/utils";

const LoginForm = ({ onSuccess, onRedirect }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authService.login(formData.username, formData.password);

            if (response?.data?.success) {
                const { token, ...user } = response.data.data;

                authService.setToken(token);
                authService.setUser(user);

                toast.success('Synchronization established.');
                if (onSuccess) onSuccess();
                window.location.href = '/dashboard';
            } else {
                toast.error(response.data.message || 'Authentication failure.');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                'Node rejected credentials.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleOnboardRedirect = (e) => {
        e.preventDefault();
        if (onRedirect) onRedirect();
        
        if (location.pathname === '/') {
            const element = document.getElementById('onboard');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                window.location.hash = 'onboard';
            }
        } else {
            navigate('/#onboard');
            setTimeout(() => {
                const element = document.getElementById('onboard');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    return (
        <div className="space-y-8 w-full max-w-sm mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70 ml-1">Digital Identity (UID)</Label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-30 group-focus-within:text-primary group-focus-within:opacity-100 transition-all" />
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="analyst@staff.node"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground/30 focus:ring-primary/20 h-14 pl-12 rounded-2xl font-bold transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <Label htmlFor="password" name="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">Security Key</Label>
                            <a href="#" className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">Recover Key</a>
                        </div>
                        <div className="relative group">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-30 group-focus-within:text-primary group-focus-within:opacity-100 transition-all" />
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground/30 focus:ring-primary/20 h-14 pl-12 rounded-2xl font-bold transition-all"
                            />
                        </div>
                    </div>
                </div>

                <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black h-16 text-sm rounded-2xl shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] uppercase tracking-[0.3em]" 
                    disabled={loading}
                >
                    {loading ? (
                        <div className="flex items-center gap-3">
                            <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            Establishing Link...
                        </div>
                    ) : (
                        <span className="flex items-center gap-2">Connect Node <ArrowRight className="h-4 w-4" /></span>
                    )}
                </Button>
            </form>

            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50"></span>
                </div>
                <div className="relative flex justify-center text-[8px] uppercase tracking-[0.4em] font-black">
                    <span className="bg-card px-4 text-muted-foreground opacity-40">External Protocol</span>
                </div>
            </div>

            <div className="flex justify-center">
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-14 w-14 rounded-2xl border-border/50 bg-background/50 hover:bg-accent transition-all hover:scale-110 active:scale-95 shadow-lg group"
                    onClick={handleOnboardRedirect}
                >
                    <Chrome className="h-6 w-6 opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all" />
                </Button>
            </div>

            <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                Unauthorized Analyst? <button onClick={handleOnboardRedirect} className="text-primary font-black hover:underline underline-offset-4 decoration-2 transition-all bg-transparent border-none p-0">Initialize Deployment</button>
            </p>
        </div>
    );
};

export default LoginForm;
