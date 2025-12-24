import React, { useState } from 'react';
import { FaDownload } from 'react-icons/fa';
import { EXPORT_FORMATS } from './constants/reportsConstants';
import { reportsService } from '@/services/reportsService';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';

const ExportControls = ({ getCriteria, formats = ['PDF', 'EXCEL', 'CSV'] }) => {
    const [exporting, setExporting] = useState(null);

    const handleExport = async (format) => {
        if (exporting) return;

        setExporting(format);
        try {
            const criteria = getCriteria();
            const exportRequest = { ...criteria, format };

            const { blob, filename } = await reportsService.exportReport(exportRequest);

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
        <div className="flex space-x-2">
            {formats.map(format => {
                const formatKey = format.toUpperCase();
                const formatValue = EXPORT_FORMATS[formatKey];
                if (!formatValue) return null;

                return (
                    <Button
                        key={formatValue}
                        onClick={() => handleExport(formatValue)}
                        disabled={!!exporting}
                        variant="outline"
                        size="sm"
                    >
                        <FaDownload className="mr-2" />
                        {exporting === formatValue ? 'Exporting...' : format}
                    </Button>
                );
            })}
        </div>
    );
};

export default ExportControls;
