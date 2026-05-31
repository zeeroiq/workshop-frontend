import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { onboardingService } from '@/services/onboardingService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocation } from 'react-router-dom';
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
  TrendingUp,
  Smartphone,
  Bell,
  FileText,
  Star,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import LoginModal from '@/components/auth/LoginModal';
import { ThemeToggle } from '@/components/common/ThemeToggle';

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    workshopName: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#onboard') {
      const element = document.getElementById('onboard');
      if (element) {
        setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

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
    <div className="bg-background text-foreground min-h-screen font-sans selection:bg-emerald-500/30 selection:text-emerald-500 overflow-x-hidden">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
                <Wrench className="w-6 h-6 text-emerald-950" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl sm:text-2xl font-black text-foreground tracking-tight">YourWorkshop</span>
                <span className="text-[9px] sm:text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Workshop Intelligence</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-bold text-muted-foreground hover:text-emerald-500 transition-all uppercase tracking-widest">Features</a>
              <a href="#automation" className="text-sm font-bold text-muted-foreground hover:text-emerald-500 transition-all uppercase tracking-widest">Automation</a>
              <LoginModal trigger={
                <button className="text-sm font-bold text-muted-foreground hover:text-emerald-500 transition-all cursor-pointer bg-transparent border-none uppercase tracking-widest">
                  Sign In
                </button>
              } />
              <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20 border-none uppercase text-xs tracking-widest">
                <a href="#onboard">Start Trial</a>
              </Button>
              <ThemeToggle className="ml-2" />
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={cn(
            "fixed inset-0 top-20 bg-background/95 backdrop-blur-lg z-40 md:hidden transition-all duration-300 ease-in-out",
            isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        )}>
            <nav className="flex flex-col p-8 space-y-6">
                <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black text-foreground hover:text-emerald-500 transition-colors uppercase tracking-tight border-b border-border pb-4">Features</a>
                <a href="#automation" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black text-foreground hover:text-emerald-500 transition-colors uppercase tracking-tight border-b border-border pb-4">Automation</a>
                <a href="#billing" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black text-foreground hover:text-emerald-500 transition-colors uppercase tracking-tight border-b border-border pb-4">Billing</a>
                <div className="pt-6 flex flex-col gap-4">
                    <LoginModal trigger={
                        <Button variant="outline" className="w-full h-14 text-lg font-black uppercase tracking-widest rounded-2xl">Sign In</Button>
                    } />
                    <Button asChild className="w-full h-14 text-lg font-black bg-emerald-600 hover:bg-emerald-500 text-white uppercase tracking-widest rounded-2xl border-none">
                        <a href="#onboard" onClick={() => setIsMenuOpen(false)}>Initialize Trial</a>
                    </Button>
                </div>
            </nav>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative pt-16 sm:pt-24 lg:pt-32 pb-32 overflow-hidden bg-background">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 uppercase tracking-[0.2em]">
                <Zap className="w-3.5 h-3.5 mr-2 fill-emerald-600 dark:fill-emerald-400 animate-pulse" /> Next-Gen Workshop OS
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-foreground leading-[1.1] tracking-tight">
                Streamline Your Workshop <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-500">From Gear to Garage.</span>
              </h1>
              <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                The ultimate digital assistant for auto repair shops and parts distributors. Track, scan, and fulfill orders with precision intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Button asChild size="lg" className="h-14 sm:h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-10 text-lg rounded-2xl shadow-2xl shadow-emerald-500/20 transition-all active:scale-95 border-none uppercase tracking-widest">
                  <a href="#onboard">Start Trial</a>
                </Button>
                <Button variant="outline" size="lg" className="h-14 sm:h-16 border-border bg-background/50 text-foreground font-black px-10 text-lg rounded-2xl hover:bg-accent transition-all active:scale-95 backdrop-blur-sm uppercase tracking-widest">
                  <a href="#features">Systems Tour</a>
                </Button>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-4 pt-8 opacity-40">
                <div className="h-px w-12 bg-muted-foreground/30"></div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Deployment active in 500+ Hubs</span>
                <div className="h-px w-12 bg-muted-foreground/30"></div>
              </div>
            </div>
            
            <div className="mt-20 lg:mt-0 lg:col-span-5 relative">
              <div className="relative group p-4 sm:p-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative rounded-[2rem] overflow-hidden border border-border bg-card shadow-2xl">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-lg">Core Sync Active</span>
                    </div>
                    <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[9px] font-bold text-white/70 uppercase">
                        v2.4.0-PRO
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE FEATURES GRID */}
      <section id="features" className="py-24 sm:py-32 bg-muted/5 relative border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
            <h2 className="text-emerald-600 dark:text-emerald-400 font-black tracking-[0.3em] uppercase text-[10px] sm:text-xs">Engineered for Precision</h2>
            <p className="text-3xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-tight">
              Powerful tools for the <br className="hidden sm:block" /> modern gearhead.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            <FeatureCard 
              image="/8.jpeg"
              icon={<Barcode className="w-6 h-6 text-emerald-950" />}
              title="Precision Scanning"
              description="Instantly verify stock levels, part numbers, and bin locations with high-performance hardware integration."
            />
            <FeatureCard 
              image="/7.jpeg"
              icon={<LayoutDashboard className="w-6 h-6 text-emerald-950" />}
              title="Intelligence Hub"
              description="A crystal-clear visualization layer designed specifically for complex mechanical inventories and logistics."
            />
            <FeatureCard 
              image="/2.jpeg"
              icon={<TrendingUp className="w-6 h-6 text-emerald-950" />}
              title="Predictive Analytics"
              description="Visualize order pipelines and fulfillment routes with AI-driven throughput optimization."
            />
          </div>
        </div>
      </section>

      {/* 3. MID-PAGE INTERACTIVE SECTION */}
      <section id="automation" className="py-24 sm:py-32 overflow-hidden bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-24 items-center">
            <div className="relative order-2 lg:order-1 mt-16 lg:mt-0 px-4 sm:px-0">
              <div className="absolute -inset-4 bg-emerald-500/5 rounded-[2.5rem] blur-2xl"></div>
              <img 
                src="/automate.jpeg" 
                alt="Automation in workshop" 
                className="relative rounded-[2rem] border border-border shadow-2xl transform lg:-rotate-2 hover:rotate-0 transition-transform duration-700 w-full"
              />
            </div>
            <div className="space-y-10 order-1 lg:order-2">
              <div className="space-y-4 text-center lg:text-left">
                <h2 className="text-emerald-600 dark:text-emerald-400 font-black tracking-[0.3em] uppercase text-[10px]">Neural Automation</h2>
                <p className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
                  Automate the mundane. <br /> Focus on the machine.
                </p>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <AutomationLink 
                  title="Predictive Restocking" 
                  description="System intelligence predicts depletion of critical gaskets and fluids before operational impact."
                />
                <AutomationLink 
                  title="Dynamic Bin Allocation" 
                  description="Optimize facility floor plans with usage-frequency part placement algorithms."
                />
                <AutomationLink 
                  title="Full-Stack Synergy" 
                  description="Synchronize administrative nodes with the repair floor for instant customer data flow."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SMART BILLING & DIGITAL JOB CARD */}
      <section id="billing" className="py-24 sm:py-32 bg-muted/5 relative border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-24 items-center">
            <div className="space-y-10">
              <div className="space-y-4 text-center lg:text-left">
                <h2 className="text-emerald-600 dark:text-emerald-400 font-black tracking-[0.3em] uppercase text-[10px]">Financial Intelligence</h2>
                <p className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
                  Transparent, Real-Time <br /> Billing Experiences
                </p>
                <p className="text-base sm:text-xl text-muted-foreground font-medium leading-relaxed">
                  Keep car owners in the loop from diagnostic check-in to final payment with live digital status updates.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">
                <BillingPerk 
                  icon={<Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                  title="Live Telemetry" 
                  description="Automated notifications fire when tasks like 'Differential Service' reach 100% completion."
                />
                <BillingPerk 
                  icon={<FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                  title="Digital Job Ledger" 
                  description="Eliminate paperwork with cryptographically secure, itemized digital invoices."
                />
                <BillingPerk 
                  icon={<Star className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                  title="Integrated Feedback" 
                  description="Gather immediate operational insights upon final ledger settlement."
                />
              </div>
            </div>
            <div className="relative mt-20 lg:mt-0 px-8 sm:px-0">
              <div className="absolute -inset-4 bg-blue-500/5 rounded-[3rem] blur-2xl"></div>
              <img 
                src="/billing-3.jpeg" 
                alt="Customer smartphone view" 
                className="relative rounded-[3rem] border border-border shadow-2xl transform lg:rotate-2 hover:rotate-0 transition-transform duration-700 mx-auto max-w-xs sm:max-w-sm w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. ONBOARDING SECTION */}
      <section id="onboard" className="py-24 sm:py-32 bg-background scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden bg-card border border-border p-8 sm:p-16 lg:p-24 shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Box className="w-64 h-64 text-emerald-500" />
            </div>

            <div className="lg:grid lg:grid-cols-2 lg:gap-20 items-center relative z-10">
              <div className="space-y-8 text-center lg:text-left">
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-card-foreground leading-tight tracking-tight">
                  Accelerate your workshop's <span className="text-emerald-500">Efficiency</span> today.
                </h2>
                <p className="text-base sm:text-xl text-muted-foreground font-medium leading-relaxed">
                  Join the elite network of workshops transforming the automotive industry. Cancel any time during trial.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="flex items-center text-card-foreground font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-500 shrink-0" /> 14-day Pro Trial
                  </div>
                  <div className="flex items-center text-card-foreground font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-500 shrink-0" /> Unlimited Fleet Tracking
                  </div>
                  <div className="flex items-center text-card-foreground font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-500 shrink-0" /> Full API Integration
                  </div>
                  <div className="flex items-center text-card-foreground font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-500 shrink-0" /> Cloud Data Continuity
                  </div>
                </div>
              </div>

              <div className="mt-12 lg:mt-0">
                <Card className="border-border/50 bg-background/50 backdrop-blur-2xl shadow-2xl rounded-[2rem]">
                  <CardHeader className="space-y-2 p-6 sm:p-8">
                    <CardTitle className="text-2xl font-black text-foreground uppercase tracking-tight">Provision Workspace</CardTitle>
                    <CardDescription className="text-muted-foreground font-medium">
                      Initialize your secure digital environment.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 sm:p-8 pt-0">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="workshopName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">Workshop Name</Label>
                          <Input
                            id="workshopName"
                            name="workshopName"
                            placeholder="Apex Hub"
                            value={formData.workshopName}
                            onChange={handleChange}
                            required
                            className="bg-background/50 border-border h-12 rounded-xl font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">Administrator Name</Label>
                          <Input
                            id="fullName"
                            name="fullName"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            className="bg-background/50 border-border h-12 rounded-xl font-bold"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">System Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="admin@hub.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="bg-background/50 border-border h-12 rounded-xl font-bold"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password" name="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">Secure Key</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className="bg-background/50 border-border h-12 rounded-xl font-bold"
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-14 text-sm font-black mt-4 shadow-xl shadow-emerald-500/20 border-none rounded-xl uppercase tracking-[0.2em]"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Initializing Node...' : 'Initialize Workspace'}
                      </Button>
                    </form>
                  </CardContent>
                  <CardFooter className="p-8 pt-0 justify-center border-t border-border/50">
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.1em] mt-6 opacity-60">
                        Zero Trust Architecture &middot; RSA-4096 Encrypted &middot; 99.9% Uptime
                    </p>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA Banner */}
        <div className="max-w-4xl mx-auto px-4 mt-32 text-center space-y-10">
            <h3 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight uppercase leading-none">Never miss a part. <br /> Never lose a lead.</h3>
            <form onSubmit={handleFinalCTASubmit} className="flex flex-col sm:flex-row gap-3">
                <Input 
                    placeholder="Enter your system email..." 
                    className="h-14 sm:h-16 bg-muted/20 border-border text-foreground rounded-2xl flex-grow focus:ring-emerald-500/20 font-bold"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Button className="h-14 sm:h-16 px-10 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl border-none uppercase tracking-widest text-xs">
                    Deploy Profile <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </form>
        </div>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-40 pt-16 border-t border-border flex flex-col md:flex-row justify-between items-center gap-10 pb-16">
          <div className="flex items-center gap-2.5 opacity-60 hover:opacity-100 transition-all cursor-pointer group">
            <div className="bg-muted p-2 rounded-xl group-hover:bg-emerald-500 transition-colors">
              <Wrench className="w-5 h-5 text-foreground group-hover:text-emerald-950" />
            </div>
            <span className="text-xl font-black text-foreground tracking-tighter uppercase">YourWorkshop</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
            <a href="#" className="text-[10px] font-black text-muted-foreground hover:text-emerald-600 uppercase tracking-[0.2em] transition-colors">Documentation</a>
            <a href="#" className="text-[10px] font-black text-muted-foreground hover:text-emerald-600 uppercase tracking-[0.2em] transition-colors">Status</a>
            <a href="#" className="text-[10px] font-black text-muted-foreground hover:text-emerald-600 uppercase tracking-[0.2em] transition-colors">Privacy Ops</a>
            <a href="#" className="text-[10px] font-black text-muted-foreground hover:text-emerald-600 uppercase tracking-[0.2em] transition-colors">Support</a>
          </div>
          <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">
            &copy; 2026 YourWorkshop Intelligence. All Nodes Secure.
          </div>
        </footer>
      </section>
    </div>
  );
};

const FeatureCard = ({ image, icon, title, description }) => (
  <div className="group relative p-1 rounded-[2.5rem] bg-card/50 backdrop-blur-sm border border-border hover:border-emerald-500/50 transition-all duration-500 overflow-hidden shadow-2xl">
    <div className="relative h-56 sm:h-64 overflow-hidden rounded-[2.2rem]">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent"></div>
        <div className="absolute bottom-6 left-6 bg-emerald-500 p-3 rounded-2xl shadow-xl shadow-emerald-500/20 transform group-hover:rotate-12 transition-all duration-300">
            {icon}
        </div>
    </div>
    <div className="p-8 sm:p-10 space-y-4">
      <h3 className="text-2xl font-black text-foreground tracking-tight">{title}</h3>
      <p className="text-muted-foreground font-medium leading-relaxed text-sm sm:text-base">{description}</p>
      <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity pt-2">
        Access Intelligence <ArrowRight className="ml-2 w-4 h-4" />
      </div>
    </div>
  </div>
);

const AutomationLink = ({ title, description }) => (
    <div className="group p-6 sm:p-8 rounded-[2rem] border border-border bg-card/30 hover:bg-card hover:border-emerald-500/20 transition-all cursor-default shadow-sm hover:shadow-emerald-500/5">
        <div className="flex items-start gap-5">
            <div className="mt-1 bg-muted group-hover:bg-emerald-500 p-2.5 rounded-xl transition-all duration-300 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 group-hover:text-emerald-950" />
            </div>
            <div>
                <h4 className="text-lg sm:text-xl font-black text-foreground mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{title}</h4>
                <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">{description}</p>
            </div>
        </div>
    </div>
);

const BillingPerk = ({ icon, title, description }) => (
    <div className="group flex items-start gap-5 p-5 rounded-2xl hover:bg-emerald-500/5 transition-all cursor-default border border-transparent hover:border-border/50">
        <div className="mt-1 bg-background shadow-lg p-3 rounded-2xl border border-border group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            {icon}
        </div>
        <div>
            <h4 className="text-lg font-black text-foreground mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{title}</h4>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">{description}</p>
        </div>
    </div>
);

export default LandingPage;
