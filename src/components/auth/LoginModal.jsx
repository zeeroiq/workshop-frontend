import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import LoginForm from './LoginForm';

const LoginModal = ({ trigger }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-1rem)] bg-[#111827] border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-0 sm:max-w-md">
        <div className="relative flex min-h-[70svh] w-full flex-col sm:min-h-[550px]">
          {/* Background Image Layer */}
          <div className="absolute inset-0 pointer-events-none">
            <img 
              src="/login.png" 
              alt="Login Background" 
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#111827]/40 via-[#111827]/80 to-[#111827]"></div>
          </div>

          {/* Content Layer */}
          <div className="relative flex flex-1 flex-col justify-center p-6 sm:p-10">
            <DialogHeader className="space-y-3 mb-8">
              <DialogTitle className="text-2xl font-black text-center text-white tracking-tight sm:text-4xl">Login to Your Workshop</DialogTitle>
              <DialogDescription className="text-center text-sm font-bold text-slate-300 sm:text-lg">
                Enter your credentials to access your account
              </DialogDescription>
            </DialogHeader>
            <div className="mx-auto w-full max-w-full sm:max-w-sm">
                <LoginForm onSuccess={() => setOpen(false)} onRedirect={() => setOpen(false)} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
