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
  X,
  Lock,
  Globe,
  Cpu
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
      toast.error('Security key requires minimum 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onboardingService.registerWorkshop(formData);
      toast.success('Node provisioned successfully. Proceed to authentication.');
      setFormData({ workshopName: '', fullName: '', email: '', password: '', phone: '' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Node registration failure.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen font-sans selection:bg-primary/30 selection:text-primary overflow-x-hidden">
      {/* Dynamic Navigation Node */}
      <header className="bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-[100] w-full">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8">
          <div className="flex justify-between items-center h-20 md:h-24">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2.5 rounded-2xl shadow-2xl shadow-primary/20 transform hover:rotate-12 transition-transform cursor-pointer">
                <Wrench className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl md:text-2xl font-black text-foreground tracking-tighter uppercase">Vishwakarma</span>
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Operational OS</span>
              </div>
            </div>
            
            {/* Desktop Navigation Link-set */}
            <nav className="hidden lg:flex items-center space-x-10">
              {['Features', 'Automation', 'Intelligence'].map((item) => (
                <a 
                    key={item} 
                    href={`#${item.toLowerCase()}`} 
                    className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all relative group"
                >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </a>
              ))}
              <div className="h-6 w-px bg-border/50 mx-2" />
              <LoginModal trigger={
                <button className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all">
                  Sign In
                </button>
              } />
              <Button asChild className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl shadow-2xl shadow-primary/20 border-none uppercase text-[10px] tracking-widest transition-all active:scale-95">
                <a href="#onboard">Initialize Node</a>
              </Button>
              <ThemeToggle />
            </nav>

            {/* Mobile Interaction Cluster */}
            <div className="lg:hidden flex items-center gap-3">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="h-12 w-12 rounded-2xl hover:bg-primary/10 transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Fluid Mobile Navigation Drawer */}
        <div className={cn(
            "fixed inset-0 top-20 md:top-24 bg-background/98 backdrop-blur-2xl z-[90] lg:hidden transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
            isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        )}>
            <nav className="flex flex-col p-8 sm:p-12 space-y-8">
                {['Features', 'Automation', 'Intelligence', 'Security'].map((item) => (
                    <a 
                        key={item}
                        href={`#${item.toLowerCase()}`} 
                        onClick={() => setIsMenuOpen(false)} 
                        className="text-4xl sm:text-5xl font-black text-foreground hover:text-primary transition-colors uppercase tracking-tighter border-b border-border/30 pb-6 flex items-center justify-between group"
                    >
                        {item}
                        <ArrowRight className="h-8 w-8 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                    </a>
                ))}
                <div className="pt-10 flex flex-col gap-4">
                    <LoginModal trigger={
                        <Button variant="outline" className="w-full h-16 text-sm font-black uppercase tracking-widest rounded-[2rem] border-border/50">Authenticate Session</Button>
                    } />
                    <Button asChild className="w-full h-16 text-sm font-black bg-primary text-primary-foreground uppercase tracking-widest rounded-[2rem] border-none shadow-2xl shadow-primary/20">
                        <a href="#onboard" onClick={() => setIsMenuOpen(false)}>Initialize Trial Node</a>
                    </Button>
                </div>
            </nav>
        </div>
      </header>

      {/* Hero: Strategic Deployment */}
      <section className="relative pt-20 sm:pt-32 lg:pt-48 pb-32 lg:pb-56 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[-5%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 space-y-10 text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-[0.3em]">
                <Cpu className="w-4 h-4 mr-2 animate-spin-slow" /> Strategic Workshop OS v2.4
              </div>
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-foreground leading-[0.95] tracking-tighter uppercase">
                Precision <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-emerald-500">Logistics.</span>
              </h1>
              <p className="text-lg sm:text-2xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium opacity-80">
                The high-performance digital core for automotive service centers. Synchronize inventory, personnel, and customer flows with surgical accuracy.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-6">
                <Button asChild size="lg" className="h-16 sm:h-20 bg-primary hover:bg-primary/90 text-primary-foreground font-black px-12 text-xl rounded-[2.5rem] shadow-2xl shadow-primary/30 transition-all active:scale-95 border-none uppercase tracking-widest">
                  <a href="#onboard">Initialize Deployment</a>
                </Button>
                <Button variant="outline" size="lg" className="h-16 sm:h-20 border-border/50 bg-card/30 text-foreground font-black px-12 text-xl rounded-[2.5rem] hover:bg-accent transition-all active:scale-95 backdrop-blur-md uppercase tracking-widest">
                  <a href="#features">Systems Audit</a>
                </Button>
              </div>
            </div>
            
            <div className="flex-1 w-full lg:max-w-[600px] relative">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-blue-500/20 rounded-[4rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="relative rounded-[3rem] overflow-hidden border border-border/50 bg-card shadow-2xl aspect-[4/5] sm:aspect-video lg:aspect-square">
                  <img src="/5.jpeg" alt="Strategic Workflow" className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_15px_rgba(var(--primary),1)]" />
                            <span className="text-xs font-black text-white uppercase tracking-[0.2em] drop-shadow-xl">Node Sync Active</span>
                        </div>
                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Data Packet Throughput: 4.8GB/s</p>
                    </div>
                    <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
                        SECURE_KERNEL_O9
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features: The Capability Matrix */}
      <section id="features" className="py-32 sm:py-56 bg-muted/5 relative border-y border-border/50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-4xl mx-auto mb-24 sm:mb-40 space-y-6">
            <h2 className="text-primary font-black tracking-[0.4em] uppercase text-xs">Functional Node Matrix</h2>
            <p className="text-4xl sm:text-7xl lg:text-8xl font-black text-foreground tracking-tighter uppercase leading-[0.9]">
                Engineered for <br /> High-Velocity <br /> <span className="text-muted-foreground/30">Throughput.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-16">
            <FeatureCard 
              image="/8.jpeg"
              icon={<Barcode className="w-8 h-8 text-primary-foreground" />}
              title="Optical Recognition"
              description="High-frequency hardware synchronization for instant asset verification and bin mapping."
            />
            <FeatureCard 
              image="/7.jpeg"
              icon={<LayoutDashboard className="w-8 h-8 text-primary-foreground" />}
              title="Heuristic Dashboard"
              description="Unified intelligence layer for real-time visualization of workshop floor dynamics."
            />
            <FeatureCard 
              image="/2.jpeg"
              icon={<TrendingUp className="w-8 h-8 text-primary-foreground" />}
              title="Yield Optimization"
              description="Predictive data modeling to maximize revenue per bay and reduce operational latency."
            />
          </div>
        </div>
      </section>

      {/* Provisioning Section */}
      <section id="onboard" className="py-32 sm:py-56 bg-background scroll-mt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8">
          <div className="relative rounded-[3rem] sm:rounded-[5rem] overflow-hidden bg-card border border-border/50 p-8 sm:p-20 lg:p-32 shadow-2xl">
            <div className="absolute top-0 right-0 p-16 opacity-5">
              <Rocket className="w-96 h-96 text-primary" />
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-32 relative z-10">
              <div className="flex-1 space-y-12 text-center lg:text-left">
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-foreground leading-[0.95] tracking-tighter uppercase">
                  Initialize <br /><span className="text-primary">Operational</span> <br /> Node.
                </h2>
                <p className="text-lg sm:text-2xl text-muted-foreground font-medium leading-relaxed opacity-70">
                  Provision your workshop's digital environment in 60 seconds. Zero-trust architecture comes standard.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                  {['Global Node Sync', 'Asset Lifecycle Tracking', 'Financial Ledger API', 'RSA-4096 Security'].map(perk => (
                    <div key={perk} className="flex items-center text-foreground font-black text-xs uppercase tracking-widest">
                        <CheckCircle2 className="w-5 h-5 mr-4 text-primary shrink-0" /> {perk}
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full lg:max-w-md">
                <Card className="border-border/50 bg-background/50 backdrop-blur-3xl shadow-2xl rounded-[3rem] p-4 sm:p-8">
                  <CardHeader className="space-y-3 p-6 text-center lg:text-left">
                    <CardTitle className="text-3xl font-black text-foreground uppercase tracking-tight">Provision Node</CardTitle>
                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                      System Initialization Parameters
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 ml-1">Commercial Node Label</Label>
                          <Input name="workshopName" placeholder="APEX_UNIT_01" value={formData.workshopName} onChange={handleChange} required className="h-14 bg-background/50 border-border/50 rounded-2xl font-black uppercase tracking-widest px-6" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 ml-1">Lead Analyst Name</Label>
                          <Input name="fullName" placeholder="JOHN_DOE" value={formData.fullName} onChange={handleChange} required className="h-14 bg-background/50 border-border/50 rounded-2xl font-bold px-6" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 ml-1">Digital Node Access (Email)</Label>
                          <Input name="email" type="email" placeholder="admin@node.network" value={formData.email} onChange={handleChange} required className="h-14 bg-background/50 border-border/50 rounded-2xl font-medium px-6" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 ml-1">Security Key</Label>
                          <Input name="password" type="password" placeholder="••••••••••••" value={formData.password} onChange={handleChange} required className="h-14 bg-background/50 border-border/50 rounded-2xl font-black px-6" />
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-black mt-6 shadow-2xl shadow-primary/20 border-none rounded-2xl uppercase tracking-[0.3em] transition-all active:scale-[0.98]"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Syncing...' : 'Deploy Global Node'}
                      </Button>
                    </form>
                  </CardContent>
                  <CardFooter className="p-10 pt-0 justify-center border-t border-border/20">
                    <div className="flex items-center gap-3 mt-8 opacity-40">
                        <Lock className="w-3 h-3" />
                        <p className="text-[8px] text-muted-foreground font-black uppercase tracking-[0.2em]">AES-256 Bitstream Encrypted Protocol</p>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Nodes */}
      <footer className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-24 border-t border-border/30 flex flex-col items-center gap-12">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="bg-muted p-3 rounded-2xl group-hover:bg-primary transition-all group-hover:rotate-12">
              <Wrench className="w-6 h-6 text-foreground group-hover:text-primary-foreground" />
            </div>
            <span className="text-2xl font-black text-foreground tracking-tighter uppercase">Vishwakarma OS</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-16 gap-y-6 opacity-60">
            {['Architecture', 'Stability', 'Operations', 'Governance'].map(link => (
                <a key={link} href="#" className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-[0.3em] transition-colors">{link}</a>
            ))}
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-30">
                &copy; 2026 STAFF_CENTRAL_NETWORK. ALL NODES AUTHORIZED.
            </p>
            <div className="flex items-center gap-4 text-emerald-500 opacity-50">
                <Globe className="w-3 h-3" />
                <span className="text-[8px] font-bold uppercase tracking-widest">Core Deployment: Global-01</span>
            </div>
          </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ image, icon, title, description }) => (
  <div className="group relative p-1.5 rounded-[3rem] bg-card/30 backdrop-blur-md border border-border/50 hover:border-primary/50 transition-all duration-700 overflow-hidden shadow-2xl active:scale-[0.98]">
    <div className="relative h-64 sm:h-80 overflow-hidden rounded-[2.5rem]">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-8 left-8 bg-primary p-4 rounded-2xl shadow-2xl shadow-primary/30 transform group-hover:rotate-12 transition-all duration-500">
            {icon}
        </div>
    </div>
    <div className="p-10 sm:p-12 space-y-6">
      <h3 className="text-3xl font-black text-foreground tracking-tight uppercase leading-none">{title}</h3>
      <p className="text-muted-foreground font-medium leading-relaxed text-base opacity-70 group-hover:opacity-100 transition-opacity">{description}</p>
      <div className="flex items-center text-primary text-[10px] font-black uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all pt-2">
        Synthesize Intelligence <ArrowRight className="ml-3 w-5 h-5" />
      </div>
    </div>
  </div>
);

export default LandingPage;
