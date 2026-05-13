import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validateJobScheduling } from '@/utils/conflictDetection';

/**
 * Create Job Form Schema
 */
const createJobFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().optional(),
  customerName: z.string().min(2, 'Customer name required'),
  customerPhone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  customerEmail: z.string().email('Invalid email').optional(),
  vehicleRegistration: z.string().min(1, 'Vehicle registration required'),
  vehicleMake: z.string().min(1, 'Vehicle make required'),
  vehicleModel: z.string().min(1, 'Vehicle model required'),
  vehicleYear: z.coerce.number().min(1900).max(2100),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  date: z.string().refine((date) => new Date(date) >= new Date().setHours(0, 0, 0, 0), {
    message: 'Cannot schedule in the past',
  }),
  bayId: z.string().min(1, 'Bay selection required'),
  priority: z.enum(['low', 'medium', 'high']),
  serviceType: z.string().min(1, 'Service type required'),
  laborCost: z.coerce.number().min(0),
  partsCost: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

type CreateJobFormData = z.infer<typeof createJobFormSchema>;

/**
 * Create Job Modal Component
 * Form for creating a new job with full validation
 * Checks for scheduling conflicts
 *
 * @component
 * @param {array} bays - Available bays
 * @param {array} existingJobs - List of existing jobs (for conflict checking)
 * @param {function} onCreate - Callback on create (receives new job data)
 * @param {function} onClose - Callback on close
 * @param {boolean} isOpen - Whether modal is visible
 * @returns {React.ReactElement}
 */
export const CreateJobModal = ({
  bays = [],
  existingJobs = [],
  onCreate = null,
  onClose = null,
  isOpen = true,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<CreateJobFormData>({
    resolver: zodResolver(createJobFormSchema),
    defaultValues: {
      priority: 'medium',
      laborCost: 0,
      partsCost: 0,
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
    },
  });

  const watchedDate = watch('date');
  const watchedStartTime = watch('startTime');
  const watchedEndTime = watch('endTime');
  const watchedBayId = watch('bayId');

  const onSubmit = async (data: CreateJobFormData) => {
    // Check for scheduling conflicts
    const conflictCheck = validateJobScheduling({
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      bayId: data.bayId,
      existingJobs: existingJobs,
    });

    if (!conflictCheck.isValid) {
      setError('root', {
        message: conflictCheck.errors.join('; '),
      });
      return;
    }

    if (onCreate) {
      const newJob = {
        id: `WO-${Date.now()}`,
        title: data.title,
        description: data.description,
        customer: {
          name: data.customerName,
          phone: data.customerPhone,
          email: data.customerEmail,
        },
        vehicle: {
          registration: data.vehicleRegistration,
          make: data.vehicleMake,
          model: data.vehicleModel,
          year: data.vehicleYear,
        },
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        bayId: data.bayId,
        priority: data.priority,
        serviceType: data.serviceType,
        status: 'scheduled',
        cost: {
          labor: data.laborCost,
          parts: data.partsCost || 0,
          total: data.laborCost + (data.partsCost || 0),
        },
        notes: data.notes,
        createdAt: new Date().toISOString(),
      };

      await onCreate(newJob);
      reset();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Job</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Error Alert */}
          {errors.root && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{errors.root.message}</p>
            </div>
          )}

          {/* Job Details */}
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
                <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                placeholder="Additional details..."
                rows={2}
                className={cn(
                  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg',
                  'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
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

          {/* Customer */}
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

          {/* Vehicle */}
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

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Year *
                </label>
                <Input
                  {...register('vehicleYear')}
                  type="number"
                  min="1900"
                  placeholder="2023"
                  className={errors.vehicleYear ? 'border-red-500' : ''}
                />
              </div>

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

          {/* Schedule */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Schedule</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date *
              </label>
              <Input
                {...register('date')}
                type="date"
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && (
                <p className="text-xs text-red-600 mt-1">{errors.date.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bay *
                </label>
                <select
                  {...register('bayId')}
                  className={cn(
                    'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg',
                    'bg-white dark:bg-gray-800',
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

          {/* Cost */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Cost</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Labor (₹) *
                </label>
                <Input
                  {...register('laborCost')}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={errors.laborCost ? 'border-red-500' : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parts (₹)
                </label>
                <Input
                  {...register('partsCost')}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <textarea
              {...register('notes')}
              placeholder="Internal notes..."
              rows={2}
              className={cn(
                'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg',
                'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
              )}
            />
          </div>

          {/* Actions */}
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
              {isSubmitting ? 'Creating...' : 'Create Job'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobModal;
