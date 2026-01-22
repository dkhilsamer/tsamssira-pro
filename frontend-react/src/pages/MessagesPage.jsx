import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Search, Send, User, Circle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const MessagesPage = () => {
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (activeConv) {
            fetchMessages(activeConv.user_id);
            // Polling for new messages every 5 seconds
            const interval = setInterval(() => fetchMessages(activeConv.user_id, true), 5000);
            return () => clearInterval(interval);
        }
    }, [activeConv]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const data = await api.get('/messages/conversations');
            setConversations(data);
            setLoading(false);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const fetchMessages = async (otherUserId, silent = false) => {
        try {
            const data = await api.get(`/messages/${otherUserId}`);
            setMessages(data);
        } catch (error) {
            if (!silent) toast.error(error.message);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConv) return;

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
        }
    };

    if (loading) return <div className="loading-state"><div className="spinner"></div></div>;

    return (
        <div className="messages-layout container animate-fade-in">
            <div className="messages-container glass">
                {/* Sidebar: Conversations List */}
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
                                    onClick={() => setActiveConv(conv)}
                                >
                                    <div className="avatar">
                                        <User size={24} />
                                        {conv.unread_count > 0 && <span className="unread-dot"></span>}
                                    </div>
                                    <div className="conv-info">
                                        <div className="conv-header">
                                            <span className="name">{conv.username}</span>
                                            <span className="time">
                                                {formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: true, locale: fr })}
                                            </span>
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
                                        <span className="status"><Circle size={8} fill="#10b981" color="#10b981" /> En ligne</span>
                                    </div>
                                </div>
                            </div>

                            <div className="chat-messages">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`msg-wrapper ${msg.sender_id === user.id ? 'sent' : 'received'}`}
                                    >
                                        <div className="msg-bubble">
                                            {msg.content}
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
                                    placeholder="Écrivez votre message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="submit" className="btn btn-primary send-btn">
                                    <Send size={20} />
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
                }
                
                /* Sidebar */
                .conv-sidebar {
                    border-right: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    background: rgba(255, 255, 255, 0.5);
                }
                .sidebar-header { padding: 2rem; }
                .sidebar-header h2 { font-size: 1.8rem; margin-bottom: 1.5rem; color: var(--primary); }
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
                
                .conv-list { flex-grow: 1; overflow-y: auto; }
                .conv-item {
                    display: flex;
                    gap: 1rem;
                    padding: 1.5rem 2rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    border-bottom: 1px solid rgba(0,0,0,0.03);
                }
                .conv-item:hover { background: rgba(212, 175, 55, 0.05); }
                .conv-item.active { background: white; border-left: 4px solid var(--secondary); }
                
                .avatar {
                    width: 48px;
                    height: 48px;
                    background: #f1f5f9;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                    position: relative;
                }
                .unread-dot {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 12px;
                    height: 12px;
                    background: var(--secondary);
                    border: 2px solid white;
                    border-radius: 50%;
                }
                .conv-info { flex-grow: 1; min-width: 0; }
                .conv-header { display: flex; justify-content: space-between; margin-bottom: 0.25rem; }
                .conv-header .name { font-weight: 700; color: var(--primary); }
                .conv-header .time { font-size: 0.75rem; color: var(--text-muted); }
                .last-msg {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                /* Chat Window */
                .chat-window { display: flex; flex-direction: column; background: white; }
                .chat-header {
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .user-info { display: flex; align-items: center; gap: 1rem; }
                .user-info h3 { font-size: 1.1rem; color: var(--primary); }
                .user-info .status { font-size: 0.8rem; color: var(--success); display: flex; align-items: center; gap: 0.4rem; }
                
                .chat-messages {
                    flex-grow: 1;
                    padding: 2rem;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    background: #f8fafc;
                }
                .msg-wrapper { display: flex; width: 100%; }
                .msg-wrapper.received { justify-content: flex-start; }
                .msg-wrapper.sent { justify-content: flex-end; }
                
                .msg-bubble {
                    max-width: 60%;
                    padding: 1rem 1.5rem;
                    border-radius: 20px;
                    font-size: 0.95rem;
                    position: relative;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.03);
                }
                .sent .msg-bubble { 
                    background: var(--primary); 
                    color: white; 
                    border-bottom-right-radius: 4px;
                }
                .received .msg-bubble { 
                    background: white; 
                    color: var(--text-main); 
                    border-bottom-left-radius: 4px;
                }
                .msg-time {
                    display: block;
                    font-size: 0.7rem;
                    margin-top: 0.5rem;
                    opacity: 0.7;
                    text-align: right;
                }
                
                .chat-input {
                    padding: 1.5rem 2rem;
                    border-top: 1px solid var(--border);
                    display: flex;
                    gap: 1rem;
                }
                .chat-input input {
                    flex-grow: 1;
                    padding: 1rem 1.5rem;
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    background: #f8fafc;
                    outline: none;
                }
                .send-btn { 
                    width: 54px; 
                    height: 54px; 
                    padding: 0; 
                    background: var(--secondary); 
                    border-radius: 16px;
                }
                
                .no-chat {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    color: var(--text-muted);
                }
                
                @media (max-width: 768px) {
                    .messages-container { grid-template-columns: 1fr; }
                    .conv-sidebar { display: ${activeConv ? 'none' : 'flex'}; }
                    .chat-window { display: ${activeConv ? 'flex' : 'none'}; }
                }
            `}</style>
        </div>
    );
};

export default MessagesPage;
