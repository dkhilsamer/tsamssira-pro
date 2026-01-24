import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import {
    Home, Edit, Trash2, Eye, TrendingUp,
    MoreVertical, CheckSquare, XSquare, Plus,
    List, Phone, Mail as MailIcon, User as UserIcon, MessageSquare
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const MyPropertiesPage = () => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPropRequests, setSelectedPropRequests] = useState(null);
    const [showRequestsModal, setShowRequestsModal] = useState(false);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    useEffect(() => {
        fetchMyProperties();
    }, []);

    const fetchMyProperties = async () => {
        try {
            const response = await api.get('/properties/my-properties');

            // Safety check for response format
            let data = [];
            if (Array.isArray(response)) {
                data = response;
            } else if (response && Array.isArray(response.data)) {
                data = response.data;
            } else {
                console.warn('Unexpected API response format:', response);
            }

            setProperties(data);
        } catch (error) {
            toast.error(error.message);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;
        try {
            await api.delete(`/properties/${id}`);
            toast.success('Propriété supprimée');
            setProperties(properties.filter(p => p.id !== id));
        } catch (error) {
            toast.error(error.message);
        }
    };

    const toggleVisibility = async (id, currentStatus) => {
        try {
            await api.put(`/properties/${id}/visibility`, { is_visible: !currentStatus });
            toast.success('Visibilité mise à jour');
            fetchMyProperties();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const fetchPropertyRequests = async (propertyId) => {
        try {
            const data = await api.get(`/requests/property/${propertyId}`);
            setSelectedPropRequests(data);
            setShowRequestsModal(true);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/180x120?text=Indisponible';
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${BACKEND_URL}${cleanPath}`;
    };

    if (loading) return <div className="loading-state"><div className="spinner"></div></div>;

    return (
        <div className="my-properties container py-12 animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>Mes Annonces</h1>
                    <p>Gérez vos biens immobiliers et suivez leurs performances.</p>
                </div>
                <Link to="/add-property" className="btn btn-secondary">
                    <Plus size={20} /> Publier un bien
                </Link>
            </div>

            <div className="properties-list">
                {properties.length > 0 ? (
                    properties.map(prop => (
                        <div key={prop.id} className="property-item glass">
                            <div className="prop-img">
                                <img src={getImageUrl(prop.main_image)} alt={prop.title} />
                            </div>

                            <div className="prop-main">
                                <div className="prop-info">
                                    <div className="title-price">
                                        <h3>{prop.title}</h3>
                                        <span className="price">{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(prop.price)}</span>
                                    </div>
                                    <div className="meta">
                                        <span>📍 {prop.location}</span>
                                        <span>🏠 {prop.type}</span>
                                        <span>📅 Publié le {new Date(prop.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="prop-stats">
                                    <div className="stat">
                                        <Eye size={18} />
                                        <span>{prop.views || 0} vues</span>
                                    </div>
                                    <button className="btn-view-requests" onClick={() => fetchPropertyRequests(prop.id)}>
                                        <List size={14} /> Demandes
                                    </button>
                                    {prop.is_boosted ? (
                                        <div className="badge-boost">
                                            <TrendingUp size={14} /> Vedette active
                                        </div>
                                    ) : (
                                        <button className="btn-light-boost" onClick={() => navigate(`/payment?id=${prop.id}`)}>
                                            <TrendingUp size={14} />
                                            {JSON.parse(localStorage.getItem('user'))?.role === 'admin' ? 'Booster (Admin)' : 'Demander Boost'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="prop-actions">
                                <div className={`status-badge ${prop.is_visible ? 'visible' : 'hidden'}`}>
                                    {prop.is_visible ? 'Visible' : 'Masqué'}
                                </div>
                                <div className="actions-buttons">
                                    <button onClick={() => toggleVisibility(prop.id, prop.is_visible)} title="Changer la visibilité">
                                        {prop.is_visible ? <CheckSquare size={20} color="#10b981" /> : <XSquare size={20} color="#ef4444" />}
                                    </button>
                                    <Link to={`/property/${prop.id}`} className="action-icon"><Eye size={20} /></Link>
                                    <Link to={`/edit-property/${prop.id}`} className="action-icon"><Edit size={20} /></Link>
                                    <button onClick={() => handleDelete(prop.id)} className="action-icon delete"><Trash2 size={20} /></button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state glass">
                        <Home size={64} color="#cbd5e1" />
                        <h3>Aucune annonce pour le moment</h3>
                        <p>Commencez par publier votre premier bien immobilier.</p>
                        <Link to="/add-property" className="btn btn-primary mt-4">Publier ma première annonce</Link>
                    </div>
                )}
            </div>

            {showRequestsModal && (
                <div className="modal-overlay" onClick={() => setShowRequestsModal(false)}>
                    <div className="modal-content glass animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Demandes de renseignements</h2>
                            <button className="close-btn" onClick={() => setShowRequestsModal(false)}>×</button>
                        </div>
                        <div className="requests-list-modal">
                            {selectedPropRequests && selectedPropRequests.length > 0 ? (
                                selectedPropRequests.map(req => (
                                    <div key={req.id} className="request-card">
                                        <div className="req-user">
                                            <UserIcon size={20} />
                                            <strong>{req.visitor_name}</strong>
                                        </div>
                                        <div className="req-details">
                                            <a href={`mailto:${req.visitor_email}`} className="req-link"><MailIcon size={14} /> {req.visitor_email}</a>
                                            <a href={`tel:${req.visitor_phone}`} className="req-link"><Phone size={14} /> {req.visitor_phone}</a>
                                            <div className="req-type">Type: {req.request_type}</div>
                                        </div>
                                        <div className="req-message">
                                            <MessageSquare size={14} /> {req.message}
                                        </div>
                                        <div className="req-date">
                                            {new Date(req.created_at).toLocaleDateString()} à {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-requests">Aucune demande pour ce bien pour le moment.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .my-properties { max-width: 1200px; }
                .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3rem; }
                .page-header h1 { font-size: 2.5rem; color: var(--primary); }
                .page-header p { color: var(--text-muted); }

                .properties-list { display: flex; flex-direction: column; gap: 1.5rem; }
                .property-item { 
                    display: grid; 
                    grid-template-columns: 180px 1fr 200px; 
                    gap: 2rem; 
                    padding: 1.5rem; 
                    border-radius: 20px; 
                    align-items: center;
                    transition: all 0.2s;
                }
                .property-item:hover { transform: translateX(5px); background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                
                .prop-img { height: 120px; border-radius: 12px; overflow: hidden; }
                .prop-img img { width: 100%; height: 100%; object-fit: cover; }
                
                .prop-main { display: flex; flex-direction: column; gap: 1rem; }
                .title-price { display: flex; align-items: center; gap: 2rem; }
                .title-price h3 { font-size: 1.25rem; color: var(--primary); }
                .title-price .price { color: var(--secondary); font-weight: 800; }
                
                .meta { display: flex; gap: 1.5rem; font-size: 0.85rem; color: var(--text-muted); }
                
                .prop-stats { display: flex; align-items: center; gap: 1.5rem; }
                .stat { display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); font-size: 0.9rem; }
                
                .badge-boost { 
                    background: #fef3c7; color: #d97706; padding: 4px 12px; border-radius: 20px; 
                    font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 4px;
                }
                .btn-light-boost {
                    background: none; border: 1px solid var(--secondary); color: var(--secondary);
                    padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700;
                    cursor: pointer; display: flex; align-items: center; gap: 4px;
                }
                .btn-view-requests {
                    background: #f1f5f9; border: 1px solid var(--border); color: var(--primary);
                    padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700;
                    cursor: pointer; display: flex; align-items: center; gap: 4px;
                    transition: all 0.2s;
                }
                .btn-view-requests:hover { background: var(--border); }

                .prop-actions { text-align: right; display: flex; flex-direction: column; gap: 1rem; align-items: flex-end; }
                .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
                .status-badge.visible { background: #dcfce7; color: #16a34a; }
                .status-badge.hidden { background: #fee2e2; color: #ef4444; }
                
                .actions-buttons { display: flex; gap: 1rem; }
                .action-icon { color: var(--text-muted); padding: 8px; border-radius: 8px; transition: all 0.2s; background: none; border: none; cursor: pointer; }
                .action-icon:hover { background: #f1f5f9; color: var(--primary); }
                .action-icon.delete:hover { background: #fee2e2; color: #ef4444; }

                .empty-state { text-align: center; padding: 5rem; border-radius: 30px; }
                .empty-state h3 { margin-top: 2rem; font-size: 1.5rem; }
                .empty-state p { color: var(--text-muted); }
                
                @media (max-width: 900px) {
                    .property-item { grid-template-columns: 1fr; }
                    .prop-img { height: 200px; }
                    .prop-actions { flex-direction: row; justify-content: space-between; align-items: center; width: 100%; border-top: 1px solid var(--border); padding-top: 1rem; }
                }

                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
                    z-index: 2000; padding: 1rem; backdrop-filter: blur(4px);
                }
                .modal-content {
                    background: white; width: 100%; max-width: 600px; max-height: 80vh;
                    border-radius: 24px; padding: 2rem; overflow-y: auto; position: relative;
                }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .close-btn { background: none; border: none; font-size: 2rem; cursor: pointer; color: var(--text-muted); }
                
                .request-card {
                    background: var(--background); padding: 1.5rem; border-radius: 16px; margin-bottom: 1rem;
                    border: 1px solid var(--border);
                }
                .req-user { display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem; color: var(--primary); margin-bottom: 0.5rem; }
                .req-details { display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.9rem; margin-bottom: 1rem; }
                .req-link { display: flex; align-items: center; gap: 0.3rem; color: var(--secondary); text-decoration: none; font-weight: 600; }
                .req-link:hover { text-decoration: underline; }
                .req-type { color: var(--text-muted); font-size: 0.8rem; }
                .req-message { font-size: 0.95rem; color: var(--text-main); font-style: italic; background: white; padding: 1rem; border-radius: 12px; margin-bottom: 0.5rem; display: flex; gap: 0.5rem; }
                .req-date { font-size: 0.75rem; color: var(--text-muted); text-align: right; }
                
                .no-requests { text-align: center; color: var(--text-muted); padding: 2rem; }
                
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up { animation: slideUp 0.3s ease; }
            `}</style>
        </div>
    );
};

export default MyPropertiesPage;
