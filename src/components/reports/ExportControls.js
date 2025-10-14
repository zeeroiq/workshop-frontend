import React, {useState} from 'react';
import {FaDownload} from 'react-icons/fa';
import {EXPORT_FORMATS} from './constants/reportsConstants';
import {reportsService} from '../../services/reportsService';
import {toast} from 'react-toastify';

/**
 * A reusable component for report export buttons and logic.
 * @param {object} props
 * @param {function(): object} props.getCriteria - A function that returns the current report criteria object.
 * @param {Array<'PDF'|'EXCEL'|'CSV'>} [props.formats=['PDF', 'EXCEL', 'CSV']] - The export formats to display.
 */
const ExportControls = ({getCriteria, formats = ['PDF', 'EXCEL', 'CSV']}) => {
    const [exporting, setExporting] = useState(null); // null, 'PDF', 'EXCEL', 'CSV'

    const handleExport = async (format) => {
        if (exporting) return;

        setExporting(format);
        try {
            const criteria = getCriteria();
            const exportRequest = {...criteria, format};

            const {blob, filename} = await reportsService.exportReport(exportRequest);

            // Create a download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            let fileExtension = format.toLowerCase();
            if (format === EXPORT_FORMATS.EXCEL) fileExtension = 'xlsx';

            link.setAttribute('download', `${filename}.${fileExtension}`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
            toast.success(`Report exported as ${format}.`);
        } catch (error) {
            console.error('Error exporting report:', error);
            toast.error(`Failed to export report as ${format}.`);
        } finally {
            setExporting(null);
        }
    };

    return (
        <div className="export-buttons">
            {
                formats.map(format => {
                    const formatKey = format.toUpperCase();
                    const formatValue = EXPORT_FORMATS[formatKey];
                    if (!formatValue) return null;

                    return (
                        <button
                            key={formatValue}
                            onClick={() => handleExport(formatValue)}
                            disabled={!!exporting}
                        >
                            <FaDownload/> {exporting === formatValue ? 'Exporting...' : format}
                        </button>
                    );
                })
            }
        </div>
    );
};

export default ExportControls;