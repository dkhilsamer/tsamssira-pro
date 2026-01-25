import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import {
    Search, Send, User, Circle, MessageSquare,
    ClipboardList, TrendingUp, Info, MoreHorizontal,
    Phone, Mail, Calendar, MapPin, ExternalLink, ChevronLeft,
    Paperclip, Image as ImageIcon, Smile
} from 'lucide-react';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const MessagesPage = () => {
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);

    const user = JSON.parse(localStorage.getItem('user'));
    const messagesEndRef = useRef(null);
    const isProd = import.meta.env.PROD;
    const BACKEND_URL = isProd ? '' : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000');

    useEffect(() => {
        fetchConversations();

        if (location.state?.startConversationWith) {
            const targetUser = location.state.startConversationWith;
            const existingConv = conversations.find(c => c.user_id === targetUser.id);
            if (existingConv) {
                handleConvSelect(existingConv);
            } else {
                const newTempConv = {
                    user_id: targetUser.id,
                    username: targetUser.username,
                    is_temp: true
                };
                handleConvSelect(newTempConv);
            }
        }
    }, [location.state, conversations.length === 0]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchConversations(true);
            if (activeConv) {
                fetchMessages(activeConv.user_id, true);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [activeConv]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async (silent = false) => {
        try {
            const data = await api.get('/messages/conversations');
            setConversations(data || []);
        } catch (error) {
            if (!silent) console.error('Error fetching conversations:', error);
        }
    };

    const fetchMessages = async (userId, silent = false) => {
        if (!userId) return;
        if (!silent) setLoadingMessages(true);
        try {
            const data = await api.get(`/messages/${userId}`);
            setMessages(data || []);
        } catch (error) {
            if (!silent) toast.error('Erreur lors de la récupération des messages');
        } finally {
            if (!silent) setLoadingMessages(false);
        }
    };

    const handleConvSelect = (conv) => {
        setActiveConv(conv);
        fetchMessages(conv.user_id);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConv) return;

        const currentMsg = newMessage;
        setNewMessage('');

        try {
            await api.post('/messages', {
                receiver_id: activeConv.user_id,
                content: currentMsg,
                property_id: activeConv.property_id
            });
            fetchMessages(activeConv.user_id, true);
            fetchConversations(true);
        } catch (error) {
            setNewMessage(currentMsg);
            toast.error(error.message);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=100&q=80';
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        const base = isProd ? '' : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000');
        return `${base}${cleanPath}`;
    };

    const groupMessagesByDate = (messagesList) => {
        const groups = {};
        messagesList.forEach(msg => {
            const date = format(new Date(msg.created_at), 'yyyy-MM-dd');
            if (!groups[date]) groups[date] = [];
            groups[date].push(msg);
        });
        return groups;
    };

    const formatGroupDate = (dateStr) => {
        const date = new Date(dateStr);
        if (isToday(date)) return "AUJOURD'HUI";
        if (isYesterday(date)) return "HIER";
        return format(date, 'd MMMM yyyy', { locale: fr }).toUpperCase();
    };

    const filteredConversations = conversations.filter(c =>
        c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.last_message && c.last_message.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (!user) {
        return (
            <div className="auth-fallback">
                <div className="fallback-card glass">
                    <User size={64} className="text-secondary" />
                    <h2>Espace Membre</h2>
                    <p>Connectez-vous pour accéder à votre messagerie sécurisée.</p>
                    <Link to="/login" className="btn btn-primary mt-6">Se connecter maintenant</Link>
                </div>
            </div>
        );
    }

    const groupedMessages = groupMessagesByDate(messages);

    return (
        <div className="messages-layout">
            <div className="messages-container">

                {/* Conversations Sidebar */}
                <aside className={`conv-sidebar ${activeConv ? 'mobile-hidden' : ''}`}>
                    <div className="sidebar-header">
                        <div className="header-top">
                            <span className="brand-dot"></span>
                            <h1>Chat Privé</h1>
                            <button className="icon-btn-ghost"><MoreHorizontal size={20} /></button>
                        </div>
                        <div className="search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Chercher un contact..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="conv-list scrollbar-premium">
                        {filteredConversations.length > 0 ? (
                            filteredConversations.map(conv => (
                                <motion.div
                                    key={conv.user_id}
                                    layout
                                    className={`conv-item ${activeConv?.user_id === conv.user_id ? 'active' : ''}`}
                                    onClick={() => handleConvSelect(conv)}
                                >
                                    <div className="avatar-wrapper">
                                        <div className="avatar-main">
                                            {conv.username.charAt(0).toUpperCase()}
                                        </div>
                                        {conv.unread_count > 0 && <span className="notification-ping"></span>}
                                        {conv.unread_count > 0 && <span className="unread-count">{conv.unread_count}</span>}
                                    </div>
                                    <div className="conv-meta">
                                        <div className="meta-top">
                                            <span className="name">{conv.username}</span>
                                            <span className="time">
                                                {conv.last_message_time ? formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: false, locale: fr }).replace('environ ', '') : ''}
                                            </span>
                                        </div>
                                        <p className={`last-message ${conv.unread_count > 0 ? 'highlight' : ''}`}>
                                            {conv.last_message || 'Nouvelle conversation'}
                                        </p>
                                    </div>
                                    {activeConv?.user_id === conv.user_id && <div className="active-indicator" />}
                                </motion.div>
                            ))
                        ) : (
                            <div className="empty-message">
                                <MessageSquare size={40} />
                                <p>Pas encore de messages</p>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Chat Window */}
                <main className={`chat-window ${!activeConv ? 'mobile-hidden' : ''}`}>
                    {activeConv ? (
                        <>
                            <header className="chat-header">
                                <div className="user-info">
                                    <button className="mobile-btn" onClick={() => setActiveConv(null)}>
                                        <ChevronLeft size={24} />
                                    </button>
                                    <div className="chat-avatar-box">
                                        {activeConv.username.charAt(0).toUpperCase()}
                                        <span className="online-indicator"></span>
                                    </div>
                                    <div className="chat-details">
                                        <h3>{activeConv.username}</h3>
                                        <div className="presence">
                                            <span>Membre Vérifié</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="header-actions">
                                    <button className="icon-btn-ghost"><Phone size={18} /></button>
                                    <button className="icon-btn-ghost"><Info size={18} /></button>
                                    <button className="icon-btn-ghost"><MoreHorizontal size={18} /></button>
                                </div>
                            </header>

                            {activeConv.property_id && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="property-context-card"
                                >
                                    <div className="p-thumb">
                                        <img src={getImageUrl(activeConv.property_image)} alt="" />
                                    </div>
                                    <div className="p-body">
                                        <p className="p-label">EN RÉCURRENCE DE :</p>
                                        <h4 className="p-title">{activeConv.property_title}</h4>
                                        <div className="p-meta">
                                            {activeConv.property_location && <span>📍 {activeConv.property_location}</span>}
                                            {activeConv.property_price && <span className="p-price">{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(activeConv.property_price)}</span>}
                                        </div>
                                    </div>
                                    <Link to={`/property/${activeConv.property_id}`} className="p-link">
                                        <ExternalLink size={18} />
                                    </Link>
                                </motion.div>
                            )}

                            <div className="messages-flow scrollbar-premium">
                                <AnimatePresence initial={false}>
                                    {Object.entries(groupedMessages).map(([date, msgs]) => (
                                        <div key={date} className="date-block">
                                            <div className="date-tag">
                                                <span>{formatGroupDate(date)}</span>
                                            </div>
                                            {msgs.map((msg, i) => {
                                                const isMine = msg.sender_id === user.id;
                                                const isAdminMode = (user.role === 'admin' || user.username?.toLowerCase() === 'tadmin');

                                                return (
                                                    <motion.div
                                                        key={msg.id || `${date}-${i}`}
                                                        initial={{ opacity: 0, scale: 0.95, x: isMine ? 20 : -20 }}
                                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                                        className={`message-wrap ${isMine ? 'mine' : 'theirs'}`}
                                                    >
                                                        {!isMine && (
                                                            <div className="msg-avatar">
                                                                {activeConv.username.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="msg-content">
                                                            <div className="msg-bubble">
                                                                {msg.type === 'rental_request' && (
                                                                    <div className="card-msg rental">
                                                                        <div className="tag"><ClipboardList size={14} /> DEMANDE</div>
                                                                        <p>{msg.content}</p>
                                                                    </div>
                                                                )}
                                                                {msg.type === 'boost_request' && (
                                                                    <div className="card-msg boost">
                                                                        <div className="tag"><TrendingUp size={14} /> BOOST</div>
                                                                        <p>{msg.content}</p>
                                                                        {isAdminMode && !isMine && (
                                                                            <button
                                                                                className="action-btn-gold"
                                                                                onClick={() => {
                                                                                    api.put(`/properties/${msg.property_id}/boost/approve`)
                                                                                        .then(() => toast.success('Boost activé!'))
                                                                                        .catch(e => toast.error(e.message));
                                                                                }}
                                                                            >
                                                                                Approuver le Boost
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {(!msg.type || (msg.type !== 'rental_request' && msg.type !== 'boost_request')) && (
                                                                    <p className="msg-text">{msg.content}</p>
                                                                )}
                                                            </div>
                                                            <div className="msg-info">
                                                                {format(new Date(msg.created_at), 'HH:mm')}
                                                                {isMine && <span className="read-status">✓✓</span>}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </AnimatePresence>
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="chat-input-bar">
                                <form className="input-field-group" onSubmit={handleSendMessage}>
                                    <div className="input-tools">
                                        <button type="button" className="tool-btn"><Paperclip size={20} /></button>
                                    </div>
                                    <div className="input-entry">
                                        <input
                                            type="text"
                                            placeholder="Tapez un message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                        />
                                        <button type="button" className="emoji-btn"><Smile size={20} /></button>
                                    </div>
                                    <button type="submit" className="action-send" disabled={!newMessage.trim()}>
                                        <Send size={24} />
                                    </button>
                                </form>
                                <div className="input-hints">
                                    <span>Pressez Entrée pour envoyer • Sécurisé par CloudGuard</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="chat-empty-state">
                            <motion.div
                                className="empty-icon-card"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            >
                                <MessageSquare size={80} />
                            </motion.div>
                            <h2>Messagerie Tsamssira Pro</h2>
                            <p>Échangez en toute sécurité avec les propriétaires et locataires.</p>
                            <div className="empty-stats">
                                <div className="stat-pill">🔒 Chiffré</div>
                                <div className="stat-pill">⚡ Instantané</div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <style jsx>{`
                .messages-layout {
                    height: calc(100vh - 80px);
                    background: #f1f5f9;
                    display: flex;
                    justify-content: center;
                    padding: 0;
                    overflow: hidden;
                }
                .messages-container {
                    width: 100%;
                    max-width: 1440px;
                    display: flex;
                    background: white;
                    box-shadow: 0 10px 50px rgba(0,0,0,0.05);
                }

                /* Sidebar Styles */
                .conv-sidebar {
                    width: 400px;
                    border-right: 1px solid #f1f5f9;
                    display: flex;
                    flex-direction: column;
                    background: #ffffff;
                }
                .sidebar-header {
                    padding: 2rem 1.5rem;
                }
                .header-top {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    margin-bottom: 2rem;
                }
                .brand-dot {
                    width: 12px;
                    height: 12px;
                    background: var(--secondary);
                    border-radius: 50%;
                    box-shadow: 0 0 10px var(--secondary);
                }
                .header-top h1 {
                    font-size: 1.5rem;
                    font-weight: 900;
                    color: var(--primary);
                    flex: 1;
                    margin: 0;
                    letter-spacing: -0.5px;
                }
                .search-box {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .search-box :global(svg) {
                    position: absolute;
                    left: 1.2rem;
                    color: #94a3b8;
                }
                .search-box input {
                    width: 100%;
                    padding: 1rem 1rem 1rem 3.5rem;
                    background: #f8fafc;
                    border: 1px solid transparent;
                    border-radius: 20px;
                    outline: none;
                    font-weight: 500;
                    transition: all 0.3s;
                }
                .search-box input:focus {
                    background: white;
                    border-color: var(--secondary);
                    box-shadow: 0 4px 15px rgba(212, 175, 55, 0.1);
                }

                .conv-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0.5rem 1rem;
                }
                .conv-item {
                    display: flex;
                    gap: 1.2rem;
                    padding: 1.2rem 1.5rem;
                    border-radius: 24px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    margin-bottom: 0.5rem;
                    position: relative;
                    overflow: hidden;
                }
                .conv-item:hover { background: #f8fafc; }
                .conv-item.active { 
                    background: #f1f5f9;
                }
                .active-indicator {
                    position: absolute;
                    left: 0; top: 0; bottom: 0;
                    width: 4px;
                    background: var(--secondary);
                }

                .avatar-wrapper { position: relative; flex-shrink: 0; }
                .avatar-main {
                    width: 56px; height: 56px;
                    background: linear-gradient(135deg, #1e293b, #0f172a);
                    border-radius: 20px;
                    display: flex;
                    align-items: center; justify-content: center;
                    color: #d4af37;
                    font-weight: 800; font-size: 1.4rem;
                }
                .notification-ping {
                    position: absolute; top: -2px; right: -2px;
                    width: 12px; height: 12px;
                    background: #ef4444; border-radius: 50%;
                    animation: ping 1.5s infinite;
                }
                @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
                .unread-count {
                    position: absolute; top: -5px; right: -5px;
                    background: #ef4444; color: white;
                    font-size: 0.6rem; font-weight: 900;
                    padding: 2px 6px; border-radius: 10px;
                    border: 2px solid white;
                }

                .conv-meta { flex: 1; min-width: 0; }
                .meta-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.3rem; }
                .name { font-weight: 700; color: #1e293b; font-size: 1rem; }
                .time { font-size: 0.65rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
                .last-message { font-size: 0.85rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
                .last-message.highlight { color: #1e293b; font-weight: 700; }

                /* Chat Styles */
                .chat-window {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: #ffffff;
                }
                .chat-header {
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255,255,255,0.9);
                    backdrop-filter: blur(15px);
                    z-index: 10;
                }
                .user-info { display: flex; align-items: center; gap: 1.2rem; }
                .chat-avatar-box {
                    width: 48px; height: 48px;
                    background: var(--primary); border-radius: 18px;
                    color: white; display: flex; align-items: center; justify-content: center;
                    font-weight: 700; font-size: 1.2rem; position: relative;
                }
                .online-indicator {
                    position: absolute; bottom: -2px; right: -2px;
                    width: 12px; height: 12px;
                    background: #10b981; border-radius: 50%;
                    border: 3px solid white;
                }
                .chat-details h3 { margin: 0; font-size: 1.2rem; font-weight: 900; color: var(--primary); letter-spacing: -0.3px; }
                .presence { font-size: 0.7rem; color: #10b981; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
                .header-actions { display: flex; gap: 0.5rem; }
                .icon-btn-ghost { padding: 0.7rem; border-radius: 14px; border: none; background: transparent; color: #94a3b8; cursor: pointer; transition: all 0.2s; }
                .icon-btn-ghost:hover { background: #f1f5f9; color: var(--primary); }

                .property-context-card {
                    margin: 1.5rem 2rem;
                    padding: 1rem;
                    background: #fafaf9;
                    border: 1px solid #f1f5f9;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 1.2rem;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                }
                .p-thumb { width: 64px; height: 48px; border-radius: 12px; overflow: hidden; }
                .p-thumb img { width: 100%; height: 100%; object-fit: cover; }
                .p-body { flex: 1; }
                .p-label { font-size: 0.55rem; font-weight: 900; color: var(--secondary); letter-spacing: 1.5px; margin: 0 0 0.2rem 0; }
                .p-title { font-size: 0.95rem; font-weight: 800; color: #1e293b; margin: 0; }
                .p-meta { display: flex; gap: 1rem; font-size: 0.75rem; color: #64748b; font-weight: 600; margin-top: 4px; }
                .p-price { color: var(--primary); font-weight: 700; }
                .p-link { padding: 0.7rem; background: white; border-radius: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); color: #94a3b8; transition: all 0.2s; }
                .p-link:hover { color: var(--secondary); transform: translateY(-2px); }

                .messages-flow {
                    flex: 1;
                    padding: 0 2rem;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    background-image: radial-gradient(#f1f5f9 1px, transparent 1px);
                    background-size: 20px 20px;
                }
                .date-tag {
                    text-align: center;
                    margin: 3rem 0 2rem;
                    position: relative;
                }
                .date-tag::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: #f1f5f9; z-index: 1; }
                .date-tag span {
                    position: relative; z-index: 2;
                    background: #ffffff;
                    padding: 0.4rem 1rem;
                    border-radius: 10px;
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: #94a3b8;
                    letter-spacing: 1.5px;
                    border: 1px solid #f1f5f9;
                }

                .message-wrap { display: flex; gap: 1rem; margin-bottom: 2rem; max-width: 85%; }
                .message-wrap.mine { align-self: flex-end; flex-direction: row-reverse; }
                .msg-avatar { 
                    width: 32px; height: 32px; 
                    background: #f1f5f9; color: #94a3b8; 
                    border-radius: 10px; 
                    display: flex; align-items: center; justify-content: center; 
                    font-size: 0.8rem; font-weight: 900; 
                    flex-shrink: 0;
                    align-self: flex-end;
                }
                .msg-content { display: flex; flex-direction: column; gap: 0.4rem; }
                .mine .msg-content { align-items: flex-end; }

                .msg-bubble {
                    padding: 1rem 1.4rem;
                    border-radius: 24px;
                    position: relative;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                }
                .mine .msg-bubble {
                    background: var(--primary);
                    color: white;
                    border-bottom-right-radius: 4px;
                    box-shadow: 0 10px 20px rgba(15, 23, 42, 0.1);
                }
                .theirs .msg-bubble {
                    background: white;
                    color: #1e293b;
                    border-bottom-left-radius: 4px;
                    border: 1px solid #f1f5f9;
                }
                .msg-text { margin: 0; font-size: 1rem; line-height: 1.6; font-weight: 500; }
                .msg-info { font-size: 0.65rem; font-weight: 700; color: #94a3b8; display: flex; gap: 0.4rem; align-items: center; }
                .mine .msg-info { color: rgba(255,255,255,0.5); }
                .read-status { color: var(--secondary); font-size: 0.8rem; }

                .card-msg {
                    padding: 1rem;
                    border-radius: 16px;
                    margin-bottom: 0.5rem;
                }
                .rental { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); }
                .theirs .rental { background: #f8fafc; border-color: #f1f5f9; }
                .boost { background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.2); color: var(--secondary); }
                .tag { font-size: 0.6rem; font-weight: 900; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem; letter-spacing: 1px; }
                .action-btn-gold {
                    margin-top: 1rem; width: 100%; border: none;
                    background: var(--secondary); color: var(--primary);
                    padding: 0.8rem; border-radius: 12px;
                    font-weight: 900; font-size: 0.75rem;
                    text-transform: uppercase; cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
                }
                .action-btn-gold:hover { transform: translateY(-2px); filter: brightness(1.1); }

                /* Footer Input bar */
                .chat-input-bar {
                    padding: 2rem;
                    background: white;
                    border-top: 1px solid #f1f5f9;
                }
                .input-field-group { display: flex; gap: 1rem; align-items: center; }
                .input-entry {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    background: #f8fafc;
                    border-radius: 24px;
                    padding: 0.4rem 1.4rem;
                    border: 1px solid transparent;
                    transition: all 0.3s;
                }
                .input-entry:focus-within { background: white; border-color: #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
                .input-entry input {
                    flex: 1;
                    padding: 1rem 0.5rem;
                    background: transparent;
                    border: none;
                    outline: none;
                    font-weight: 500;
                    font-size: 1rem;
                }
                .tool-btn, .emoji-btn { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0.6rem; transition: color 0.2s; }
                .tool-btn:hover, .emoji-btn:hover { color: var(--primary); }
                .action-send {
                    width: 60px; height: 60px;
                    background: var(--primary); color: white;
                    border: none; border-radius: 22px;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.2);
                }
                .action-send:hover:not(:disabled) { transform: translateY(-3px) scale(1.05); }
                .action-send:disabled { opacity: 0.3; transform: none; box-shadow: none; cursor: default; }

                .input-hints { text-align: center; margin-top: 1rem; font-size: 0.65rem; color: #cbd5e1; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }

                /* Empty state */
                .chat-empty-state {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center; justify-content: center;
                    text-align: center; background: #fafaf9;
                }
                .empty-icon-card {
                    width: 140px; height: 140px;
                    background: white; border-radius: 50px;
                    display: flex; align-items: center; justify-content: center;
                    margin-bottom: 2.5rem;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.04);
                    color: #e2e8f0;
                }
                .chat-empty-state h2 { font-size: 1.8rem; font-weight: 900; color: var(--primary); margin: 0 0 1rem 0; letter-spacing: -0.5px; }
                .chat-empty-state p { font-weight: 500; color: #94a3b8; max-width: 320px; line-height: 1.6; margin-bottom: 2rem; }
                .empty-stats { display: flex; gap: 0.8rem; }
                .stat-pill { padding: 0.5rem 1rem; background: #f1f5f9; border-radius: 20px; font-size: 0.7rem; font-weight: 800; color: #64748b; text-transform: uppercase; }

                .auth-fallback { height: 100%; display: flex; align-items: center; justify-content: center; padding: 2rem; background: #f8fafc; }
                .fallback-card { text-align: center; max-width: 450px; padding: 4rem; background: white; border-radius: 40px; border: 1px solid white; box-shadow: 0 30px 100px rgba(0,0,0,0.05); }
                .fallback-card h2 { font-size: 2rem; font-weight: 900; margin: 2rem 0 1rem; color: var(--primary); }

                @media (max-width: 768px) {
                    .conv-sidebar { width: 100%; }
                    .chat-window { position: absolute; inset: 0; z-index: 100; }
                    .mobile-hidden { display: none; }
                    .messages-container { position: relative; }
                    .chat-header { padding: 1rem; }
                    .property-context-card { margin: 1rem; }
                    .messages-flow { padding: 0 1rem; }
                    .chat-input-bar { padding: 1rem; }
                    .action-send { width: 50px; height: 50px; border-radius: 18px; }
                }
                .mobile-btn { background: none; border: none; color: #94a3b8; padding: 0.5rem; margin-right: 0.5rem; display: none; }
                @media (max-width: 768px) { .mobile-btn { display: block; } }
            `}</style>
        </div>
    );
};

export default MessagesPage;
