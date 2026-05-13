import React, { useMemo, useState } from 'react';
import { useJobStore } from '@/stores/jobStore';
import { Package, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { formatDateShort } from '@/utils/dateFormatting';

/**
 * Parts Dashboard View Component
 * Shows three tables:
 * 1. Parts on Order - Expected delivery dates
 * 2. Awaiting Parts - Jobs blocked by missing parts
 * 3. Delivered Parts - Recently arrived parts
 *
 * @component
 * @returns {React.ReactElement}
 */
export const PartsDashboardView = () => {
  const jobs = useJobStore((state) => state.jobs);
  const [expandedTab, setExpandedTab] = useState('awaiting');

  // Get jobs with parts issues
  const partsData = useMemo(() => {
    const onOrder = [];
    const awaiting = [];
    const delivered = [];

    jobs.forEach((job) => {
      if (job.parts && job.parts.length > 0) {
        job.parts.forEach((part) => {
          const partData = {
            id: `${job.id}-${part.id}`,
            partId: part.id,
            partName: part.name,
            jobId: job.id,
            jobTitle: job.title,
            customer: job.customer?.name,
            quantity: part.quantity,
            expectedDate: part.expectedDate,
            arrivedDate: part.arrivedDate,
            supplier: part.supplier,
            cost: part.cost,
            notes: part.notes,
          };

          if (part.status === 'on_order') {
            onOrder.push(partData);
          } else if (part.status === 'awaiting_approval' || part.status === 'pending') {
            awaiting.push(partData);
          } else if (part.status === 'delivered' || part.arrivedDate) {
            delivered.push(partData);
          }
        });
      }
    });

    return {
      onOrder: onOrder.sort((a, b) => new Date(a.expectedDate) - new Date(b.expectedDate)),
      awaiting: awaiting.sort((a, b) => new Date(b.id) - new Date(a.id)),
      delivered: delivered
        .sort((a, b) => new Date(b.arrivedDate) - new Date(a.arrivedDate))
        .slice(0, 20),
    };
  }, [jobs]);

  const TabContent = ({ title, icon: Icon, data, tab, rowColor }) => (
    <div
      className={`transition-all ${expandedTab === tab ? 'md:col-span-2' : 'md:col-span-1'}`}
    >
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Tab Header */}
        <button
          onClick={() => setExpandedTab(tab)}
          className={`w-full px-4 py-3 flex items-center gap-2 font-semibold transition-colors ${
            expandedTab === tab
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
              : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Icon className="h-5 w-5" />
          {title}
          <span className="ml-auto px-2 py-1 text-xs font-bold rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {data.length}
          </span>
        </button>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <th className="text-left px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">
                  Part
                </th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">
                  Job
                </th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">
                  Customer
                </th>
                {expandedTab === tab && (
                  <>
                    <th className="text-left px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">
                      Qty
                    </th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">
                      Date
                    </th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">
                      Supplier
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((part) => (
                  <tr
                    key={part.id}
                    className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${rowColor}`}
                  >
                    <td className="px-4 py-2">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {part.partName}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        #{part.partId}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-900 dark:text-white">{part.jobId}</td>
                    <td className="px-4 py-2 text-gray-900 dark:text-white">{part.customer}</td>
                    {expandedTab === tab && (
                      <>
                        <td className="px-4 py-2 text-gray-900 dark:text-white">
                          {part.quantity}
                        </td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                          {part.expectedDate
                            ? formatDateShort(part.expectedDate)
                            : part.arrivedDate
                              ? formatDateShort(part.arrivedDate)
                              : '-'}
                        </td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                          {part.supplier}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={expandedTab === tab ? 6 : 3}
                    className="px-4 py-6 text-center text-gray-600 dark:text-gray-400"
                  >
                    No {title.toLowerCase()} parts
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Parts Dashboard</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {partsData.onOrder.length} on order • {partsData.awaiting.length} awaiting •{' '}
          {partsData.delivered.length} delivered recently
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* On Order */}
          <TabContent
            title="Parts On Order"
            icon={Package}
            data={partsData.onOrder}
            tab="onOrder"
            rowColor="hover:bg-orange-50 dark:hover:bg-orange-900/10"
          />

          {/* Awaiting Approval */}
          <TabContent
            title="Awaiting Decision"
            icon={AlertCircle}
            data={partsData.awaiting}
            tab="awaiting"
            rowColor="hover:bg-amber-50 dark:hover:bg-amber-900/10"
          />

          {/* Recently Delivered */}
          <TabContent
            title="Recently Delivered"
            icon={CheckCircle}
            data={partsData.delivered}
            tab="delivered"
            rowColor="hover:bg-green-50 dark:hover:bg-green-900/10"
          />
        </div>

        {/* Summary */}
        {partsData.onOrder.length === 0 &&
          partsData.awaiting.length === 0 &&
          partsData.delivered.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No parts</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No parts issues to track at this time
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default PartsDashboardView;
