import React from 'react';

export default function GenericModulePage({ title, description }) {
  return (
    <div className="bg-white border border-surface-border p-6 rounded-sm space-y-3">
      <div className="border-b border-surface-border pb-3">
        <h2 className="text-base font-bold text-navy uppercase tracking-wider">{title}</h2>
        <p className="text-xs text-surface-secondary mt-0.5">{description}</p>
      </div>
      <div className="py-12 text-center text-surface-secondary text-xs">
        <div className="inline-block p-4 border border-dashed border-surface-border rounded-sm bg-surface-bg/50">
          Module ready for next phase implementation.
        </div>
      </div>
    </div>
  );
}

