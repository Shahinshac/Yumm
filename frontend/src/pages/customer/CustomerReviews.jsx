import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Loader2, Store, Calendar, ArrowRight } from 'lucide-react';
import { customerService } from '../../services/customerService';
import { Link } from 'react-router-dom';

const CustomerReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        customerService.getMyReviews().then(res => {
            setReviews(res.reviews || []);
        }).catch(() => {
            setReviews([
                { id: 1, restaurant_name: 'Paragon', rating: 5, comment: 'Best biryani in town! Highly recommended.', date: '2026-04-05', reply: 'Thank you for your kind words!' },
                { id: 2, restaurant_name: 'Hot Spot', rating: 3, comment: 'Food was okay, but wait time was long.', date: '2026-03-29', reply: '' }
            ]);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
                <p className="text-gray-500 font-bold text-sm text-[#ff4b3a]">Loading your review history...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Reviews</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">History of feedback you've shared with our partners.</p>
                </div>
                <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-100 flex items-center gap-2 text-sm font-bold text-gray-400">
                    <MessageSquare size={18} className="text-[#ff4b3a]" /> {reviews.length} Total Reviews
                </div>
            </div>

            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <div className="py-20 bg-white rounded-[3rem] border border-dashed border-gray-200 text-center">
                        <Star size={48} className="mx-auto text-gray-100 mb-4" />
                        <p className="text-gray-400 font-medium">You haven't shared any reviews yet.</p>
                        <Link to="/home" className="mt-4 inline-block text-[#ff4b3a] font-black text-[10px] uppercase tracking-widest hover:underline">
                            Order food to share feedack
                        </Link>
                    </div>
                ) : (
                    reviews.map(review => (
                        <div key={review.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
                                        <Store size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{review.restaurant_name}</h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    size={12} 
                                                    className={i < review.rating ? 'text-orange-500 fill-orange-500' : 'text-gray-200'} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1">
                                    <Calendar size={12} /> {review.date}
                                </span>
                            </div>

                            <p className="text-gray-600 font-medium leading-relaxed italic mb-6">
                                "{review.comment}"
                            </p>

                            {review.reply && (
                                <div className="bg-[#ff4b3a]/5 p-6 rounded-3xl border border-[#ff4b3a]/10 relative mt-4">
                                     <div className="absolute -top-3 left-8 px-3 py-1 bg-[#ff4b3a] rounded-full text-[8px] font-black uppercase tracking-widest text-white shadow-sm">
                                        Restaurant's Reply
                                    </div>
                                    <p className="text-gray-700 text-sm font-bold leading-relaxed">
                                        {review.reply}
                                    </p>
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t border-gray-50 flex justify-end">
                                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#ff4b3a] transition-all">
                                    Order Again <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CustomerReviews;
