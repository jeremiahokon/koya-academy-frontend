import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to get status badge styling
export function getStatusClassName(status: string): string {
  switch (status) {
    case 'Ongoing':
      return 'bg-[#D9F5F8] text-[#36DCEE] border-[#36DCEE33]';
    case 'Pending':
    case 'Inactive':
      return 'bg-[#F9E8CC] text-[#EAA337] border-[#EAA33733]';
    case 'Completed':
    case 'Successful':
    case 'Active':
      return 'bg-[#DBFAE4] text-[#00992B] border-[#00992B33]';
    case 'Cancelled':
    case 'Failed':
      return 'bg-[#FBDCDC] text-[#AF0808] border-[#AF080833]';
    default:
      return '';
  }
}

// Helper function to get tag badge styling
export function getTagClassName(tag: string): string {
  switch (tag) {
    case 'Quote Request':
      return 'bg-[#F6F1FB] text-[#5B0ABF] border-[#5B0ABF33]';
    case 'New Order':
      return 'bg-[#E0F0F9] text-[#0169A0] border-[#0169A033]';
    case 'Refill':
      return 'bg-green-100 text-green-600 border-green-600/30';
    case 'Urgent':
      return 'bg-red-100 text-red-600 border-red-600/30';
    default:
      return '';
  }
}

export function formatCurrency(amount: number): string {
  return `N${amount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const formatPercentage = (value: number): string =>
  value >= 0 ? `${value}%` : `${value}%`;
