import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from './LoginForm';
import { cn } from "@/lib/utils";

const Login = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4 sm:p-6 lg:p-10 relative overflow-hidden">
            {/* Immersive Background Nodes */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <img 
                    src="/login.png" 
                    alt="Strategic Node" 
                    className="w-full h-full object-cover opacity-20 grayscale brightness-50"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/80 to-transparent"></div>
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-primary/5 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <Card className="w-full max-w-lg bg-card/60 backdrop-blur-3xl border-border/50 shadow-2xl rounded-[2.5rem] relative z-10 overflow-hidden">
                <CardHeader className="space-y-4 pt-10 sm:pt-16 pb-6 text-center">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 transform -rotate-12 mb-4">
                        <span className="text-3xl font-black text-primary-foreground">V</span>
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-3xl sm:text-4xl font-black text-foreground tracking-tighter uppercase leading-none">Initialize <br />Session</CardTitle>
                        <CardDescription className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] opacity-60">
                            Authorized Analyst Entry Point
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="pb-12 px-8 sm:px-12">
                    <LoginForm />
                </CardContent>
                <div className="bg-muted/30 p-4 border-t border-border/30 text-center">
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-30">Encrypted AES-256 Link &middot; Node-01-Primary</p>
                </div>
            </Card>
        </div>
    );
};

export default Login;
