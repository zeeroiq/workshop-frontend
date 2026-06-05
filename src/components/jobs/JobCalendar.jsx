import React, { useState } from 'react';
import { 
    ChevronLeft, 
    ChevronRight, 
    Calendar as CalendarIcon, 
    Clock, 
    User, 
    Car,
    ArrowLeft,
    Wrench,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

const JobCalendar = ({ jobs, onSelectJob, onBack }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const navigateMonth = (direction) => {
        const newDate = new Date(currentDate);
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setCurrentDate(newDate);
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const getJobsForDate = (date) => {
        if (!jobs || !Array.isArray(jobs)) return [];
        return jobs.filter(job => {
            if (!job.estimatedCompletion) return false;
            const jobDate = new Date(job.estimatedCompletion);
            return jobDate.toDateString() === date.toDateString();
        });
    };

    const getStatusColor = (status) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('completed') || s.includes('paid')) return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
        if (s.includes('progress')) return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
        if (s.includes('approved')) return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
        return 'bg-muted text-muted-foreground border-border/50';
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDayOfMonth = getFirstDayOfMonth(currentDate);
        const calendarDays = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.push(
                <div key={`empty-${i}`} className="min-h-[120px] bg-muted/5 border border-border/30 opacity-50"></div>
            );
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayJobs = getJobsForDate(date);
            const isToday = new Date().toDateString() === date.toDateString();

            calendarDays.push(
                <div key={day} className={cn(
                    "min-h-[120px] p-2 border border-border/30 transition-colors hover:bg-muted/10",
                    isToday && "bg-emerald-500/[0.03] border-emerald-500/20"
                )}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={cn(
                            "text-xs font-black px-2 py-0.5 rounded-md",
                            isToday ? "bg-emerald-500 text-emerald-950" : "text-muted-foreground/60"
                        )}>{day}</span>
                        {dayJobs.length > 0 && (
                            <span className="text-[10px] font-bold text-muted-foreground">{dayJobs.length} {dayJobs.length === 1 ? 'Job' : 'Jobs'}</span>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        {dayJobs.map(job => (
                            <div
                                key={job.id}
                                onClick={() => onSelectJob(job)}
                                className={cn(
                                    "p-1.5 rounded-lg border text-[10px] cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg active:scale-95 truncate",
                                    getStatusColor(job.status)
                                )}
                            >
                                <div className="flex items-center gap-1 font-black uppercase tracking-tighter mb-0.5">
                                    <Clock size={10} />
                                    {new Date(job.estimatedCompletion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </div>
                                <div className="font-bold truncate">{job.service}</div>
                                <div className="text-[9px] opacity-70 truncate">{job.customer}</div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return calendarDays;
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={onBack} className="h-10 rounded-xl border-border/50 gap-2 font-bold uppercase text-[10px] tracking-widest">
                        <ArrowLeft size={14} /> Back
                    </Button>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                            <CalendarIcon size={24} className="text-emerald-500" /> Dispatch Timeline
                        </h1>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Visualizing workshop throughput</p>
                    </div>
                </div>

                <div className="flex items-center bg-card border border-border/50 rounded-2xl p-1 shadow-sm">
                    <Button variant="ghost" size="icon" onClick={() => navigateMonth('prev')} className="h-9 w-9 rounded-xl hover:bg-muted">
                        <ChevronLeft size={18} />
                    </Button>
                    <div className="px-6 min-w-[200px] text-center">
                        <span className="text-sm font-black uppercase tracking-widest">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => navigateMonth('next')} className="h-9 w-9 rounded-xl hover:bg-muted">
                        <ChevronRight size={18} />
                    </Button>
                </div>
            </div>

            {/* Calendar Body */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden rounded-3xl shadow-xl">
                <CardContent className="p-0">
                    {/* Weekdays Header */}
                    <div className="grid grid-cols-7 bg-muted/20 border-b border-border/30">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="py-4 text-center">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{day}</span>
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 border-l border-t border-border/10">
                        {renderCalendar()}
                    </div>
                </CardContent>
            </Card>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
                <LegendItem color="bg-blue-500" label="In Progress" />
                <LegendItem color="bg-amber-500" label="Approved" />
                <LegendItem color="bg-emerald-500" label="Completed" />
                <LegendItem color="bg-muted-foreground" label="Scheduled" />
            </div>
        </div>
    );
};

const LegendItem = ({ color, label }) => (
    <div className="flex items-center gap-2">
        <div className={cn("h-2.5 w-2.5 rounded-full shadow-sm", color)}></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
);

export default JobCalendar;
