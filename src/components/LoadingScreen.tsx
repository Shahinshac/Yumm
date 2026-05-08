import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-surface flex flex-col items-center justify-center z-[9999]">
      <div className="relative">
        {/* Cinematic Loader */}
        <div className="w-24 h-24 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-lexend font-black text-primary text-2xl">N</span>
        </div>
      </div>
      <div className="mt-8 flex flex-col items-center gap-2">
        <h2 className="font-lexend font-bold text-on-surface text-xl animate-pulse">Initializing NexFood</h2>
        <p className="text-on-surface-variant text-sm font-medium tracking-widest uppercase">Secure Protocol Active</p>
      </div>
      
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
    </div>
  );
}
