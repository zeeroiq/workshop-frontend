import React from 'react';
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
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#111827] border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-0">
        <div className="relative w-full h-full min-h-[500px] flex flex-col">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/login.png" 
              alt="Login Background" 
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#111827]/80 via-[#111827]/90 to-[#111827]"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 p-6 flex-1 flex flex-col justify-center">
            <DialogHeader className="space-y-2 mb-6">
              <DialogTitle className="text-2xl font-black text-center text-white tracking-tight">Login to Your Workshop</DialogTitle>
              <DialogDescription className="text-center text-slate-400 font-medium">
                Enter your credentials to access your account
              </DialogDescription>
            </DialogHeader>
            <LoginForm />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
