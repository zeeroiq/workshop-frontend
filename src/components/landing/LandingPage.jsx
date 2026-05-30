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
import { 
  Rocket, 
  Shield, 
  Wrench, 
  Barcode, 
  LayoutDashboard, 
  ArrowRight, 
  CheckCircle2, 
  Mail,
  Zap,
  Box,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import LoginModal from '@/components/auth/LoginModal';
import { ThemeToggle } from '@/components/common/ThemeToggle';

const LandingPage = () => {
  const [email, setEmail] = useState('');
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
      // Scroll to top or redirect to login
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error(error.response?.data?.message || 'Failed to register workshop. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalCTASubmit = (e) => {
    e.preventDefault();
    setFormData(prev => ({ ...prev, email }));
    document.getElementById('onboard').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#0f172a] text-slate-200 min-h-screen font-sans selection:bg-emerald-500/30 selection:text-emerald-400">
      <ThemeToggle className="fixed top-4 right-4 z-[100] shadow-lg shadow-emerald-500/10 border-emerald-500/20" />
      
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
                <Wrench className="w-6 h-6 text-slate-900" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-2xl font-black text-white tracking-tight">YourWorkshop</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Workshop Intelligence</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-10">
              <a href="#features" className="text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-all">Features</a>
              <a href="#automation" className="text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-all">Automation</a>
              <LoginModal trigger={
                <button className="text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-all cursor-pointer bg-transparent border-none">
                  Sign In
                </button>
              } />
              <Button asChild className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-6 rounded-lg transition-transform active:scale-95 shadow-lg shadow-emerald-500/10">
                <a href="#onboard">Start Free Trial</a>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 uppercase tracking-widest">
                <Zap className="w-3.5 h-3.5 mr-2 fill-emerald-400" /> Next-Gen Workshop OS
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
                Streamline Your Workshop <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Inventory from Gear to Garage.</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                The ultimate digital assistant for auto repair shops and parts distributors. Track, scan, and fulfill orders effortlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-4">
                <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black px-10 py-7 text-lg rounded-xl shadow-xl shadow-emerald-500/20 transition-all hover:-translate-y-1">
                  <a href="#onboard">Start Free Trial</a>
                </Button>
                <Button variant="outline" size="lg" className="border-slate-700 bg-slate-800/50 text-white font-bold px-10 py-7 text-lg rounded-xl hover:bg-slate-700 transition-all hover:-translate-y-1 backdrop-blur-sm text-slate-200">
                  <a href="#features">Watch Demo</a>
                </Button>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-6 pt-8 grayscale opacity-50">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Trusted by 500+ Workshops</span>
              </div>
            </div>
            <div className="mt-20 lg:mt-0 lg:col-span-6 relative">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl">
                  {/* Using animate.mp4 if available, fallback to 5.jpeg */}
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-full object-cover"
                    poster="/5.jpeg"
                  >
                    <source src="/animate.mp4" type="video/mp4" />
                    <img src="/5.jpeg" alt="Mechanic working on car parts" className="w-full h-full object-cover" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
                    <span className="text-xs font-black text-white uppercase tracking-tighter">Live Inventory Sync Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE FEATURES GRID */}
      <section id="features" className="py-32 bg-slate-900/50 relative border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-emerald-400 font-black tracking-widest uppercase text-sm">Engineered for Efficiency</h2>
            <p className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              Powerful tools for the <br /> modern gearhead.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <FeatureCard 
              image="/8.jpeg"
              icon={<Barcode className="w-6 h-6 text-slate-900" />}
              title="Precision Barcode Scanning"
              description="Instantly check stock levels, part numbers, and locations with robust hardware integration."
            />
            <FeatureCard 
              image="/7.jpeg"
              icon={<LayoutDashboard className="w-6 h-6 text-slate-900" />}
              title="Digital Parts Dashboard"
              description="A crystal-clear UI designed specifically for complex mechanical inventories, gears, and components."
            />
            <FeatureCard 
              image="/2.jpeg"
              icon={<TrendingUp className="w-6 h-6 text-slate-900" />}
              title="Smart Queue & Conveyor Tracking"
              description="Visualize order pipelines and fulfillment routes automatically."
            />
          </div>
        </div>
      </section>

      {/* 3. MID-PAGE INTERACTIVE SECTION */}
      <section id="automation" className="py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-24 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-4 bg-emerald-500/10 rounded-3xl blur-2xl"></div>
              <img 
                src="/automate.jpeg" 
                alt="Automation in workshop" 
                className="relative rounded-2xl border border-slate-700 shadow-2xl transform lg:-rotate-2 hover:rotate-0 transition-transform duration-700"
              />
            </div>
            <div className="space-y-10 order-1 lg:order-2 mt-16 lg:mt-0">
              <div className="space-y-4">
                <h2 className="text-emerald-400 font-black tracking-widest uppercase text-sm">Next-Level Automation</h2>
                <p className="text-4xl font-black text-white tracking-tight">
                  Automate the mundane. <br /> Focus on the machine.
                </p>
              </div>
              
              <div className="space-y-6">
                <AutomationLink 
                  title="Automated Restocking Alerts" 
                  description="Never run out of critical gaskets or fluids again. AutoTrack predicts needs before they hit zero."
                />
                <AutomationLink 
                  title="Smart Bin Allocations" 
                  description="Optimize your warehouse floor plan with AI-driven part placement based on usage frequency."
                />
                <AutomationLink 
                  title="Real-time Workshop Synergy" 
                  description="Sync your front desk with the repair floor. Status updates flow instantly to your customers."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE VALUE PROPOSITION SECTION */}
      <section className="relative py-40 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/happy customer.jpeg" 
            alt="Happy Customer" 
            className="w-full h-full object-cover opacity-30 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/90 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <h2 className="text-emerald-400 font-black tracking-widest uppercase text-sm mb-6">The Value Proposition</h2>
            <h3 className="text-5xl sm:text-6xl font-black text-white mb-8 tracking-tighter leading-none">
              Happy Mechanics. <br /> Satisfied Customers.
            </h3>
            <p className="text-xl text-slate-300 leading-relaxed font-medium mb-10">
              Bridge the gap between your back-end inventory and front-end customer handshakes. Minimize wait times and maximize turnover. YourWorkshop is the link that turns a busy garage into a profitable machine.
            </p>
            <div className="grid grid-cols-2 gap-8 border-t border-slate-700/50 pt-10">
              <div>
                <p className="text-4xl font-black text-emerald-400">40%</p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Faster Fulfillment</p>
              </div>
              <div>
                <p className="text-4xl font-black text-blue-400">100%</p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Parts Accuracy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER & FINAL CTA */}
      <section id="onboard" className="py-32 bg-[#0f172a] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 border border-slate-800 p-8 sm:p-16 lg:p-24 shadow-3xl">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Box className="w-64 h-64 text-emerald-500" />
            </div>

            <div className="lg:grid lg:grid-cols-2 lg:gap-20 items-center relative z-10">
              <div className="space-y-8">
                <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                  Ready to accelerate your workshop's efficiency?
                </h2>
                <p className="text-lg text-slate-400 font-medium leading-relaxed">
                  Join the elite network of workshops transforming the automotive industry. No credit card required. Cancel anytime.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center text-slate-300 font-bold">
                    <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-500" /> 14-day full-access trial
                  </li>
                  <li className="flex items-center text-slate-300 font-bold">
                    <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-500" /> Unlimited inventory parts
                  </li>
                  <li className="flex items-center text-slate-300 font-bold">
                    <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-500" /> Full hardware integration
                  </li>
                </ul>
              </div>

              <div className="mt-12 lg:mt-0">
                <Card className="border-slate-700 bg-slate-950/50 backdrop-blur-xl shadow-2xl">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl font-black text-white">Join the Pro Tier</CardTitle>
                    <CardDescription className="text-slate-400 font-medium">
                      Set up your digital workspace in under 2 minutes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="workshopName" className="text-xs font-bold uppercase tracking-widest text-slate-500">Workshop Name</Label>
                          <Input
                            id="workshopName"
                            name="workshopName"
                            placeholder="e.g. Apex Motors"
                            value={formData.workshopName}
                            onChange={handleChange}
                            required
                            className="bg-slate-900 border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20 text-white h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-widest text-slate-500">Full Name</Label>
                          <Input
                            id="fullName"
                            name="fullName"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            className="bg-slate-900 border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20 text-white h-12"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@yourworkshop.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="bg-slate-900 border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20 text-white h-12"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password" name="password" className="text-xs font-bold uppercase tracking-widest text-slate-500">Secure Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className="bg-slate-900 border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20 text-white h-12"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-slate-500">Direct Contact</Label>
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="+1 (555) 000-0000"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="bg-slate-900 border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20 text-white h-12"
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 h-14 text-lg font-black mt-4 shadow-lg shadow-emerald-500/20"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <Rocket className="w-5 h-5 animate-bounce" /> Initializing...
                          </div>
                        ) : (
                          'Launch My Workspace'
                        )}
                      </Button>
                    </form>
                  </CardContent>
                  <CardFooter>
                    <p className="text-[10px] text-slate-500 text-center w-full font-bold uppercase tracking-widest">
                      Encrypted Connection &middot; GDPR Compliant &middot; 99.9% Uptime
                    </p>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA Banner */}
        <div className="max-w-4xl mx-auto px-4 mt-32 text-center space-y-8">
            <h3 className="text-3xl font-black text-white">Never miss a part. Never lose a lead.</h3>
            <form onSubmit={handleFinalCTASubmit} className="flex flex-col sm:flex-row gap-3">
                <Input 
                    placeholder="Enter your email to get started" 
                    className="h-14 bg-slate-900 border-slate-700 text-white rounded-xl flex-grow focus:ring-emerald-500/20"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Button className="h-14 px-10 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black rounded-xl">
                    Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </form>
        </div>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-40 pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
            <div className="bg-slate-700 p-1.5 rounded-lg">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black text-white tracking-tighter uppercase">YourWorkshop</span>
          </div>
          <div className="flex gap-10">
            <a href="#" className="text-xs font-bold text-slate-500 hover:text-emerald-400 uppercase tracking-widest transition-colors">Product</a>
            <a href="#" className="text-xs font-bold text-slate-500 hover:text-emerald-400 uppercase tracking-widest transition-colors">Features</a>
            <a href="#" className="text-xs font-bold text-slate-500 hover:text-emerald-400 uppercase tracking-widest transition-colors">Privacy</a>
            <a href="#" className="text-xs font-bold text-slate-500 hover:text-emerald-400 uppercase tracking-widest transition-colors">Contact</a>
          </div>
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
            &copy; 2026 YourWorkshop SaaS. All rights reserved.
          </div>
        </footer>
      </section>
    </div>
  );
};

const FeatureCard = ({ image, icon, title, description }) => (
  <div className="group relative p-1 rounded-[2rem] bg-slate-800 border border-slate-700 hover:border-emerald-500/50 transition-all duration-500 overflow-hidden shadow-2xl">
    <div className="relative h-64 overflow-hidden rounded-[1.8rem]">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
        <div className="absolute bottom-6 left-6 bg-emerald-500 p-3 rounded-2xl shadow-xl shadow-emerald-500/20 transform group-hover:rotate-12 transition-transform">
            {icon}
        </div>
    </div>
    <div className="p-8 space-y-4">
      <h3 className="text-2xl font-black text-white tracking-tight">{title}</h3>
      <p className="text-slate-400 font-medium leading-relaxed">{description}</p>
      <div className="flex items-center text-emerald-400 text-sm font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        Learn More <ArrowRight className="ml-2 w-4 h-4" />
      </div>
    </div>
  </div>
);

const AutomationLink = ({ title, description }) => (
    <div className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-700 transition-all cursor-default">
        <div className="flex items-start gap-4">
            <div className="mt-1 bg-slate-800 group-hover:bg-emerald-500 p-2 rounded-lg transition-colors">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 group-hover:text-slate-900" />
            </div>
            <div>
                <h4 className="text-lg font-black text-white mb-1 group-hover:text-emerald-400 transition-colors">{title}</h4>
                <p className="text-slate-400 font-medium leading-relaxed">{description}</p>
            </div>
        </div>
    </div>
);

export default LandingPage;
