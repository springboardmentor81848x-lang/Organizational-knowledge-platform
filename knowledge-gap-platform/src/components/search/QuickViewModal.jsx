import React from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { CheckCircle, Sparkles, ExternalLink } from 'lucide-react';

export const QuickViewModal = ({ item, isOpen, onClose }) => {
  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${item.category}: ${item.title}`}>
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-100 dark:border-blue-900/30">
          <div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {item.category} Details
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {item.title}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
              {item.matchPercentage}%
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              AI Relevance
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Overview
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Dynamic Key Details */}
        {item.details && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Metadata & Attributes
            </h4>
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              {Object.entries(item.details).map(([key, value]) => {
                const formattedKey = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase());
                return (
                  <div key={key} className="space-y-0.5">
                    <span className="text-xs text-slate-400">{formattedKey}:</span>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            Close
          </button>
          <button
            onClick={() => {
              alert(`Navigating to detailed intelligence view for ${item.title}`);
              onClose();
            }}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Full Profile</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
