export const todayDate = () => {
    return formatDateForInput(new Date().toISOString());
};

export const formatDate = (dateString) => {
    if (!dateString) return 'Not received yet';
    return new Date(dateString).toLocaleDateString();
};


export const formatDateForInput = (date) => {
    if (!date) return '';
    const dte = new Date(date);
    if (isNaN(dte.getTime())) {
        return '';
    }
    return dte.toISOString().split('T')[0];
}

export const formatDateAsEnUS = (dateString) => {
    const options = {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

export const formatDateTimeAMPM = (dateString) => {
    if (!dateString) return '';
    // The input[type=datetime-local] requires a 'T' separator and no timezone info.
    // It also can't handle more than millisecond precision.
    // Example: "2025-09-27T07:04:09.179"
    const date = new Date(dateString);
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
