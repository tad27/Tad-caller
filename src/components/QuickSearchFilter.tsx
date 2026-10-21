import React from 'react';
import { Search, X, Star, Clock, Flame, Users, FolderPlus, Tag } from 'lucide-react';
import { SmartListType, Folder } from '../types/directory';

interface QuickSearchFilterProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  smartFilter: SmartListType;
  onSmartFilterChange: (f: SmartListType) => void;
  selectedFolderId: string | null;
  onFolderChange: (folderId: string | null) => void;
  folders: Folder[];
  counts: {
    all: number;
    favorites: number;
    recents: number;
    most_used: number;
  };
  onOpenFolderManager: () => void;
}

export const QuickSearchFilter: React.FC<QuickSearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  smartFilter,
  onSmartFilterChange,
  selectedFolderId,
  onFolderChange,
  folders,
  counts,
  onOpenFolderManager,
}) => {
  return (
    <div className="flex flex-col gap-3 px-4 pt-2 pb-3 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/80">
      {/* Search Input Bar (iOS Native Style) */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search name, phone, bank, or IBAN..."
          className="w-full h-10 pl-9 pr-9 text-sm bg-slate-200/60 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-300/40 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Smart List Segmented Bar */}
      <div className="grid grid-cols-4 p-1 bg-slate-200/70 dark:bg-slate-800/90 rounded-xl gap-1">
        <button
          onClick={() => onSmartFilterChange('all')}
          className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
            smartFilter === 'all'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All</span>
          <span className="text-[10px] opacity-70">({counts.all})</span>
        </button>

        <button
          onClick={() => onSmartFilterChange('favorites')}
          className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
            smartFilter === 'favorites'
              ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>Favs</span>
          <span className="text-[10px] opacity-70">({counts.favorites})</span>
        </button>

        <button
          onClick={() => onSmartFilterChange('recents')}
          className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
            smartFilter === 'recents'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Recent</span>
          <span className="text-[10px] opacity-70">({counts.recents})</span>
        </button>

        <button
          onClick={() => onSmartFilterChange('most_used')}
          className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
            smartFilter === 'most_used'
              ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Top</span>
          <span className="text-[10px] opacity-70">({counts.most_used})</span>
        </button>
      </div>

      {/* Horizontal Folders Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => onFolderChange(null)}
          className={`shrink-0 flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            selectedFolderId === null
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <span>All Folders</span>
        </button>

        {folders.map(f => (
          <button
            key={f.id}
            onClick={() => onFolderChange(selectedFolderId === f.id ? null : f.id)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
              selectedFolderId === f.id
                ? 'border-transparent text-white shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
            }`}
            style={{
              backgroundColor: selectedFolderId === f.id ? f.color : undefined,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: selectedFolderId === f.id ? '#ffffff' : f.color }}
            />
            <span>{f.name}</span>
          </button>
        ))}

        <button
          onClick={onOpenFolderManager}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs text-slate-500 hover:text-blue-500 dark:text-slate-400 rounded-full border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 transition-colors"
          title="Manage Folders"
        >
          <Tag className="w-3 h-3" />
          <span>Edit</span>
        </button>
      </div>
    </div>
  );
};
