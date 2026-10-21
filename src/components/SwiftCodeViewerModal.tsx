import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, FolderTree, Code2, Shield, Cloud } from 'lucide-react';
import { SWIFT_CODEBASE, SwiftFile } from '../data/swiftCodebase';
import { useToast } from './ToastFeedback';

interface SwiftCodeViewerModalProps {
  onClose: () => void;
}

export const SwiftCodeViewerModal: React.FC<SwiftCodeViewerModalProps> = ({ onClose }) => {
  const { showToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<SwiftFile>(SWIFT_CODEBASE[0]);
  const [isCopied, setIsCopied] = useState(false);

  const categories = ['All', 'App', 'Models', 'Services', 'Views'] as const;
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredFiles =
    activeCategory === 'All'
      ? SWIFT_CODEBASE
      : SWIFT_CODEBASE.filter(f => f.category === activeCategory);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setIsCopied(true);
    showToast('Code Copied', `${selectedFile.name} copied to clipboard`, 'copy');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File Downloaded', `${selectedFile.name}`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-5xl h-[90vh] flex flex-col bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden">
        {/* Top Header */}
        <div className="shrink-0 px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Xcode 16 Swift / SwiftUI Codebase</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Swift 6 · SwiftData · CloudKit
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Production-grade native iOS implementation files ready to import into Xcode
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Pills Bar */}
        <div className="shrink-0 px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main Content: File Tree on left, Code Viewer on right */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar: File List */}
          <div className="w-full md:w-72 shrink-0 bg-slate-950/60 border-r border-slate-800 flex flex-col overflow-y-auto p-2 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-3 py-1 block">
              Project Navigator ({filteredFiles.length} files)
            </span>

            {filteredFiles.map(file => {
              const isSelected = selectedFile.name === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => {
                    setSelectedFile(file);
                    setIsCopied(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white font-medium shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Code2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-orange-400'}`} />
                  <div className="min-w-0 flex-1 truncate">
                    <p className="truncate font-mono text-[11px]">{file.name}</p>
                    <p className={`text-[10px] truncate ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                      {file.category}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
            {/* File info bar */}
            <div className="shrink-0 px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <span className="font-mono text-xs font-bold text-white block truncate">
                  {selectedFile.name}
                </span>
                <span className="text-[11px] text-slate-400 truncate block">
                  {selectedFile.description}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadFile}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Code Box */}
            <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs leading-relaxed text-slate-200 select-text">
              <pre>
                <code>{selectedFile.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
