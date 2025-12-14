/**
 * Theme Color Configuration - Artem Light Theme
 * Centralized color management for status, states, and semantic colors
 */

export const themeColors = {
  // Status colors for general use
  status: {
    active: {
      hex: '#10b981', // emerald-500
      tailwind: 'bg-emerald-100 text-emerald-800',
      bg: 'bg-emerald-50',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    pending: {
      hex: '#f59e0b', // amber-500
      tailwind: 'bg-amber-100 text-amber-800',
      bg: 'bg-amber-50',
      badge: 'bg-amber-100 text-amber-800',
      border: 'bg-amber-50 border-amber-200',
    },
    approved: {
      hex: '#10b981', // emerald-500
      tailwind: 'bg-emerald-100 text-emerald-800',
      bg: 'bg-emerald-50',
      badge: 'bg-emerald-100 text-emerald-800',
      border: 'bg-emerald-50 border-emerald-200',
    },
    rejected: {
      hex: '#ef4444', // red-500
      tailwind: 'bg-red-100 text-red-800',
      bg: 'bg-red-50',
      badge: 'bg-red-100 text-red-800',
      border: 'bg-red-50 border-red-200',
    },
    declined: {
      hex: '#ef4444', // red-500
      tailwind: 'bg-red-100 text-red-800',
      bg: 'bg-red-50',
      badge: 'bg-red-100 text-red-800',
      border: 'bg-red-50 border-red-200',
    },
    inactive: {
      hex: '#6b7280', // gray-500
      tailwind: 'bg-gray-100 text-gray-800',
      bg: 'bg-gray-50',
      badge: 'bg-gray-100 text-gray-800',
      border: 'bg-gray-50 border-gray-200',
    },
    default: {
      hex: '#6b7280', // gray-500
      tailwind: 'bg-gray-100 text-gray-800',
      bg: 'bg-gray-50',
      badge: 'bg-gray-100 text-gray-800',
      border: 'bg-gray-50 border-gray-200',
    },
  },

  // Attendance-specific colors
  attendance: {
    present: {
      hex: '#10b981', // emerald-500
      tailwind: 'bg-emerald-100 text-emerald-800',
    },
    late: {
      hex: '#f59e0b', // amber-500
      tailwind: 'bg-amber-100 text-amber-800',
    },
    absent: {
      hex: '#ef4444', // red-500
      tailwind: 'bg-red-100 text-red-800',
    },
    notMarked: {
      hex: '#9ca3af', // gray-400
      tailwind: 'bg-gray-100 text-gray-800',
    },
  },

  // Assignment/Assessment type colors
  assignmentType: {
    theory: {
      hex: '#3b82f6', // blue-500
      tailwind: 'bg-blue-100 text-blue-800',
    },
    mcq: {
      hex: '#a855f7', // purple-500
      tailwind: 'bg-purple-100 text-purple-800',
    },
    practical: {
      hex: '#f59e0b', // amber-500
      tailwind: 'bg-amber-100 text-amber-800',
    },
  },

  // Payment-specific colors
  payment: {
    pending: {
      hex: '#f59e0b', // amber-500
      tailwind: 'bg-amber-100 text-amber-800',
    },
    realized: {
      hex: '#10b981', // emerald-500
      tailwind: 'bg-emerald-100 text-emerald-800',
    },
    cancelled: {
      hex: '#ef4444', // red-500
      tailwind: 'bg-red-100 text-red-800',
    },
    bounced: {
      hex: '#ef4444', // red-500
      tailwind: 'bg-red-100 text-red-800',
    },
    cheque: {
      hex: '#3b82f6', // blue-500
      tailwind: 'bg-blue-100 text-blue-800',
    },
    cash: {
      hex: '#10b981', // emerald-500
      tailwind: 'bg-emerald-100 text-emerald-800',
    },
    upi: {
      hex: '#6366f1', // indigo-500
      tailwind: 'bg-indigo-100 text-indigo-800',
    },
  },

  // PTM Request specific colors
  ptmRequest: {
    pending: {
      hex: '#f59e0b', // amber-500
      bg: 'bg-amber-50 border-amber-200',
      badge: 'bg-amber-100 text-amber-800',
    },
    awaitingParent: {
      hex: '#3b82f6', // blue-500
      bg: 'bg-blue-50 border-blue-200',
      badge: 'bg-blue-100 text-blue-800',
    },
    approved: {
      hex: '#10b981', // emerald-500
      bg: 'bg-emerald-50 border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    declined: {
      hex: '#ef4444', // red-500
      bg: 'bg-red-50 border-red-200',
      badge: 'bg-red-100 text-red-800',
    },
  },

  // Leave application specific colors
  leave: {
    pending: {
      hex: '#f59e0b', // amber-500
      bg: 'bg-amber-50 border-amber-200',
      badge: 'bg-amber-100 text-amber-800',
    },
    approved: {
      hex: '#10b981', // emerald-500
      bg: 'bg-emerald-50 border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    rejected: {
      hex: '#ef4444', // red-500
      bg: 'bg-red-50 border-red-200',
      badge: 'bg-red-100 text-red-800',
    },
  },

  // Admission specific colors
  admission: {
    active: {
      hex: '#10b981', // emerald-500
      tailwind: 'bg-emerald-100 text-emerald-800',
    },
    pending: {
      hex: '#f59e0b', // amber-500
      tailwind: 'bg-amber-100 text-amber-800',
    },
    rejected: {
      hex: '#ef4444', // red-500
      tailwind: 'bg-red-100 text-red-800',
    },
  },

  // Role display colors
  role: {
    admin: {
      bg: 'bg-indigo-500/20',
      text: 'text-indigo-400',
    },
    student: {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
    },
    parent: {
      bg: 'bg-purple-500/20',
      text: 'text-purple-400',
    },
    employee: {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
    },
    frontDesk: {
      bg: 'bg-teal-500/20',
      text: 'text-teal-400',
    },
  },

  // Dark mode backgrounds (for login/register)
  dark: {
    card: '#1f2937', // gray-800
  },
};

/**
 * Helper function to get hex color for dynamic inline styles
 */
export function getStatusColorHex(
  status: string,
  category: keyof typeof themeColors = 'status'
): string {
  const statusLower = status.toLowerCase().replace(/\s+/g, '');
  const categoryMap = themeColors[category] as Record<string, any>;
  
  if (categoryMap[statusLower]?.hex) {
    return categoryMap[statusLower].hex;
  }
  
  // Try with underscore replacement for CONSTANT_CASE
  const withUnderscores = status.toLowerCase().replace(/\s+/g, '_');
  if (categoryMap[withUnderscores]?.hex) {
    return categoryMap[withUnderscores].hex;
  }
  
  return themeColors.status.default.hex;
}

/**
 * Helper function to get Tailwind classes for status badges
 */
export function getStatusTailwindClass(
  status: string,
  category: keyof typeof themeColors = 'status',
  variant: 'badge' | 'bg' | 'tailwind' = 'badge'
): string {
  const statusLower = status.toLowerCase().replace(/\s+/g, '');
  const categoryMap = themeColors[category] as Record<string, any>;
  
  if (categoryMap[statusLower]?.[variant]) {
    return categoryMap[statusLower][variant];
  }
  
  // Try with underscore replacement
  const withUnderscores = status.toLowerCase().replace(/\s+/g, '_');
  if (categoryMap[withUnderscores]?.[variant]) {
    return categoryMap[withUnderscores][variant];
  }
  
  return themeColors.status.default[variant] || themeColors.status.default.badge;
}

export type ThemeColorCategory = keyof typeof themeColors;
export type StatusVariant = 'badge' | 'bg' | 'tailwind' | 'hex' | 'border';
