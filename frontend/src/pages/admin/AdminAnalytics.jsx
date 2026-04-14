import React, { useState, useEffect } from 'react';
import { TrendingUp, Loader2 } from 'lucide-react';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
        <p className="text-gray-500 font-black text-xs uppercase tracking-widest">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 px-4">
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-16 text-center">
        <TrendingUp className="mx-auto mb-6 text-[#ff4b3a]" size={48} />
        <h1 className="text-3xl font-black text-gray-900 mb-4">Platform Analytics Disabled</h1>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xl mx-auto">
          The admin analytics dashboard has been turned off. Core order routing and delivery tracking remain active without review or earnings summaries.
        </p>
      </div>
    </div>
  );
};

export default AdminAnalytics;
