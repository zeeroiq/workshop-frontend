/**
 * Parse Java LocalDateTime array format [year, month, day, hour, minute, second, nanoSeconds]
 * or regular date string/object to JavaScript Date
 */
const parseDate = (dateValue) => {
    if (!dateValue) return null;
    
    // Handle array format from Java LocalDateTime: [year, month(1-12), day, hour, minute, second, nanoSeconds]
    if (Array.isArray(dateValue) && dateValue.length >= 3) {
        const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = dateValue;
        // Month is 1-based from API, JavaScript Date expects 0-based
        // Nano to milliseconds: divide by 1000000
        const millis = Math.floor(nano / 1000000);
        return new Date(year, month - 1, day, hour, minute, second, millis);
    }
    
    // Handle regular date string or Date object
    return new Date(dateValue);
};

export const todayDate = () => {
    return formatDateForInput(new Date().toISOString());
};

export const formatDate = (dateString) => {
    if (!dateString) return 'Not received yet';
    const date = parseDate(dateString);
    if (isNaN(date.getTime())) {
        return 'Invalid date';
    }
    return date.toLocaleDateString();
};


export const formatDateForInput = (date) => {
    if (!date) return '';
    const dte = parseDate(date);
    if (isNaN(dte.getTime())) {
        return '';
    }
    return dte.toISOString().split('T')[0];
}

export const formatDateAsEnUS = (dateString) => {
    if (!dateString) return 'N/A';
    const date = parseDate(dateString);
    if (isNaN(date.getTime())) {
        return 'Invalid date';
    }
    const options = {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
};

export const formatDateTimeAMPM = (dateString) => {
    if (!dateString) return '';
    // The input[type=datetime-local] requires a 'T' separator and no timezone info.
    // It also can't handle more than millisecond precision.
    // Example: "2025-09-27T07:04:09.179"
    const date = parseDate(dateString);
    if (isNaN(date.getTime())) {
        return '';
    }
    // Slice to get YYYY-MM-DDTHH:mm:ss.sss format and then remove the Z
    return date.toISOString().slice(0, 23);
};

// Convert a string to Title Case (e.g., "hello world" -> "Hello World")
export const to_TitleCase = (str) => {
    return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
}

// Convert a string to Upper Case with spaces instead of hyphens/underscores (e.g., "in-progress" -> "In Progress")
export const toUpperCase_space = (str) => {
    return str.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Convert a date string from "YYYY-MM-DD" to "YYYY/MM/DD"
export const to_DateCase = (str) => {
    return str.replace(/-/g, '/');
}
