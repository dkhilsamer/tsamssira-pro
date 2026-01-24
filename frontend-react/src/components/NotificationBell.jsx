import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await api.get('/notifications');
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Fetch notifications error:', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Mark all as read error:', error);
        }
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button
                className="bell-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <Bell size={22} />
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="notification-dropdown glass animate-fade-in">
                    <div className="dropdown-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="mark-all-btn">
                                Tout marquer comme lu
                            </button>
                        )}
                        <button onClick={() => setIsOpen(false)} className="close-btn">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="notifications-list">
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`notification-item ${notif.is_read ? 'read' : 'unread'}`}
                                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                                >
                                    <div className="notif-content">
                                        <h4>{notif.title}</h4>
                                        <p>{notif.message}</p>
                                        <span className="time">
                                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: fr })}
                                        </span>
                                        {notif.link && (
                                            <Link to={notif.link} className="notif-link" onClick={() => setIsOpen(false)}>
                                                Voir
                                            </Link>
                                        )}
                                    </div>
                                    {!notif.is_read && <div className="unread-dot"></div>}
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>Aucune notification pour le moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                .notification-bell-container { position: relative; }
                .bell-btn {
                    background: none;
                    border: none;
                    color: var(--text-main);
                    cursor: pointer;
                    position: relative;
                    padding: 8px;
                    border-radius: 50%;
                    transition: background 0.2s;
                    display: flex;
                    align-items: center;
                }
                .bell-btn:hover { background: rgba(0,0,0,0.05); }
                .badge {
                    position: absolute;
                    top: 2px;
                    right: 2px;
                    background: var(--danger);
                    color: white;
                    font-size: 10px;
                    font-weight: bold;
                    min-width: 18px;
                    height: 18px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid var(--surface);
                }
                .notification-dropdown {
                    position: absolute;
                    top: calc(100% + 10px);
                    right: 0;
                    width: 350px;
                    max-height: 500px;
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    box-shadow: var(--shadow);
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .dropdown-header {
                    padding: 1rem;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .dropdown-header h3 { font-size: 1.1rem; margin: 0; color: var(--primary); }
                .mark-all-btn {
                    background: none;
                    border: none;
                    color: var(--secondary);
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                }
                .close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; }
                
                .notifications-list { overflow-y: auto; flex-grow: 1; }
                .notification-item {
                    padding: 1rem;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    gap: 1rem;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .notification-item:hover { background: rgba(0,0,0,0.02); }
                .notification-item.unread { background: rgba(212, 175, 55, 0.05); }
                .notif-content { flex-grow: 1; }
                .notif-content h4 { font-size: 0.95rem; margin: 0 0 0.25rem; color: var(--primary); }
                .notif-content p { font-size: 0.85rem; margin: 0 0 0.5rem; color: var(--text-main); line-height: 1.4; }
                .notif-content .time { font-size: 0.75rem; color: var(--text-muted); }
                .notif-link {
                    display: block;
                    margin-top: 0.5rem;
                    font-size: 0.8rem;
                    color: var(--secondary);
                    font-weight: 600;
                    text-decoration: none;
                }
                .unread-dot { width: 8px; height: 8px; background: var(--secondary); border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
                .empty-state { padding: 3rem 1rem; text-align: center; color: var(--text-muted); }
                
                @media (max-width: 480px) {
                    .notification-dropdown { position: fixed; top: 70px; left: 10px; right: 10px; width: auto; }
                }
            `}</style>
        </div>
    );
};

export default NotificationBell;
