import React, { useMemo, useState } from 'react';
import { X, ChevronDown, Phone, Mail, MapPin, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import { TechnicianAvatar } from '@/components/ui/technician-avatar';
import { formatDateFull, formatTimeRange } from '@/utils/dateFormatting';
import EditJobModal from '@/components/modals/EditJobModal';
import useJobStore from '@/stores/jobStore';

/**
 * Job Detail Panel Component
 * Shows comprehensive job information in a side panel
 * Displays customer, vehicle, service, technician, parts, and history
 *
 * @component
 * @param {object} job - Job object with all details
 * @param {function} onClose - Callback when panel closed
 * @param {function} onEdit - Callback to edit job
 * @param {function} onStatusChange - Callback to change job status
 * @param {boolean} isOpen - Whether panel is visible
 * @returns {React.ReactElement}
 */
export const JobDetailPanel = ({
  job,
  onClose = null,
  onEdit = null,
  onStatusChange = null,
  isOpen = true,
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const updateJob = useJobStore((s) => s.updateJob);

  if (!isOpen || !job) return null;

  const technicians = useMemo(
    () =>
      job.assignedTechnicians?.map((id) => ({
        id,
        name: `Tech ${id}`,
      })) || [],
    [job.assignedTechnicians]
  );

  const SectionTitle = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-2 px-4 py-3 mt-4 border-t border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-white">
      {Icon && <Icon className="h-4 w-4" />}
      {title}
    </div>
  );

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-lg z-40 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex items-start justify-between gap-2">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{job.id}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{job.title}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          aria-label="Close panel"
        >
          <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
          <StatusBadge status={job.status} />
        </div>

        {/* Date & Time */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Scheduled
          </h3>
          <p className="text-sm text-gray-900 dark:text-white">
            {formatDateFull(job.date)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatTimeRange(job.startTime, job.endTime)}
          </p>
        </div>

        {/* Priority */}
        {job.priority && (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
              {job.priority.toUpperCase()} Priority
            </span>
          </div>
        )}

        {/* Customer Section */}
        {job.customer && (
          <>
            <SectionTitle title="Customer" icon={Phone} />
            <div className="px-4 space-y-2">
              <p className="font-medium text-gray-900 dark:text-white">{job.customer.name}</p>
              {job.customer.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="h-4 w-4" />
                  {job.customer.phone}
                </div>
              )}
              {job.customer.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4" />
                  {job.customer.email}
                </div>
              )}
              {job.customer.address && (
                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {job.customer.address}
                </div>
              )}
            </div>
          </>
        )}

        {/* Vehicle Section */}
        {job.vehicle && (
          <>
            <SectionTitle title="Vehicle" />
            <div className="px-4 space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {job.vehicle.year} {job.vehicle.make} {job.vehicle.model}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {job.vehicle.registration}
                </p>
              </div>
              {job.vehicle.mileage && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mileage: {job.vehicle.mileage.toLocaleString()} km
                </p>
              )}
              {job.vehicle.vin && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  VIN: {job.vehicle.vin}
                </p>
              )}
            </div>
          </>
        )}

        {/* Service Section */}
        {job.service && (
          <>
            <SectionTitle title="Service" />
            <div className="px-4 space-y-2">
              <p className="text-sm text-gray-900 dark:text-white">{job.service}</p>
              {job.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{job.description}</p>
              )}
            </div>
          </>
        )}

        {/* Technicians Section */}
        {technicians.length > 0 && (
          <>
            <SectionTitle title={`Technicians (${technicians.length})`} />
            <div className="px-4 space-y-2">
              {technicians.map((tech) => (
                <div key={tech.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <TechnicianAvatar technician={tech} size="sm" />
                  <span className="text-sm text-gray-900 dark:text-white">{tech.name}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Parts Section */}
        {job.parts && job.parts.length > 0 && (
          <>
            <SectionTitle title={`Parts (${job.parts.length})`} icon={AlertCircle} />
            <div className="px-4 space-y-2">
              {job.parts.map((part) => (
                <div key={part.id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {part.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Qty: {part.quantity} • {part.status}
                  </p>
                  {part.expectedDate && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Expected: {part.expectedDate}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Cost Section */}
        {job.cost && (
          <>
            <SectionTitle title="Cost" icon={DollarSign} />
            <div className="px-4 space-y-1">
              {job.cost.labor && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Labor:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{job.cost.labor.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              {job.cost.parts && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Parts:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{job.cost.parts.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              {job.cost.total && (
                <div className="flex justify-between text-sm border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                  <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ₹{job.cost.total.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Notes Section */}
        {job.notes && (
          <>
            <SectionTitle title="Notes" />
            <div className="px-4 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {job.notes}
            </div>
          </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex gap-2">
        <button
          onClick={() => { setIsEditOpen(true); onEdit?.(job); }}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onStatusChange?.(job)}
          className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Change Status
        </button>
      </div>

      {/* Edit Modal */}
      <EditJobModal
        job={job}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={async (updatedJob) => {
          try {
            await updateJob(updatedJob.id, updatedJob);
            setIsEditOpen(false);
          } catch (err) {
            console.error('Failed to update job from modal:', err);
          }
        }}
      />

    </div>
  );
};

/**
 * Inline Job Detail Panel (direct styling)
 */
export const JobDetailPanelInline = ({ job, onClose = null, isOpen = true }) => {
  if (!isOpen || !job) return null;

  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        width: '24rem',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #e5e7eb',
        boxShadow: '0 20px 25px rgba(0,0,0,0.1)',
        zIndex: 40,
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {job.id}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{job.title}</p>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '0.5rem',
            backgroundColor: '#f3f4f6',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '1rem' }}>
        <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
          Status: <strong>{job.status}</strong>
        </div>

        {job.customer && (
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Customer
            </h3>
            <p style={{ fontSize: '0.875rem' }}>{job.customer.name}</p>
            {job.customer.phone && (
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{job.customer.phone}</p>
            )}
          </div>
        )}

        {job.vehicle && (
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Vehicle
            </h3>
            <p style={{ fontSize: '0.875rem' }}>
              {job.vehicle.year} {job.vehicle.make} {job.vehicle.model}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              {job.vehicle.registration}
            </p>
          </div>
        )}

        {job.service && (
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Service
            </h3>
            <p style={{ fontSize: '0.875rem' }}>{job.service}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetailPanel;
