import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ChatModule = ({ orderId, socket, onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        // Listen for new messages
        socket.on('new_chat_message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        return () => socket.off('new_chat_message');
    }, [socket]);

    useEffect(() => {
        // Auto scroll to bottom
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !socket) return;

        socket.emit('chat_message', {
            order_id: orderId,
            message: input,
            token: localStorage.getItem('access_token')
        });

        setInput('');
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg h-[600px] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border-8 border-white">
                {/* Header */}
                <div className="p-6 bg-gray-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#ff4b3a] rounded-xl shadow-lg ring-4 ring-red-500/20">
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-sm uppercase tracking-widest">Order Chat</h3>
                            <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">OrderID: {orderId.slice(-8).toUpperCase()}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                                <MessageSquare size={32} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest">No messages yet</p>
                            <p className="text-[10px] mt-1">Start a conversation about your delivery.</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const isMe = msg.sender_id === user?.id;
                            return (
                                <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`max-w-[80%] rounded-3xl px-5 py-3 shadow-sm ${
                                        isMe ? 'bg-[#ff4b3a] text-white rounded-tr-none' : 'bg-white text-gray-900 border border-gray-100 rounded-tl-none'
                                    }`}>
                                        {!isMe && <p className="text-[8px] font-black uppercase tracking-widest mb-1 text-gray-400">{msg.sender_name}</p>}
                                        <p className="text-sm font-medium leading-relaxed">{msg.message}</p>
                                        <p className={`text-[8px] mt-1 font-bold uppercase tracking-tighter ${isMe ? 'text-white/60 text-right' : 'text-gray-300'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={sendMessage} className="p-6 bg-white border-t border-gray-100 flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#ff4b3a] transition-all"
                    />
                    <button 
                        type="submit"
                        disabled={!input.trim()}
                        className="p-4 bg-[#ff4b3a] text-white rounded-2xl shadow-lg shadow-red-100 hover:scale-105 active:scale-95 disabled:scale-100 disabled:bg-gray-200 disabled:shadow-none transition-all"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatModule;
