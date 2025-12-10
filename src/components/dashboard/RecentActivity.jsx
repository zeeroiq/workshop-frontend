import React from 'react';
import { FaUser, FaWrench, FaFileInvoiceDollar, FaCar } from 'react-icons/fa';

const RecentActivity = () => {
    const activities = [
        {
            id: 1,
            type: 'New Customer',
            description: 'John Doe registered',
            time: '2 hours ago',
            icon: <FaUser />
        },
        {
            id: 2,
            type: 'Job Completed',
            description: 'Oil change for Jane Smith',
            time: '4 hours ago',
            icon: <FaWrench />
        },
        {
            id: 3,
            type: 'Payment Received',
            description: 'Invoice #1001 paid',
            time: '1 day ago',
            icon: <FaFileInvoiceDollar />
        },
        {
            id: 4,
            type: 'Vehicle Added',
            description: 'New vehicle added to customer profile',
            time: '2 days ago',
            icon: <FaCar />
        }
    ];

    return (
        <div className="recent-activity-list">
            {activities.map(activity => (
                <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                        {activity.icon}
                    </div>
                    <div className="activity-details">
                        <h4>{activity.type}</h4>
                        <p>{activity.description}</p>
                    </div>
                    <div className="activity-time">{activity.time}</div>
                </div>
            ))}
        </div>
    );
};

export default RecentActivity;