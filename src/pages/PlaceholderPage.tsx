import { Plus, Search, Filter } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  action?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  action = 'Create New',
}) => {
  return (
    <div className="space-y-6 animate-slide-in-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">{title}</h1>
          <p className="text-gray-600 dark:text-dark-text-secondary mt-1">{description}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-medium">
          <Plus className="w-5 h-5" />
          {action}
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400 dark:text-dark-text-secondary w-5 h-5" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-400 dark:placeholder-dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary hover:bg-gray-50 dark:hover:bg-dark-surface-primary transition-colors text-gray-700 dark:text-dark-text-primary">
          <Filter className="w-5 h-5" />
          Filter
        </button>
      </div>

      {/* Empty State */}
      <div className="bg-white dark:bg-dark-surface-primary rounded-lg border border-gray-200 dark:border-dark-border-primary p-12 text-center">
        <div className="inline-block w-16 h-16 bg-gray-100 dark:bg-dark-surface-secondary rounded-lg mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-2">No items yet</h3>
        <p className="text-gray-600 dark:text-dark-text-secondary mb-4">Get started by creating your first item</p>
        <button className="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-medium">
          {action}
        </button>
      </div>
    </div>
  );
};
