import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Loader2, Filter, Reply, User, Calendar } from 'lucide-react';
import { restaurantService } from '../../services/restaurantService';

const RestaurantReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        restaurantService.getReviews().then(res => {
            setReviews(res.reviews || []);
        }).catch(() => {
            setReviews([
                { id: 1, user: 'John Doe', rating: 5, comment: 'Amazing food! The biryani was perfectly spiced.', date: '2026-04-05', reply: 'Thank you for your kind words!' },
                { id: 2, user: 'Priya S.', rating: 4, comment: 'Good quality, but delivery took some time.', date: '2026-04-03', reply: '' },
                { id: 3, user: 'Rahul K.', rating: 3, comment: 'Average experience. Portion size was smaller than expected.', date: '2026-04-01', reply: '' }
            ]);
        }).finally(() => setLoading(false));
    }, []);

    const filtered = reviews.filter(r => {
        if (filter === 'all') return true;
        if (filter === 'replied') return !!r.reply;
        if (filter === 'pending') return !r.reply;
        return true;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
                <p className="text-gray-500 font-bold text-sm text-[#ff4b3a]">Gathering customer feedback...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Customer Reviews</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Manage your reputation and respond to feedback.</p>
                </div>
                <div className="flex items-center gap-2">
                    {['all', 'pending', 'replied'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                filter === f ? 'bg-[#ff4b3a] text-white shadow-lg shadow-red-100' : 'bg-white text-gray-400 border border-gray-100'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                {filtered.length === 0 ? (
                    <div className="py-20 bg-white rounded-[2rem] border border-dashed border-gray-200 text-center">
                        <MessageSquare size={48} className="mx-auto text-gray-100 mb-4" />
                        <p className="text-gray-400 font-medium font-[#ff4b3a]">No reviews found matching your filter.</p>
                    </div>
                ) : (
                    filtered.map(review => (
                        <div key={review.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-[#ff4b3a]">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{review.user}</h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    size={12} 
                                                    className={i < review.rating ? 'text-orange-500 fill-orange-500' : 'text-gray-200'} 
                                                />
                                            ))}
                                            <span className="text-[10px] text-gray-400 font-bold ml-2 uppercase tracking-widest flex items-center gap-1">
                                                <Calendar size={12} /> {review.date}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {!review.reply && (
                                    <span className="px-3 py-1 bg-red-50 text-[#ff4b3a] text-[10px] font-black uppercase tracking-widest rounded-full">Pending</span>
                                )}
                            </div>

                            <p className="text-gray-600 font-medium leading-relaxed italic mb-8">
                                "{review.comment}"
                            </p>

                            {review.reply ? (
                                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 relative">
                                    <div className="absolute -top-3 left-8 px-3 py-1 bg-white border border-gray-100 rounded-full text-[8px] font-black uppercase tracking-widest text-gray-400">
                                        Your Response
                                    </div>
                                    <p className="text-gray-700 text-sm font-medium leading-relaxed">
                                        {review.reply}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="text" 
                                        placeholder="Type your response..."
                                        className="flex-1 px-5 py-3 bg-gray-50 border border-gray-50 rounded-2xl focus:bg-white focus:border-[#ff4b3a] transition-all outline-none text-sm font-medium"
                                    />
                                    <button className="p-3 bg-[#ff4b3a] text-white rounded-2xl shadow-lg shadow-red-200 hover:scale-105 active:scale-95 transition-all">
                                        <Reply size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RestaurantReviews;
