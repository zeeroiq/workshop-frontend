import React, { useState } from 'react';
import { FaArrowLeft, FaCalendar, FaClock, FaUser, FaCar } from 'react-icons/fa';
import './../../styles/jobs.css';

const JobCalendar = ({ jobs, onSelectJob, onBack }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthNames = ["January", "February", "March", "April", "May", "June",
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
        return jobs.filter(job => {
            const jobDate = new Date(job.estimatedCompletion);
            return jobDate.toDateString() === date.toDateString();
        });
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDayOfMonth = getFirstDayOfMonth(currentDate);
        const calendarDays = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayJobs = getJobsForDate(date);

            calendarDays.push(
                <div key={day} className="calendar-day">
                    <div className="day-number">{day}</div>
                    <div className="day-jobs">
                        {dayJobs.map(job => (
                            <div
                                key={job.id}
                                className={`calendar-job ${job.status}`}
                                onClick={() => onSelectJob(job)}
                            >
                                <div className="job-time">
                                    <FaClock /> {new Date(job.estimatedCompletion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="job-details">
                                    <div className="job-customer">
                                        <FaUser /> {job.customer}
                                    </div>
                                    <div className="job-service">
                                        <FaCar /> {job.service}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return calendarDays;
    };

    return (
        <div className="job-calendar-container">
            <div className="calendar-header">
                <button className="back-button" onClick={onBack}>
                    <FaArrowLeft /> Back to List
                </button>
                <h2>
                    <FaCalendar /> Job Calendar
                </h2>
                <div className="month-navigation">
                    <button onClick={() => navigateMonth('prev')}>&lt; Prev</button>
                    <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                    <button onClick={() => navigateMonth('next')}>Next &gt;</button>
                </div>
            </div>

            <div className="calendar-weekdays">
                <div className="weekday">Sun</div>
                <div className="weekday">Mon</div>
                <div className="weekday">Tue</div>
                <div className="weekday">Wed</div>
                <div className="weekday">Thu</div>
                <div className="weekday">Fri</div>
                <div className="weekday">Sat</div>
            </div>

            <div className="calendar-grid">
                {renderCalendar()}
            </div>

            <div className="calendar-legend">
                <div className="legend-item">
                    <div className="legend-color scheduled"></div>
                    <span>Scheduled</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color in-progress"></div>
                    <span>In Progress</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color completed"></div>
                    <span>Completed</span>
                </div>
            </div>
        </div>
    );
};

export default JobCalendar;