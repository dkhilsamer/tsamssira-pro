import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Check, X, Filter, User, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RequestsPage = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [user] = useState(JSON.parse(localStorage.getItem('user')));

    useEffect(() => {
        // Redirection if not authorized? 
        // Backend handles auth, but frontend should also be smart.
        // Assuming this page is protected layout
        fetchRequests();
    }, []);

    useEffect(() => {
        if (filterStatus === 'all') {
            setFilteredRequests(requests);
        } else {
            setFilteredRequests(requests.filter(r => r.status === filterStatus));
        }
    }, [filterStatus, requests]);

    const fetchRequests = async () => {
        try {
            const data = await api.get('/requests');
            setRequests(data);
            setFilteredRequests(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await api.put(`/requests/${id}/status`, { status: newStatus });
            toast.success(`Demande ${newStatus === 'accepted' ? 'acceptée' : 'rejetée'}`);
            // Update UI locally
            setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (loading) return <div className="loading-state"><div className="spinner"></div></div>;

    // Admin-only check for UI (Optional, backend enforces too)
    const isAdmin = user?.role === 'admin';

    return (
        <div className="container py-12 animate-fade-in">
            <header className="page-header mb-8 flex justify-between items-center">
                <div>
                    <h1>Demandes de Location / Achat</h1>
                    <p className="text-muted">Gérez les demandes reçues pour vos annonces.</p>
                </div>

                {/* ADMIN ONLY FILTER */}
                {isAdmin && (
                    <div className="filter-controls glass p-2 rounded-lg flex gap-2 items-center">
                        <Filter size={16} className="text-muted" />
                        <span className="text-sm font-semibold mr-2">Filtre Admin:</span>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent border-none outline-none font-medium text-primary cursor-pointer"
                        >
                            <option value="all">Toutes les demandes</option>
                            <option value="pending">En attente</option>
                            <option value="accepted">Acceptées</option>
                            <option value="rejected">Rejetées</option>
                        </select>
                    </div>
                )}
            </header>

            <div className="requests-grid">
                {filteredRequests.length > 0 ? (
                    filteredRequests.map(req => (
                        <div key={req.id} className={`request-card glass ${req.status}`}>
                            <div className="card-header">
                                <span className={`status-badge ${req.status}`}>
                                    {req.status === 'pending' ? 'En attente' : req.status === 'accepted' ? 'Acceptée' : 'Rejetée'}
                                </span>
                                <span className="date">{new Date(req.created_at).toLocaleDateString()}</span>
                            </div>

                            <div className="card-body">
                                <h3>{req.visitor_name}</h3>
                                <div className="contact-info">
                                    <p>📧 {req.visitor_email}</p>
                                    <p>📱 {req.visitor_phone}</p>
                                </div>

                                <div className="message-box">
                                    <p><strong>Bien concerné:</strong> {req.property_title || 'Propriété #' + req.property_id}</p>
                                    <p className="mt-2 text-sm italic">"{req.message}"</p>
                                </div>
                            </div>

                            {req.status === 'pending' && (
                                <div className="card-actions">
                                    <button onClick={() => updateStatus(req.id, 'accepted')} className="btn-icon success">
                                        <Check size={20} /> Accepter
                                    </button>
                                    <button onClick={() => updateStatus(req.id, 'rejected')} className="btn-icon danger">
                                        <X size={20} /> Rejeter
                                    </button>
                                </div>
                            )}

                            <div className="card-footer mt-4">
                                <button
                                    className="btn btn-outline w-full flex items-center justify-center gap-2"
                                    onClick={() => navigate('/messages', { state: { userId: req.user_id, username: req.visitor_name } })}
                                >
                                    <MessageSquare size={18} />
                                    Contacter {req.user_id ? 'le membre' : 'le visiteur'}
                                </button>
                                {req.user_id && <div className="member-badge mt-2 text-xs font-semibold text-secondary">✨ Membre inscrit</div>}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <User size={48} className="text-muted mb-4" />
                        <p>Aucune demande trouvée pour ce filtre.</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .requests-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }
                .request-card {
                    padding: 1.5rem;
                    border-radius: 20px;
                    border: 1px solid transparent;
                    transition: all 0.2s;
                }
                .request-card.pending { border-color: #fca5a5; } /* Slight red border hint or yellow? Let's generic */
                
                .card-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
                .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
                .status-badge.pending { background: #fee2e2; color: #b91c1c; } /* Reddish for urgent? Or yellow. */
                .status-badge.accepted { background: #dcfce7; color: #16a34a; }
                .status-badge.rejected { background: #f3f4f6; color: #6b7280; }
                
                .card-body h3 { font-size: 1.2rem; color: var(--primary); margin-bottom: 0.5rem; }
                .contact-info { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem; }
                .message-box { background: rgba(255,255,255,0.5); padding: 0.8rem; border-radius: 12px; font-size: 0.9rem; }

                .card-actions { 
                    display: flex; gap: 0.5rem; margin-top: 1.5rem; pt-4; border-top: 1px solid rgba(0,0,0,0.05); 
                }
                .btn-icon {
                    flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                    padding: 0.6rem; border-radius: 10px; border: none; font-weight: 600; cursor: pointer; transition: all 0.2s;
                }
                .btn-icon.success { background: #dcfce7; color: #16a34a; }
                .btn-icon.success:hover { background: #bbf7d0; }
                .btn-icon.danger { background: #fee2e2; color: #ef4444; }
                .btn-icon.danger:hover { background: #fecaca; }

                .empty-state { grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-muted); }
            `}</style>
        </div>
    );
};

export default RequestsPage;
