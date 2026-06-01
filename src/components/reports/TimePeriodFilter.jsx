import React from 'react';
import { Filter, Calendar } from 'lucide-react';
import { TIME_PERIODS } from './constants/reportsConstants';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const TimePeriodFilter = ({ criteria, onCriteriaChange }) => {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Filter size={14} className="text-emerald-500" /> Time Period
                </Label>
                <Select value={criteria.timePeriod} onValueChange={(value) => onCriteriaChange('timePeriod', value)}>
                    <SelectTrigger className="bg-muted/30 border-border/50 h-10">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={TIME_PERIODS.DAILY}>Daily</SelectItem>
                        <SelectItem value={TIME_PERIODS.WEEKLY}>Weekly</SelectItem>
                        <SelectItem value={TIME_PERIODS.MONTHLY}>Monthly</SelectItem>
                        <SelectItem value={TIME_PERIODS.QUARTERLY}>Quarterly</SelectItem>
                        <SelectItem value={TIME_PERIODS.YEARLY}>Yearly</SelectItem>
                        <SelectItem value={TIME_PERIODS.CUSTOM}>Custom Range</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {criteria.timePeriod === TIME_PERIODS.CUSTOM && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Start Date</Label>
                        <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="date"
                                value={criteria.startDate}
                                onChange={(e) => onCriteriaChange('startDate', e.target.value)}
                                className="bg-muted/30 border-border/50 h-10 pl-10"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">End Date</Label>
                        <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="date"
                                value={criteria.endDate}
                                onChange={(e) => onCriteriaChange('endDate', e.target.value)}
                                className="bg-muted/30 border-border/50 h-10 pl-10"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimePeriodFilter;
