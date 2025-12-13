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
          <h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
          <p className="text-neutral-600 mt-1">{description}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
          <Plus className="w-5 h-5" />
          {action}
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-neutral-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-neutral-700">
          <Filter className="w-5 h-5" />
          Filter
        </button>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
        <div className="inline-block w-16 h-16 bg-neutral-100 rounded-lg mb-4"></div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">No items yet</h3>
        <p className="text-neutral-600 mb-4">Get started by creating your first item</p>
        <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
          {action}
        </button>
      </div>
    </div>
  );
};
