import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { onboardingService } from '@/services/onboardingService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Rocket, Shield, Clock, Wrench, Package, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import LoginModal from '@/components/auth/LoginModal';

const LandingPage = () => {
  const [formData, setFormData] = useState({
    workshopName: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      await onboardingService.registerWorkshop(formData);
      toast.success('Workshop registered successfully! Please sign in.');
      setFormData({
        workshopName: '',
        fullName: '',
        email: '',
        password: '',
        phone: '',
      });
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error(error.response?.data?.message || 'Failed to register workshop. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-900 tracking-tight">Vishwakarma</span>
                <span className="ml-1 text-indigo-600 font-semibold text-sm uppercase tracking-wider">Workshop</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Pricing</a>
              <LoginModal trigger={
                <button className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer bg-transparent border-none">
                  Sign In
                </button>
              } />
              <Button asChild variant="default" className={cn("bg-indigo-600 hover:bg-indigo-700 text-white border-transparent")}>
                <a href="#onboard">Get Started</a>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left space-y-8">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                Now in Public Beta
              </div>
              <h1 className="text-5xl tracking-tight font-extrabold text-slate-900 sm:text-6xl md:text-7xl">
                The OS for your <br />
                <span className="text-indigo-600">Mechanical Workshop</span>
              </h1>
              <p className="text-lg text-slate-600 sm:text-xl leading-relaxed">
                Manage jobs, inventory, and invoices with ease. Scale your workshop business with our secure, multi-tenant digital platform designed for modern mechanics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:justify-center lg:justify-start">
                <Button asChild size="lg" className={cn("bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg border-transparent")}>
                  <a href="#onboard">Launch Your Workshop Now</a>
                </Button>
                <Button variant="outline" size="lg" className={cn("bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg border-transparent")}>
                  <a href="#features">View Demo</a>
                </Button>
              </div>
            </div>
            <div className="mt-16 lg:mt-0 lg:col-span-6">
              <div className="relative mx-auto w-full rounded-2xl shadow-2xl overflow-hidden bg-slate-100 ring-1 ring-slate-200 p-2 transform hover:scale-[1.02] transition-transform duration-500">
                <img 
                  className="w-full rounded-xl shadow-inner" 
                  src="https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&q=80&w=1200" 
                  alt="Workshop management dashboard preview" 
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Capabilities</h2>
            <p className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Everything you need to run <br /> a modern workshop
            </p>
            <p className="text-lg text-slate-600">
              Stop relying on paper and messy spreadsheets. Vishwakarma brings order to your daily operations.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard 
              icon={<Clock className="w-6 h-6 text-white" />}
              title="Digital Job Cards"
              description="Create, track, and manage job cards in real-time. Assign mechanics and track labor hours effortlessly."
            />
            <FeatureCard 
              icon={<Package className="w-6 h-6 text-white" />}
              title="Inventory Management"
              description="Keep track of spare parts, suppliers, and low-stock alerts. Automatic stock deductions on job completion."
            />
            <FeatureCard 
              icon={<Receipt className="w-6 h-6 text-white" />}
              title="Smart Billing"
              description="Convert jobs to invoices in one click. Support for integrated payments via UPI and Cashfree."
            />
          </div>
        </div>
      </section>

      {/* Onboarding Section */}
      <section id="onboard" className="py-24 bg-indigo-900 relative overflow-hidden scroll-mt-20">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-400 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="text-left mb-12 lg:mb-0 space-y-6">
              <h2 className="text-4xl font-extrabold text-white sm:text-5xl leading-tight">
                Ready to transform <br /> your workshop?
              </h2>
              <p className="text-xl text-indigo-100">
                Join hundreds of workshop owners who are scaling their businesses with Vishwakarma.
              </p>
              <ul className="space-y-4">
                {[
                  '14-day free trial',
                  'No credit card required',
                  'Unlimited job cards',
                  'Multi-user support'
                ].map((item) => (
                  <li key={item} className="flex items-center text-indigo-100">
                    <Shield className="w-5 h-5 mr-3 text-indigo-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <Card className="border-none shadow-2xl bg-white text-slate-900">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Launch Your Workshop</CardTitle>
                <CardDescription className="text-slate-500">
                  Enter your details to create your digital workspace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workshopName" className="text-slate-700">Workshop Name</Label>
                      <Input
                        id="workshopName"
                        name="workshopName"
                        placeholder="e.g. Apex Motors"
                        value={formData.workshopName}
                        onChange={handleChange}
                        className="bg-white border-slate-200 text-slate-900"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-slate-700">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="bg-white border-slate-200 text-slate-900"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-white border-slate-200 text-slate-900"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      className="bg-white border-slate-200 text-slate-900"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-700">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="bg-white border-slate-200 text-slate-900"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className={cn("w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-lg font-semibold mt-4 border-transparent")}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Rocket className="mr-2 h-5 w-5 animate-bounce" />
                        Setting up workshop...
                      </>
                    ) : (
                      'Create My Digital Workshop'
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <p className="text-xs text-slate-500 text-center">
                  By signing up, you agree to our{' '}
                  <a href="#" className="underline hover:text-indigo-600">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="underline hover:text-indigo-600">Privacy Policy</a>.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1 rounded">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Vishwakarma</span>
            </div>
            <div className="text-sm text-slate-500">
              &copy; 2026 Vishwakarma Workshop. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.058-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="p-8 border border-slate-200 rounded-2xl bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="bg-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;
