import React from "react";
import {toUpperCase_space} from "../../helper/utils";


export const getStatusBadge = (status) => {
    switch(status) {
        case 'scheduled':
            return <span className="status-badge scheduled">{toUpperCase_space(status)}</span>;
        case 'in-progress':
            return <span className="status-badge in-progress">{toUpperCase_space(status)}</span>;
        case 'completed':
            return <span className="status-badge completed">{toUpperCase_space(status)}</span>;
        default:
            return <span className="status-badge default">{toUpperCase_space(status)}</span>;
    }
};