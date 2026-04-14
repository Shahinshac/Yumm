import React, { useState, useEffect } from 'react';
import { Wallet, Loader2 } from 'lucide-react';

const DeliveryEarnings = () => {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
                <p className="text-gray-500 font-bold text-sm">Loading delivery earnings module...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-12 px-4">
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-16 text-center">
                <Wallet className="mx-auto mb-6 text-green-500" size={48} />
                <h1 className="text-3xl font-black text-gray-900 mb-4">Delivery Earnings Disabled</h1>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xl mx-auto">
                    Earnings reports and payout history have been disabled. Focus is now on live delivery assignments and accurate tracking.
                </p>
            </div>
        </div>
    );
};

export default DeliveryEarnings;
