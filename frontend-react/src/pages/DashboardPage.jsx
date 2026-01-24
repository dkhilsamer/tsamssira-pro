import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import {
    LayoutDashboard, Plus, Home, MessageSquare,
    Settings, Users, Eye, TrendingUp, Clock, CheckCircle2,
    Send, Mail
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await api.get('/dashboard/stats');
            setStats(data.stats);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-state"><div className="spinner"></div></div>;

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-sidebar glass">
                <div className="sidebar-header">
                    <h3>Tableau de Bord</h3>
                    <p>{user?.role === 'admin' ? 'Administration' : 'Propriétaire'}</p>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/dashboard" className="nav-link active">
                        <LayoutDashboard size={20} /> Aperçu
                    </Link>
                    <Link to="/dashboard/my-properties" className="nav-link">
                        <Home size={20} /> Mes Biens
                    </Link>
                    <Link to="/messages" className="nav-link">
                        <MessageSquare size={20} /> Messages
                        {stats?.unreadMessages > 0 && <span className="badge-sidebar">{stats.unreadMessages}</span>}
                    </Link>
                    {user?.role === 'admin' && (
                        <Link to="/dashboard/users" className="nav-link">
                            <Users size={20} /> Utilisateurs
                        </Link>
                    )}
                    <Link to="/settings" className="nav-link">
                        <Settings size={20} /> Paramètres
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <Link to="/add-property" className="btn btn-secondary w-full">
                        <Plus size={18} /> Ajouter un bien
                    </Link>
                </div>
            </aside>

            <main className="dashboard-main">
                <header className="main-header">
                    <div>
                        <h1>Bonjour, {user?.username} 👋</h1>
                        <p>Voici un résumé de votre activité immobilière.</p>
                    </div>
                </header>

                <div className="stats-grid">
                    <div className="stat-card glass">
                        <div className="icon" style={{ backgroundColor: '#e0f2fe', color: '#0ea5e9' }}>
                            <Home size={24} />
                        </div>
                        <div className="info">
                            <span className="label">Total Propriétés</span>
                            <span className="value">{stats?.properties || 0}</span>
                        </div>
                    </div>
                    <div className="stat-card glass" onClick={() => navigate('/dashboard/requests')} style={{ cursor: 'pointer' }}>
                        <div className="icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                            <MessageSquare size={24} />
                        </div>
                        <div className="info">
                            <span className="label">Demandes Reçues</span>
                            <span className="value">{stats?.requests || 0}</span>
                        </div>
                    </div>
                    <div className="stat-card glass">
                        <div className="icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                            <Eye size={24} />
                        </div>
                        <div className="info">
                            <span className="label">Vues Totales</span>
                            <span className="value">{stats?.totalViews || 0}</span>
                        </div>
                    </div>
                    <div className="stat-card glass" onClick={() => navigate('/dashboard/history')} style={{ cursor: 'pointer' }}>
                        <div className="icon" style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}>
                            <Send size={24} />
                        </div>
                        <div className="info">
                            <span className="label">Demandes Envoyées</span>
                            <span className="value">{stats?.sentRequests || 0}</span>
                        </div>
                    </div>
                    <div className="stat-card glass" onClick={() => navigate('/messages')} style={{ cursor: 'pointer' }}>
                        <div className="icon" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
                            <Mail size={24} />
                        </div>
                        <div className="info">
                            <span className="label">Messages non-lus</span>
                            <span className="value">{stats?.unreadMessages || 0}</span>
                        </div>
                    </div>
                    <div className="stat-card glass">
                        <div className="icon" style={{ backgroundColor: '#fce7f3', color: '#db2777' }}>
                            <TrendingUp size={24} />
                        </div>
                        <div className="info">
                            <span className="label">Biens Boostés</span>
                            <span className="value">{stats?.boosted || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="recent-activity">
                    <div className="activity-card glass">
                        <div className="card-header">
                            <h3>Statut des Demandes</h3>
                        </div>
                        <div className="activity-stats">
                            <div className="activity-item">
                                <div className="status-indicator pending"></div>
                                <div className="item-info">
                                    <span className="item-label">En attente</span>
                                    <span className="item-count">{stats?.pending || 0}</span>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="status-indicator accepted"></div>
                                <div className="item-info">
                                    <span className="item-label">Acceptées</span>
                                    <span className="item-count">{stats?.accepted || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="quick-actions">
                        <h3>Actions Rapides</h3>
                        <div className="actions-grid">
                            <button className="action-btn glass" onClick={() => navigate('/add-property')}>
                                <Plus size={24} />
                                <span>Publier une annonce</span>
                            </button>
                            <button className="action-btn glass" onClick={() => navigate('/dashboard/requests')}>
                                <MessageSquare size={24} />
                                <span>Voir les demandes</span>
                            </button>
                            <button className="action-btn glass" onClick={() => navigate('/dashboard/my-properties')}>
                                <TrendingUp size={24} />
                                <span>Booster un bien</span>
                            </button>
                            <button className="action-btn glass" onClick={() => navigate('/dashboard/history')}>
                                <Clock size={24} />
                                <span>Historique</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main >

            <style jsx>{`
                .dashboard-layout {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    min-height: calc(100vh - 80px);
                    background: #f8fafc;
                }
                .dashboard-sidebar {
                    padding: 2rem;
                    border-right: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    background: rgba(255, 255, 255, 0.5);
                    backdrop-filter: blur(10px);
                }
                
                @media (max-width: 1024px) {
                    .dashboard-layout { grid-template-columns: 1fr; }
                    .dashboard-sidebar { 
                        display: none; /* Hide sidebar on small screens for now, relying on mobile nav or other means */
                    }
                    .dashboard-main { padding: 1.5rem; }
                }

                @media (max-width: 640px) {
                    .main-header h1 { font-size: 1.5rem; }
                    .stats-grid { grid-template-columns: 1fr; gap: 1rem; }
                    .recent-activity { grid-template-columns: 1fr; gap: 2rem; }
                    .actions-grid { grid-template-columns: 1fr; }
                    .stat-card { padding: 1.5rem; }
                }

                .sidebar-header { margin-bottom: 2.5rem; padding-left: 1rem; }
                .sidebar-header h3 { 
                    font-family: var(--font-heading);
                    font-size: 1.8rem; 
                    color: var(--primary); 
                    margin-bottom: 0.25rem;
                }
                .sidebar-header p { 
                    font-size: 0.75rem; 
                    color: var(--secondary); 
                    font-weight: 700;
                    text-transform: uppercase; 
                    letter-spacing: 2px; 
                }
                
                .sidebar-nav { display: flex; flex-direction: column; gap: 0.75rem; flex-grow: 1; }
                .nav-link {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem 1.5rem;
                    text-decoration: none;
                    color: var(--text-muted);
                    border-radius: 12px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    font-weight: 500;
                    border: 1px solid transparent;
                }
                .nav-link:hover {
                    background: white;
                    color: var(--primary);
                    transform: translateX(5px);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                }
                .nav-link.active { 
                    background: white;
                    color: var(--secondary);
                    font-weight: 700;
                    box-shadow: 0 4px 20px rgba(212, 175, 55, 0.15);
                    border-color: rgba(212, 175, 55, 0.1);
                }
                /* Active Tab Indicator */
                .nav-link.active::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    height: 50%;
                    width: 4px;
                    background: var(--secondary);
                    border-top-right-radius: 4px;
                    border-bottom-right-radius: 4px;
                }

                .badge-sidebar {
                    background: #ef4444;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    margin-left: auto;
                    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
                }
                
                .dashboard-main { padding: 3rem; }
                .main-header { margin-bottom: 3rem; display: flex; justify-content: space-between; align-items: center; }
                .main-header h1 { font-size: 2rem; color: var(--primary); margin-bottom: 0.5rem; }
                .main-header p { color: var(--text-muted); }

                .stats-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
                    gap: 2rem; 
                    margin-bottom: 3rem; 
                }
                .stat-card {
                    padding: 2rem;
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    transition: transform 0.2s;
                }
                .stat-card:hover { transform: translateY(-3px); }
                .stat-card .icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                }
                .stat-card .info { display: flex; flex-direction: column; gap: 0.25rem; }
                .stat-card .label { font-size: 0.9rem; color: var(--text-muted); font-weight: 500; }
                .stat-card .value { font-size: 2rem; font-weight: 800; color: var(--primary); line-height: 1; }

                .recent-activity { 
                    display: grid; 
                    grid-template-columns: 2fr 1fr; 
                    gap: 2rem; 
                }
                .activity-card { padding: 2rem; border-radius: 24px; height: 100%; }
                .activity-card h3 { font-size: 1.4rem; margin-bottom: 2rem; color: var(--primary); }
                
                .activity-stats { display: flex; flex-direction: column; gap: 1rem; }
                .activity-item { 
                    display: flex; 
                    align-items: center; 
                    gap: 1.2rem; 
                    padding: 1.25rem;
                    background: #f8fafc;
                    border-radius: 16px;
                    border: 1px solid transparent;
                    transition: all 0.2s;
                }
                .activity-item:hover { border-color: var(--border); background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
                .status-indicator { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
                .status-indicator.pending { background: #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.4); }
                .status-indicator.accepted { background: #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }
                .item-info { display: flex; justify-content: space-between; width: 100%; align-items: center; }
                .item-label { font-weight: 600; color: var(--text-main); }
                .item-count { font-size: 1.2rem; font-weight: 800; color: var(--primary); }

                .quick-actions h3 { font-size: 1.4rem; margin-bottom: 2rem; color: var(--primary); }
                .actions-grid { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 1rem; 
                }
                .action-btn {
                    padding: 1.5rem;
                    border: 1px solid transparent;
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    color: var(--text-muted);
                    background: white;
                    height: 100%;
                }
                .action-btn:hover {
                    transform: translateY(-4px);
                    color: var(--secondary);
                    border-color: var(--secondary);
                    box-shadow: 0 10px 30px rgba(212, 175, 55, 0.1);
                }
                .action-btn span { font-weight: 600; font-size: 0.85rem; }

                @media (max-width: 1024px) {
                    .recent-activity { grid-template-columns: 1fr; }
                }
            `}</style>
        </div >
    );
};

export default DashboardPage;
