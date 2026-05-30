import React, { useState } from 'react';
import { authService } from '@/services/authService';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, useLocation } from 'react-router-dom';
import { Chrome } from 'lucide-react';

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

                toast.success('Login successful!');
                if (onSuccess) onSuccess();
                window.location.href = '/dashboard';
            } else {
                toast.error(response.data.message || 'Login failed');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                'Login failed';
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
            // Small timeout to allow navigation then scroll if the hash effect isn't enough
            setTimeout(() => {
                const element = document.getElementById('onboard');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="username" className="text-white font-semibold">Username (Email)</Label>
                    <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="admin"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        className="bg-[#1e293b] border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-white focus:border-transparent transition-all h-12"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" name="password" className="text-white font-semibold">Password</Label>
                        <a href="#" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Forgot Password?</a>
                    </div>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="bg-[#111827] border-slate-700 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-white focus:border-transparent transition-all h-12"
                    />
                </div>

                <Button 
                    type="submit" 
                    className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold h-12 text-lg rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] hover:scale-[1.01]" 
                    disabled={loading}
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Processing...
                        </div>
                    ) : 'Login'}
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-800"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#111827] px-2 text-slate-500 font-bold">Or continue with</span>
                </div>
            </div>

            <div className="flex justify-center">
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-12 w-12 rounded-full border-slate-700 bg-[#1e293b] hover:bg-slate-700 text-white transition-all hover:scale-110 active:scale-95"
                    onClick={handleOnboardRedirect}
                >
                    <Chrome className="h-5 w-5" />
                </Button>
            </div>

            <p className="text-center text-sm font-medium text-slate-400">
                New User? <button onClick={handleOnboardRedirect} className="text-indigo-400 font-bold hover:text-indigo-300 underline-offset-4 hover:underline transition-all bg-transparent border-none p-0">Sign Up</button>
            </p>
        </div>
    );
};

export default LoginForm;
