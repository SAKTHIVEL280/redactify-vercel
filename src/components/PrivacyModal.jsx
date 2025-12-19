import React from 'react';
import { X, Shield, CheckCircle2 } from 'lucide-react';

export default function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-500/10 rounded-lg">
              <Shield className="w-4 h-4 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-white">100% Browser-Based</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <p className="text-sm text-zinc-300">
            Your documents are processed entirely in your browser. Zero uploads, zero tracking, zero exceptions.
          </p>
          
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-zinc-400">All processing happens locally using Web Workers</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-zinc-400">Files never leave your device - technically impossible</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-zinc-400">Settings stored in browser only (IndexedDB)</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-all"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}
