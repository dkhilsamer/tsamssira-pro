import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import {
    Home, Edit, Trash2, Eye, TrendingUp,
    MoreVertical, CheckSquare, XSquare, Plus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const MyPropertiesPage = () => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    useEffect(() => {
        fetchMyProperties();
    }, []);

    const fetchMyProperties = async () => {
        try {
            const data = await api.get('/properties/my-properties');
            setProperties(data);
        } catch (error) {
            toast.error(error.message);
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
                                    {prop.is_boosted ? (
                                        <div className="badge-boost">
                                            <TrendingUp size={14} /> Vedette active
                                        </div>
                                    ) : (
                                        <button className="btn-light-boost" onClick={() => navigate(`/payment?id=${prop.id}`)}>
                                            <TrendingUp size={14} /> Booster
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
            `}</style>
        </div>
    );
};

export default MyPropertiesPage;
