import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, Check } from 'lucide-react';
import { Folder } from '../types/directory';
import { useToast } from './ToastFeedback';

interface FolderManagerModalProps {
  folders: Folder[];
  onClose: () => void;
  onAddFolder: (name: string, color: string) => void;
  onDeleteFolder: (folderId: string) => void;
}

const PRESET_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#64748B', // Slate
];

export const FolderManagerModal: React.FC<FolderManagerModalProps> = ({
  folders,
  onClose,
  onAddFolder,
  onDeleteFolder,
}) => {
  const { showToast } = useToast();
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    onAddFolder(newFolderName.trim(), selectedColor);
    showToast('Folder Created', newFolderName.trim(), 'success');
    setNewFolderName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Manage Folders & Labels</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Create Folder Form */}
        <form onSubmit={handleCreate} className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          <input
            type="text"
            placeholder="New label name (e.g. Squash Club)"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-blue-500"
          />

          {/* Color picker swatches */}
          <div className="flex items-center gap-1.5 justify-between">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedColor(c)}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                  selectedColor === c ? 'scale-125 ring-2 ring-offset-2 ring-blue-500' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              >
                {selectedColor === c && <Check className="w-3 h-3 text-white stroke-[3]" />}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!newFolderName.trim()}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Folder</span>
          </button>
        </form>

        {/* Existing Folders List */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto">
          {folders.map(f => (
            <div
              key={f.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: f.color }}
                />
                <span className="text-xs font-medium text-slate-900 dark:text-slate-100">
                  {f.name}
                </span>
                {f.isSystem && (
                  <span className="text-[10px] text-slate-400 font-normal">(Default)</span>
                )}
              </div>

              {!f.isSystem && (
                <button
                  onClick={() => {
                    onDeleteFolder(f.id);
                    showToast('Folder Deleted', f.name, 'success');
                  }}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Delete Folder"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
