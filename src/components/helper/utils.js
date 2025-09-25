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