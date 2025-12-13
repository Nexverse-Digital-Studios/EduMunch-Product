/**
 * UI Configuration - Design System Settings
 * Based on VRaZ reference design
 */

export const uiConfig = {
  // Color palette
  colors: {
    card: {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        icon: 'bg-blue-100 text-blue-600',
      },
      green: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        icon: 'bg-emerald-100 text-emerald-600',
      },
      purple: {
        bg: 'bg-violet-50',
        text: 'text-violet-700',
        icon: 'bg-violet-100 text-violet-600',
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        icon: 'bg-orange-100 text-orange-600',
        border: 'border-2 border-orange-300',
      },
      red: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        icon: 'bg-red-100 text-red-600',
      },
      yellow: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        icon: 'bg-amber-100 text-amber-600',
      },
      teal: {
        bg: 'bg-teal-50',
        text: 'text-teal-700',
        icon: 'bg-teal-100 text-teal-600',
      },
    },
    primary: {
      50: '#EEF2FF',
      100: '#E0E7FF',
      500: '#6366F1',
      600: '#4F46E5',
      700: '#4338CA',
    },
    sidebar: {
      bg: 'bg-white',
      border: 'border-gray-200',
      active: 'bg-indigo-50 text-indigo-600',
      hover: 'hover:bg-gray-50',
      text: 'text-gray-600',
    },
  },

  // Spacing
  spacing: {
    card: {
      padding: 'p-5',
      gap: 'gap-4',
      radius: 'rounded-2xl',
    },
    layout: {
      sidebarWidth: {
        expanded: 'w-64',
        collapsed: 'w-20',
      },
      navbarHeight: 'h-16',
      contentPadding: 'px-4 sm:px-6 lg:px-8',
    },
  },

  // Typography
  typography: {
    welcome: {
      title: 'text-2xl font-bold text-gray-900',
      subtitle: 'text-sm text-gray-500',
    },
    card: {
      label: 'text-sm font-medium',
      value: 'text-3xl font-bold text-gray-900',
    },
    section: {
      heading: 'text-lg font-bold text-gray-900',
    },
  },

  // Animation
  animation: {
    fadeIn: 'animate-fade-in',
    slideInLeft: 'animate-slide-in-left',
    slideInRight: 'animate-slide-in-right',
  },

  // Components
  components: {
    button: {
      primary: 'bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-sm',
      secondary: 'border-2 border-indigo-600 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors font-medium',
      ghost: 'border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium',
    },
    input: {
      base: 'bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all',
    },
    dropdown: {
      base: 'bg-white border border-gray-200 rounded-xl shadow-lg',
      item: 'px-4 py-2 hover:bg-gray-50 transition-colors',
    },
  },
};

export type CardColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow' | 'teal';
