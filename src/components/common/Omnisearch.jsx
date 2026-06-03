import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, 
    User, 
    Car, 
    Wrench, 
    Package, 
    Command,
    Loader2,
    ArrowRight,
    History
} from 'lucide-react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { searchService } from '@/services/searchService';
import { cn } from '@/lib/utils';

const Omnisearch = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({
        customers: [],
        vehicles: [],
        jobs: [],
        parts: []
    });
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('search_history');
        return saved ? JSON.parse(saved) : [];
    });
    
    const navigate = useNavigate();

    // Handle Keyboard Shortcuts
    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    // Perform Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                try {
                    const response = await searchService.globalSearch(query);
                    if (response.data.success) {
                        setResults(response.data.data);
                    }
                } catch (error) {
                    console.error('Search failed:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults({ customers: [], vehicles: [], jobs: [], parts: [] });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const addToHistory = (item) => {
        const newHistory = [item, ...history.filter(h => h.id !== item.id || h.type !== item.type)].slice(0, 5);
        setHistory(newHistory);
        localStorage.setItem('search_history', JSON.stringify(newHistory));
    };

    const handleSelect = (type, item) => {
        setIsOpen(false);
        setQuery('');
        
        let path = '';
        let label = '';
        let icon = null;

        switch(type) {
            case 'customer':
                path = `/customers/${item.id}`;
                label = `${item.firstName} ${item.lastName}`;
                icon = 'user';
                break;
            case 'vehicle':
                path = `/vehicles/${item.id}`;
                label = `${item.make} ${item.model} (${item.licensePlate})`;
                icon = 'car';
                break;
            case 'job':
                path = `/jobs/${item.id}`;
                label = `${item.jobNumber} - ${item.customerName}`;
                icon = 'wrench';
                break;
            case 'part':
                path = `/inventory`; 
                label = `${item.name} (${item.partNumber})`;
                icon = 'package';
                break;
            default:
                break;
        }

        addToHistory({ id: item.id, type, label, path, icon });
        navigate(path);
    };

    const hasResults = results.customers.length > 0 || results.vehicles.length > 0 || results.jobs.length > 0 || results.parts.length > 0;

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-muted-foreground bg-muted/30 border border-border/50 rounded-xl hover:bg-muted/50 transition-all group"
            >
                <Search size={14} className="group-hover:text-emerald-500 transition-colors" />
                <span>Search everything...</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
                    <div className="sr-only">
                        <DialogTitle>Global Search</DialogTitle>
                        <DialogDescription>Search for customers, vehicles, jobs, and parts.</DialogDescription>
                    </div>

                    <div className="flex items-center border-b border-border/50 px-4 h-14">
                        <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                        <input
                            placeholder="Type to find customers, vehicles, jobs or parts..."
                            className="flex h-full w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground font-bold"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                        {loading && <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />}
                        {!loading && <Command className="h-4 w-4 text-muted-foreground opacity-50" />}
                    </div>
                    
                    <div className="max-h-[450px] overflow-y-auto p-2 custom-scrollbar">
                        {query.length < 2 && history.length > 0 && (
                            <div className="mb-4">
                                <h3 className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                                    <History size={12} /> Recent History
                                </h3>
                                {history.map((item, idx) => (
                                    <SearchResultItem 
                                        key={idx}
                                        icon={item.icon === 'user' ? <User size={16}/> : item.icon === 'car' ? <Car size={16}/> : item.icon === 'wrench' ? <Wrench size={16}/> : <Package size={16}/>}
                                        label={item.label}
                                        onClick={() => {
                                            setIsOpen(false);
                                            navigate(item.path);
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {query.length >= 2 && !hasResults && !loading && (
                            <div className="py-10 text-center">
                                <Search className="mx-auto h-10 w-10 text-muted-foreground opacity-20 mb-3" />
                                <p className="text-sm font-bold text-muted-foreground">No matches found for "{query}"</p>
                            </div>
                        )}

                        {results.customers.length > 0 && (
                            <SearchGroup label="Customers">
                                {results.customers.map(c => (
                                    <SearchResultItem 
                                        key={c.id} 
                                        icon={<User size={16} className="text-blue-500" />} 
                                        label={`${c.firstName} ${c.lastName}`}
                                        sublabel={c.phone}
                                        onClick={() => handleSelect('customer', c)}
                                    />
                                ))}
                            </SearchGroup>
                        )}

                        {results.vehicles.length > 0 && (
                            <SearchGroup label="Vehicles">
                                {results.vehicles.map(v => (
                                    <SearchResultItem 
                                        key={v.id} 
                                        icon={<Car size={16} className="text-amber-500" />} 
                                        label={`${v.make} ${v.model}`}
                                        sublabel={v.licensePlate}
                                        onClick={() => handleSelect('vehicle', v)}
                                    />
                                ))}
                            </SearchGroup>
                        )}

                        {results.jobs.length > 0 && (
                            <SearchGroup label="Jobs">
                                {results.jobs.map(j => (
                                    <SearchResultItem 
                                        key={j.id} 
                                        icon={<Wrench size={16} className="text-emerald-500" />} 
                                        label={j.jobNumber}
                                        sublabel={j.customerName}
                                        onClick={() => handleSelect('job', j)}
                                    />
                                ))}
                            </SearchGroup>
                        )}

                        {results.parts.length > 0 && (
                            <SearchGroup label="Inventory">
                                {results.parts.map(p => (
                                    <SearchResultItem 
                                        key={p.id} 
                                        icon={<Package size={16} className="text-purple-500" />} 
                                        label={p.name}
                                        sublabel={p.partNumber}
                                        onClick={() => handleSelect('part', p)}
                                    />
                                ))}
                            </SearchGroup>
                        )}
                    </div>

                    <div className="flex items-center justify-between border-t border-border/50 px-4 py-2 bg-muted/30">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[10px]">⏎</kbd>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Select</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Navigate</span>
                            </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500/80">Global Discovery</span>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

const SearchGroup = ({ label, children }) => (
    <div className="mb-4 last:mb-0">
        <h3 className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            {label}
        </h3>
        {children}
    </div>
);

const SearchResultItem = ({ icon, label, sublabel, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-emerald-500/10 group transition-all text-left"
    >
        <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-background transition-colors">
                {icon}
            </div>
            <div>
                <p className="text-sm font-bold group-hover:text-emerald-500 transition-colors">{label}</p>
                {sublabel && <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{sublabel}</p>}
            </div>
        </div>
        <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
    </button>
);

export default Omnisearch;
