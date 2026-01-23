import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import {
    LayoutDashboard, Plus, Home, MessageSquare,
    Settings, Users, Eye, TrendingUp, Clock, CheckCircle2
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
                    <div className="stat-card glass">
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
                            <button className="action-btn glass" onClick={() => navigate('/messages')}>
                                <MessageSquare size={24} />
                                <span>Voir les messages</span>
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
            </main>

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
                }
                
                @media (max-width: 1024px) {
                    .dashboard-layout { grid-template-columns: 1fr; }
                    .dashboard-sidebar { 
                        position: sticky;
                        top: 70px;
                        height: auto;
                        flex-direction: row;
                        overflow-x: auto;
                        padding: 1rem;
                        z-index: 10;
                    }
                    .sidebar-header, .sidebar-footer { display: none; }
                    .sidebar-nav { flex-direction: row; gap: 0.5rem; }
                    .nav-link { white-space: nowrap; padding: 0.6rem 1rem; }
                    .dashboard-main { padding: 1.5rem; }
                }

                @media (max-width: 640px) {
                    .main-header h1 { font-size: 1.5rem; }
                    .stats-grid { grid-template-columns: 1fr; gap: 1rem; }
                    .recent-activity { grid-template-columns: 1fr; gap: 2rem; }
                    .actions-grid { grid-template-columns: 1fr; }
                    .stat-card { padding: 1.5rem; }
                }

                .sidebar-header { margin-bottom: 3rem; }
                .sidebar-header h3 { font-size: 1.5rem; color: var(--primary); }
                .sidebar-header p { font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
                
                .sidebar-nav { display: flex; flex-direction: column; gap: 0.5rem; flex-grow: 1; }
                .nav-link {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.8rem 1.2rem;
                    text-decoration: none;
                    color: var(--text-muted);
                    border-radius: 12px;
                    transition: all 0.2s;
                    font-weight: 500;
                }
                .nav-link:hover, .nav-link.active {
                    background: white;
                    color: var(--primary);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .nav-link.active { border: 1px solid var(--border); }
                
                .dashboard-main { padding: 3rem; }
                .main-header { margin-bottom: 3rem; display: flex; justify-content: space-between; align-items: center; }
                .main-header h1 { font-size: 2rem; color: var(--primary); margin-bottom: 0.5rem; }
                .main-header p { color: var(--text-muted); }

                .stats-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); 
                    gap: 2rem; 
                    margin-bottom: 3rem; 
                }
                .stat-card {
                    padding: 2rem;
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }
                .stat-card .icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .stat-card .info { display: flex; flex-direction: column; }
                .stat-card .label { font-size: 0.9rem; color: var(--text-muted); }
                .stat-card .value { font-size: 1.8rem; font-weight: 800; color: var(--primary); }

                .recent-activity { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 3rem; 
                }
                .activity-card { padding: 2.5rem; border-radius: 24px; }
                .activity-card h3 { font-size: 1.3rem; margin-bottom: 2rem; color: var(--primary); }
                
                .activity-stats { display: flex; flex-direction: column; gap: 1.5rem; }
                .activity-item { 
                    display: flex; 
                    align-items: center; 
                    gap: 1.2rem; 
                    padding: 1rem;
                    background: #f1f5f9;
                    border-radius: 16px;
                }
                .status-indicator { width: 12px; height: 12px; border-radius: 50%; }
                .status-indicator.pending { background: #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.4); }
                .status-indicator.accepted { background: #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }
                .item-info { display: flex; justify-content: space-between; width: 100%; align-items: center; }
                .item-label { font-weight: 600; color: var(--text-main); }
                .item-count { font-size: 1.2rem; font-weight: 800; color: var(--primary); }

                .quick-actions h3 { font-size: 1.3rem; margin-bottom: 2rem; color: var(--primary); }
                .actions-grid { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 1.5rem; 
                }
                .action-btn {
                    padding: 1.5rem;
                    border: none;
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: var(--primary);
                }
                .action-btn:hover {
                    transform: translateY(-5px);
                    background: white;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                }
                .action-btn span { font-weight: 600; font-size: 0.9rem; }

                @media (max-width: 1024px) {
                    .dashboard-layout { grid-template-columns: 1fr; }
                    .dashboard-sidebar { display: none; }
                    .recent-activity { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default DashboardPage;
