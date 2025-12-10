import React from 'react';
import { FaFilter } from 'react-icons/fa';
import { TIME_PERIODS } from './constants/reportsConstants';

/**
 * A reusable component for selecting a time period for reports.
 * @param {object} props
 * @param {object} props.criteria - The current criteria state from the parent component.
 * @param {function(field: string, value: any): void} props.onCriteriaChange - The handler to update criteria in the parent.
 */
const TimePeriodFilter = ({ criteria, onCriteriaChange }) => {
    return (
        <>
            <div className="filter-group">
                <label>
                    <FaFilter /> Time Period
                </label>
                <select
                    value={criteria.timePeriod}
                    onChange={(e) => onCriteriaChange('timePeriod', e.target.value)}
                >
                    <option value={TIME_PERIODS.DAILY}>Daily</option>
                    <option value={TIME_PERIODS.WEEKLY}>Weekly</option>
                    <option value={TIME_PERIODS.MONTHLY}>Monthly</option>
                    <option value={TIME_PERIODS.QUARTERLY}>Quarterly</option>
                    <option value={TIME_PERIODS.YEARLY}>Yearly</option>
                    <option value={TIME_PERIODS.CUSTOM}>Custom Range</option>
                </select>
            </div>

            {criteria.timePeriod === TIME_PERIODS.CUSTOM && (
                <>
                    <div className="filter-group">
                        <label>Start Date</label>
                        <input
                            type="date"
                            value={criteria.startDate}
                            onChange={(e) => onCriteriaChange('startDate', e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label>End Date</label>
                        <input
                            type="date"
                            value={criteria.endDate}
                            onChange={(e) => onCriteriaChange('endDate', e.target.value)}
                        />
                    </div>
                </>
            )}
        </>
    );
};

export default TimePeriodFilter;