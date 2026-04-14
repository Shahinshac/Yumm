import React, { useState, useEffect } from 'react';
import { TrendingUp, Loader2 } from 'lucide-react';

const RestaurantAnalytics = () => {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
                <p className="text-gray-500 font-bold text-sm">Loading analytics module...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-12 px-4">
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-16 text-center">
                <TrendingUp className="mx-auto mb-6 text-[#ff4b3a]" size={48} />
                <h1 className="text-3xl font-black text-gray-900 mb-4">Analytics Disabled</h1>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xl mx-auto">
                    Performance dashboards and review analytics are currently disabled. The platform is now focused on core delivery and order tracking.
                </p>
            </div>
        </div>
    );
};

export default RestaurantAnalytics;
