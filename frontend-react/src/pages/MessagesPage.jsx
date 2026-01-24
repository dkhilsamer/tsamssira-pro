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

    // Retrieve user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const messagesEndRef = useRef(null);

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    // Handle initial navigation with state
    useEffect(() => {
        fetchConversations();

        if (location.state?.startConversationWith) {
            const targetUser = location.state.startConversationWith;
            setActiveConv({
                user_id: targetUser.id,
                username: targetUser.username,
                // Add default values if needed
            });
            fetchMessages(targetUser.id);
        }
    }, [location.state]);

    // Polling for new messages
    useEffect(() => {
        const interval = setInterval(() => {
            fetchConversations();
            if (activeConv) {
                // Pass true for silent update to avoid loading indicators or intrusive errors
                fetchMessages(activeConv.user_id, true);
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [activeConv]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const data = await api.get('/messages/conversations');
            // Assuming data is an array of conversations
            setConversations(data || []);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const fetchMessages = async (userId, silent = false) => {
        if (!userId) return;
        try {
            const data = await api.get(`/messages/${userId}`);
            setMessages(data || []);

            // If fetching for active convo, mark as read
            if (!silent && userId === activeConv?.user_id) {
                // Option: Trigger a read status update here if API supports it
            }
        } catch (error) {
            if (!silent) console.error('Error fetching messages:', error);
        }
    };

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

    const formatTime = (dateString, simple = false) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (simple) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    };

    if (!user) {
        return <div className="p-8 text-center">Veuillez vous connecter pour voir vos messages.</div>;
    }

    return (
        <div className="messages-layout container animate-fade-in">
            <div className="messages-container glass">
                <div className="conv-sidebar">
                    <div className="sidebar-header">
                        <h2>Messages</h2>
                        <div className="search-bar">
                            <Search size={18} />
                            <input type="text" placeholder="Rechercher..." />
                        </div>
                    </div>

                    <div className="conv-list">
                        {conversations.length > 0 ? (
                            conversations.map(conv => (
                                <div
                                    key={conv.user_id}
                                    className={`conv-item ${activeConv?.user_id === conv.user_id ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveConv(conv);
                                        fetchMessages(conv.user_id);
                                    }}
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
                            <div className="chat-header">
                                <div className="user-info">
                                    <div className="avatar"><User size={24} /></div>
                                    <div>
                                        <h3>{activeConv.username}</h3>
                                        {activeConv.property_id ? (
                                            <span className="property-context">
                                                Discussion à propos de: <strong>{activeConv.property_title || 'un bien'}</strong>
                                            </span>
                                        ) : (
                                            <span className="status"><Circle size={8} fill="#10b981" color="#10b981" /> En ligne</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="chat-messages">
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
                                                {formatTime(msg.created_at, true)}
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
                    box-shadow: var(--shadow);
                    background: var(--surface);
                }
                
                /* Sidebar */
                .conv-sidebar {
                    border-right: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    background: var(--glass);
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
                    background: var(--background);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    color: var(--text-muted);
                }
                .search-bar input { border: none; outline: none; width: 100%; font-family: var(--font-body); background: transparent; color: var(--text-main); }
                
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

                .conv-item {
                    display: flex;
                    gap: 1rem;
                    padding: 1rem 1.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    border-bottom: 1px solid rgba(0,0,0,0.03);
                }
                .conv-item:hover { background: var(--background); }
                .conv-item.active { background: var(--background); border-left: 4px solid var(--secondary); }
                
                .conv-info { flex-grow: 1; min-width: 0; }
                .conv-header { display: flex; justify-content: space-between; margin-bottom: 0.3rem; }
                .conv-header .name { font-weight: 600; color: var(--text-main); }
                .conv-header .time { font-size: 0.75rem; color: var(--text-muted); }
                .last-msg { 
                    font-size: 0.85rem; 
                    color: var(--text-muted); 
                    white-space: nowrap; 
                    overflow: hidden; 
                    text-overflow: ellipsis; 
                }
                .no-conv { padding: 1.5rem; text-align: center; color: var(--text-muted); }

                .avatar {
                    width: 45px; height: 45px;
                    border-radius: 50%;
                    background: var(--surface);
                    display: flex; align-items: center; justify-content: center;
                    color: var(--primary);
                    position: relative;
                    flex-shrink: 0;
                }
                .unread-dot {
                    position: absolute; top: 0; right: 0;
                    width: 12px; height: 12px;
                    background: var(--danger); border-radius: 50%;
                    border: 2px solid var(--surface);
                }

                /* Chat Window */
                .chat-window { 
                    display: flex; 
                    flex-direction: column; 
                    background: var(--surface); 
                    height: 100%;
                    min-height: 0; 
                }
                .chat-header {
                    padding: 1rem 2rem;
                    border-bottom: 1px solid var(--border);
                    background: var(--surface);
                    flex-shrink: 0;
                }
                .user-info { display: flex; align-items: center; gap: 1rem; }
                .user-info h3 { margin: 0; font-size: 1.1rem; }
                .status { font-size: 0.85rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.3rem; }
                .property-context { font-size: 0.85rem; color: var(--text-muted); }
                
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

                .msg-wrapper { display: flex; }
                .msg-wrapper.sent { justify-content: flex-end; }
                .msg-bubble {
                    max-width: 70%;
                    padding: 0.8rem 1.2rem;
                    border-radius: 18px;
                    position: relative;
                    font-size: 0.95rem;
                }
                .msg-wrapper.received .msg-bubble {
                    background: var(--background);
                    color: var(--text-main);
                    border-bottom-left-radius: 4px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                    border: 1px solid var(--border);
                }
                .msg-wrapper.sent .msg-bubble {
                    background: var(--primary);
                    color: white;
                    border-bottom-right-radius: 4px;
                    box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.3);
                }
                .msg-time {
                    display: block;
                    font-size: 0.7rem;
                    margin-top: 0.3rem;
                    opacity: 0.7;
                    text-align: right;
                }

                .rental-request-msg, .boost-request-msg {
                    background: rgba(255,255,255,0.2);
                    padding: 0.5rem;
                    border-radius: 8px;
                    margin-bottom: 0.5rem;
                }
                .request-header {
                    display: flex; align-items: center; gap: 0.5rem;
                    font-weight: bold; margin-bottom: 0.3rem;
                    font-size: 0.9rem;
                }
                .request-content { font-size: 0.9rem; opacity: 0.9; }
                
                .btn-approve-boost {
                    margin-top: 0.5rem;
                    background: white;
                    color: var(--primary);
                    border: none;
                    padding: 0.4rem 0.8rem;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    transition: transform 0.1s;
                }
                .btn-approve-boost:hover { transform: scale(1.02); }

                .chat-input {
                    padding: 1.5rem;
                    background: var(--surface);
                    border-top: 1px solid var(--border);
                    display: flex;
                    gap: 1rem;
                    flex-shrink: 0;
                }
                .chat-input input {
                    flex-grow: 1;
                    padding: 1rem 1.5rem;
                    border-radius: 30px;
                    border: 1px solid var(--border);
                    background: var(--surface);
                    outline: none;
                    transition: all 0.3s;
                }
                .chat-input input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1); }
                .send-btn {
                    width: 50px; height: 50px;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    padding: 0;
                }
                
                .no-chat {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                    text-align: center;
                }
                .no-chat h3 { font-size: 1.5rem; margin: 1rem 0 0.5rem; color: var(--primary); }

                .chat-input input:disabled {
                    background: #e2e8f0;
                    cursor: not-allowed;
                }
            `}</style>
        </div >
    );
};

export default MessagesPage;
