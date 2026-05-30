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
      <DialogContent className="sm:max-w-md bg-[#111827] border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-0">
        <div className="relative w-full h-full min-h-[550px] flex flex-col">
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
          <div className="relative p-10 flex-1 flex flex-col justify-center">
            <DialogHeader className="space-y-3 mb-8">
              <DialogTitle className="text-4xl font-black text-center text-white tracking-tight">Login to Your Workshop</DialogTitle>
              <DialogDescription className="text-center text-slate-300 font-bold text-lg">
                Enter your credentials to access your account
              </DialogDescription>
            </DialogHeader>
            <div className="max-w-sm mx-auto w-full">
                <LoginForm onSuccess={() => setOpen(false)} onRedirect={() => setOpen(false)} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
