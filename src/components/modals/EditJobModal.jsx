import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Job Form Schema for validation
 */
const jobFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().optional(),
  customerName: z.string().min(2, 'Customer name required'),
  customerPhone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  customerEmail: z.string().email('Invalid email').optional(),
  vehicleRegistration: z.string().min(1, 'Vehicle registration required'),
  vehicleMake: z.string().min(1, 'Vehicle make required'),
  vehicleModel: z.string().min(1, 'Vehicle model required'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  bayId: z.string().min(1, 'Bay selection required'),
  priority: z.enum(['low', 'medium', 'high']),
  serviceType: z.string().min(1, 'Service type required'),
  laborCost: z.coerce.number().min(0, 'Labor cost cannot be negative'),
  notes: z.string().optional(),
});

type JobFormData = z.infer<typeof jobFormSchema>;

/**
 * Edit Job Modal Component
 * Form for editing existing job details
 * Validates all fields before submission
 *
 * @component
 * @param {object} job - Job object to edit
 * @param {array} bays - Available bays
 * @param {function} onSave - Callback on save (receives updated job)
 * @param {function} onClose - Callback on close
 * @param {boolean} isOpen - Whether modal is visible
 * @returns {React.ReactElement}
 */
export const EditJobModal = ({
  job,
  bays = [],
  onSave = null,
  onClose = null,
  isOpen = true,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: job?.title || '',
      description: job?.description || '',
      customerName: job?.customer?.name || '',
      customerPhone: job?.customer?.phone || '',
      customerEmail: job?.customer?.email || '',
      vehicleRegistration: job?.vehicle?.registration || '',
      vehicleMake: job?.vehicle?.make || '',
      vehicleModel: job?.vehicle?.model || '',
      startTime: job?.startTime || '09:00',
      endTime: job?.endTime || '10:00',
      bayId: job?.bayId || '',
      priority: job?.priority || 'medium',
      serviceType: job?.serviceType || '',
      laborCost: job?.cost?.labor || 0,
      notes: job?.notes || '',
    },
  });

  const onSubmit = async (data: JobFormData) => {
    if (onSave) {
      const updatedJob = {
        ...job,
        title: data.title,
        description: data.description,
        customer: {
          name: data.customerName,
          phone: data.customerPhone,
          email: data.customerEmail,
        },
        vehicle: {
          ...job?.vehicle,
          registration: data.vehicleRegistration,
          make: data.vehicleMake,
          model: data.vehicleModel,
        },
        startTime: data.startTime,
        endTime: data.endTime,
        bayId: data.bayId,
        priority: data.priority,
        serviceType: data.serviceType,
        cost: {
          ...job?.cost,
          labor: data.laborCost,
        },
        notes: data.notes,
      };
      await onSave(updatedJob);
      reset();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Job {job?.id}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Job Details Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Job Details</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Job Title *
              </label>
              <Input
                {...register('title')}
                placeholder="e.g., Oil Change & Filter"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                placeholder="Additional notes about this job..."
                rows={3}
                className={cn(
                  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg',
                  'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority *
                </label>
                <select
                  {...register('priority')}
                  className={cn(
                    'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg',
                    'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  )}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Service Type *
                </label>
                <Input
                  {...register('serviceType')}
                  placeholder="e.g., Maintenance"
                  className={errors.serviceType ? 'border-red-500' : ''}
                />
              </div>
            </div>
          </div>

          {/* Customer Section */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Customer</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <Input
                {...register('customerName')}
                placeholder="Customer name"
                className={errors.customerName ? 'border-red-500' : ''}
              />
              {errors.customerName && (
                <p className="text-xs text-red-600 mt-1">{errors.customerName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone *
                </label>
                <Input
                  {...register('customerPhone')}
                  placeholder="10-digit phone"
                  className={errors.customerPhone ? 'border-red-500' : ''}
                />
                {errors.customerPhone && (
                  <p className="text-xs text-red-600 mt-1">{errors.customerPhone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <Input
                  {...register('customerEmail')}
                  type="email"
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Section */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Vehicle</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Registration *
              </label>
              <Input
                {...register('vehicleRegistration')}
                placeholder="Registration plate"
                className={errors.vehicleRegistration ? 'border-red-500' : ''}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Make *
                </label>
                <Input
                  {...register('vehicleMake')}
                  placeholder="e.g., Maruti"
                  className={errors.vehicleMake ? 'border-red-500' : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Model *
                </label>
                <Input
                  {...register('vehicleModel')}
                  placeholder="e.g., Swift"
                  className={errors.vehicleModel ? 'border-red-500' : ''}
                />
              </div>
            </div>
          </div>

          {/* Scheduling Section */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Schedule</h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bay *
                </label>
                <select
                  {...register('bayId')}
                  className={cn(
                    'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg',
                    'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                    errors.bayId ? 'border-red-500' : ''
                  )}
                >
                  <option value="">Select bay</option>
                  {bays.map((bay) => (
                    <option key={bay.id} value={bay.id}>
                      {bay.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Time *
                </label>
                <Input
                  {...register('startTime')}
                  type="time"
                  className={errors.startTime ? 'border-red-500' : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Time *
                </label>
                <Input
                  {...register('endTime')}
                  type="time"
                  className={errors.endTime ? 'border-red-500' : ''}
                />
              </div>
            </div>
          </div>

          {/* Cost Section */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Cost</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Labor Cost (₹) *
              </label>
              <Input
                {...register('laborCost')}
                type="number"
                step="0.01"
                placeholder="0.00"
                className={errors.laborCost ? 'border-red-500' : ''}
              />
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notes</h3>

            <textarea
              {...register('notes')}
              placeholder="Internal notes..."
              rows={3}
              className={cn(
                'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg',
                'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                'focus:outline-none focus:ring-2 focus:ring-blue-500'
              )}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJobModal;
