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