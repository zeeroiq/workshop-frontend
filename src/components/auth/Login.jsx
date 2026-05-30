import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from './LoginForm';

const Login = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0a0f1c] p-4 relative overflow-hidden">
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="/login.png" 
                    alt="Workshop Background" 
                    className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0f1c] via-[#0a0f1c]/80 to-transparent"></div>
            </div>

            {/* Background Accent Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] z-0" />
            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px] z-0" />

            <Card className="w-full max-w-md bg-[#111827]/90 border-slate-800 shadow-2xl rounded-2xl relative z-10 backdrop-blur-xl">
                <CardHeader className="space-y-2 pt-8 pb-4">
                    <CardTitle className="text-3xl font-black text-center text-white tracking-tight">Login to Your Workshop</CardTitle>
                    <CardDescription className="text-center text-slate-400 font-medium">
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-10">
                    <LoginForm />
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
