import React from 'react';
import { FaFilter } from 'react-icons/fa';
import { TIME_PERIODS } from './constants/reportsConstants';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const TimePeriodFilter = ({ criteria, onCriteriaChange }) => {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>
                    <FaFilter className="inline-block mr-2" /> Time Period
                </Label>
                <Select
                    value={criteria.timePeriod}
                    onValueChange={(value) => onCriteriaChange('timePeriod', value)}
                >
                    <SelectTrigger>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                            type="date"
                            value={criteria.startDate}
                            onChange={(e) => onCriteriaChange('startDate', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                            type="date"
                            value={criteria.endDate}
                            onChange={(e) => onCriteriaChange('endDate', e.target.value)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimePeriodFilter;
