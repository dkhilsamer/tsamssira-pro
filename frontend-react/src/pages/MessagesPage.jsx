import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Search, Send, User, Circle, MessageSquare, ClipboardList, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useLocation } from 'react-router-dom';

const MessagesPage = () => {
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    // ... existing navigation useEffect ...

    // ... existing poll useEffect ...

    // ... existing scroll useEffect ...

    // ... scroll utils ...

    // ... fetchConversations ...

    // ... fetchMessages ...

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConv || cooldown > 0) return;

        setCooldown(10); // Start cooldown immediately to prevent duplicates

        try {
            await api.post('/messages', {
                receiver_id: activeConv.user_id,
                content: newMessage,
                property_id: activeConv.property_id
            });
            setNewMessage('');
            fetchMessages(activeConv.user_id);
            fetchConversations(); // Update preview
        } catch (error) {
            toast.error(error.message);
            setCooldown(0); // Reset cooldown on error so they can retry
        }
    };

    // ... loading check ...

    // ... formatTime ...

    return (
        <div className="messages-layout container animate-fade-in">
            {/* ... sidebar ... */}
            <div className="messages-container glass">
                <div className="conv-sidebar">
                    {/* ... sidebar header ... */}
                    <div className="sidebar-header">
                        <h2>Messages</h2>
                        <div className="search-bar">
                            <Search size={18} />
                            <input type="text" placeholder="Rechercher..." />
                        </div>
                    </div>

                    <div className="conv-list">
                        {/* ... conv items ... */}
                        {conversations.length > 0 ? (
                            conversations.map(conv => (
                                <div
                                    key={conv.user_id}
                                    className={`conv-item ${activeConv?.user_id === conv.user_id ? 'active' : ''}`}
                                    onClick={() => setActiveConv(conv)}
                                >
                                    <div className="avatar">
                                        <User size={24} />
                                        {(conv.unread_count > 0) && <span className="unread-dot"></span>}
                                    </div>
                                    <div className="conv-info">
                                        <div className="conv-header">
                                            <span className="name">{conv.username}</span>
                                            <span className="time">{formatTime(conv.last_message_time)}</span>
                                        </div>
                                        <p className="last-msg">{conv.last_message}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-conv">Aucune discussion en cours.</p>
                        )}
                    </div>
                </div>

                {/* Main: Chat Window */}
                <div className="chat-window">
                    {activeConv ? (
                        <>
                            {/* ... chat header ... */}
                            <div className="chat-header">
                                <div className="user-info">
                                    <div className="avatar"><User size={24} /></div>
                                    <div>
                                        <h3>{activeConv.username}</h3>
                                        {activeConv.property_id && (
                                            <span className="property-context">
                                                Discussion à propos de: <strong>{activeConv.property_title || 'un bien'}</strong>
                                            </span>
                                        ) || (
                                                <span className="status"><Circle size={8} fill="#10b981" color="#10b981" /> En ligne</span>
                                            )}
                                    </div>
                                </div>
                            </div>

                            <div className="chat-messages">
                                {/* ... messages mapping ... */}
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`msg-wrapper ${msg.sender_id === user?.id ? 'sent' : 'received'}`}
                                    >
                                        <div className="msg-bubble">
                                            {msg.type === 'rental_request' && (
                                                <div className="rental-request-msg">
                                                    <div className="request-header">
                                                        <ClipboardList size={18} />
                                                        Demande de location
                                                    </div>
                                                    <div className="request-content">
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            )}
                                            {msg.type === 'boost_request' && (
                                                <div className="boost-request-msg">
                                                    <div className="request-header">
                                                        <TrendingUp size={18} />
                                                        Demande de Boost
                                                    </div>
                                                    <div className="request-content">
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            )}
                                            {(!msg.type || (msg.type !== 'rental_request' && msg.type !== 'boost_request')) && msg.content}
                                            {msg.type === 'boost_request' && user?.role === 'admin' && msg.sender_id !== user?.id && (
                                                <button
                                                    className="btn-approve-boost"
                                                    onClick={async () => {
                                                        try {
                                                            await api.put(`/properties/${msg.property_id}/boost/approve`);
                                                            toast.success('Boost approuvé et activé!');
                                                            fetchMessages(activeConv.user_id);
                                                        } catch (error) {
                                                            toast.error(error.message);
                                                        }
                                                    }}
                                                >
                                                    ✅ Approuver le boost
                                                </button>
                                            )}
                                            <span className="msg-time">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <form className="chat-input" onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    placeholder={cooldown > 0 ? `Veuillez patienter ${cooldown}s...` : "Écrivez votre message..."}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    disabled={cooldown > 0}
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary send-btn"
                                    disabled={cooldown > 0 || !newMessage.trim()}
                                    style={{ opacity: cooldown > 0 ? 0.7 : 1, cursor: cooldown > 0 ? 'not-allowed' : 'pointer' }}
                                >
                                    {cooldown > 0 ? (
                                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{cooldown}s</span>
                                    ) : (
                                        <Send size={20} />
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="no-chat">
                            <MessageSquare size={64} color="#e2e8f0" />
                            <h3>Sélectionnez une discussion</h3>
                            <p>Choisissez un contact pour commencer à discuter.</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .messages-layout {
                    height: calc(100vh - 120px);
                    margin-top: 2rem;
                    padding-bottom: 2rem;
                }
                .messages-container {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    height: 100%;
                    border-radius: 30px;
                    overflow: hidden;
                    box-shadow: 0 4px 50px rgba(0,0,0,0.1);
                    background: white; /* Ensure background is solid for scrollbars */
                }
                
                /* Sidebar */
                .conv-sidebar {
                    border-right: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    background: rgba(255, 255, 255, 0.5);
                    height: 100%;
                    min-height: 0; 
                }
                .sidebar-header { padding: 1.5rem; flex-shrink: 0; }
                .sidebar-header h2 { font-size: 1.5rem; margin-bottom: 1rem; color: var(--primary); }
                .search-bar {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.8rem 1rem;
                    background: white;
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    color: var(--text-muted);
                }
                .search-bar input { border: none; outline: none; width: 100%; font-family: var(--font-body); }
                
                .conv-list { 
                    flex-grow: 1; 
                    overflow-y: auto; 
                    padding-bottom: 1rem;
                    scrollbar-width: thin; /* Firefox */
                    scrollbar-color: var(--secondary) transparent; /* Firefox */
                }
                
                .conv-list::-webkit-scrollbar {
                    width: 8px; /* Slightly wider */
                }
                .conv-list::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }
                .conv-list::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                    border: 2px solid #f1f5f9; /* Contrast border */
                }
                .conv-list::-webkit-scrollbar-thumb:hover {
                    background-color: var(--secondary);
                }

                /* ... existing conv-item ... */
                /* ... rest of conv styles ... */
                
                /* Chat Window */
                .chat-window { 
                    display: flex; 
                    flex-direction: column; 
                    background: white; 
                    height: 100%;
                    min-height: 0; 
                }
                /* ... chat header ... */
                
                .chat-messages {
                    flex-grow: 1;
                    padding: 2rem;
                    overflow-y: scroll; /* Force scrollbar */
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    background: var(--background);
                    scroll-behavior: smooth;
                    scrollbar-width: thin;
                    scrollbar-color: var(--secondary) transparent;
                    padding-right: 1rem; /* Avoid overlap with scrollbar */
                }
                
                .chat-messages::-webkit-scrollbar {
                    width: 8px;
                    display: block; /* Force display */
                }
                .chat-messages::-webkit-scrollbar-track {
                    background: transparent;
                }
                .chat-messages::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
                .chat-messages::-webkit-scrollbar-thumb:hover {
                    background-color: var(--secondary);
                }

                /* ... msg styles ... */
                /* ... input styles ... */

                .chat-input input:disabled {
                    background: #e2e8f0;
                    cursor: not-allowed;
                }
            `}</style>
            `}</style>
        </div >
    );
};

export default MessagesPage;
