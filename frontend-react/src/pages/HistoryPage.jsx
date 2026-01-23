import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Clock, Home, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const HistoryPage = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            // Fetch properties, received requests, and sent requests
            const [propertiesRes, receivedReqsRes, sentReqsRes] = await Promise.all([
                api.get('/dashboard/my-properties'),
                api.get('/requests'),
                api.get('/requests/sent')
            ]);

            const properties = propertiesRes || [];
            const receivedRequests = receivedReqsRes || [];
            const sentRequests = sentReqsRes || [];

            const timeline = [];

            // Add Property Creation Events
            properties.forEach(p => {
                timeline.push({
                    type: 'property_created',
                    date: new Date(p.created_at),
                    title: 'Propriété ajoutée',
                    description: `Vous avez ajouté "${p.title}"`,
                    link: `/properties/${p.id}`,
                    icon: <Home size={18} />
                });

                // Add Boost Events if applicable
                if (p.is_boosted) {
                    const date = p.boost_start_date ? new Date(p.boost_start_date) : new Date(p.updated_at);
                    timeline.push({
                        type: 'boost_activated',
                        date: date,
                        title: 'Boost actif',
                        description: `Le boost pour "${p.title}" est actif.`,
                        link: `/properties/${p.id}`,
                        icon: <CheckCircle2 size={18} color="#16a34a" />
                    });
                }
            });

            // Add Received Request Events
            receivedRequests.forEach(r => {
                timeline.push({
                    type: 'request_received',
                    date: new Date(r.created_at),
                    title: 'Demande reçue',
                    description: `Nouvelle demande de ${r.visitor_name} pour "${r.property_title || 'un bien'}".`,
                    link: '/dashboard',
                    icon: <AlertCircle size={18} color="#d97706" />
                });
            });

            // Add Sent Request Events
            sentRequests.forEach(r => {
                timeline.push({
                    type: 'request_sent',
                    date: new Date(r.created_at),
                    title: 'Demande envoyée',
                    description: `Vous avez envoyé une demande pour "${r.property_title}".`,
                    link: `/properties/${r.property_id}`,
                    icon: <Send size={18} color="#2563eb" />
                });
            });

            // Sort by date descending
            timeline.sort((a, b) => b.date - a.date);
            setActivities(timeline);

        } catch (error) {
            console.error(error);
            toast.error('Erreur chargement historique');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-state"><div className="spinner"></div></div>;

    return (
        <div className="container py-12 animate-fade-in">
            <header className="page-header mb-8">
                <h1><Clock className="inline mr-3" /> Historique d'activité</h1>
                <p className="text-muted">Retrouvez les événements récents de votre compte.</p>
            </header>

            <div className="history-timeline">
                {activities.length === 0 ? (
                    <div className="empty-state">
                        <p>Aucune activité récente.</p>
                        <Link to="/dashboard" className="btn btn-primary mt-4">Retour au tableau de bord</Link>
                    </div>
                ) : (
                    activities.map((item, index) => (
                        <div key={index} className="timeline-item glass">
                            <div className="timeline-icon">
                                {item.icon}
                            </div>
                            <div className="timeline-content">
                                <div className="timeline-header">
                                    <h3>{item.title}</h3>
                                    <span className="date">{item.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p>{item.description}</p>
                                {item.link && (
                                    <Link to={item.link} className="btn-link">Voir détails</Link>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .page-header h1 { font-size: 2rem; color: var(--primary); display: flex; align-items: center; }
                .text-muted { color: var(--text-muted); margin-top: 0.5rem; }
                
                .history-timeline {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    max-width: 800px;
                    margin: 0 auto;
                }

                .timeline-item {
                    display: flex;
                    gap: 1.5rem;
                    padding: 1.5rem;
                    border-radius: 16px;
                    align-items: flex-start;
                }
                
                .timeline-icon {
                    background: #f1f5f9;
                    padding: 12px;
                    border-radius: 50%;
                    color: var(--primary);
                    flex-shrink: 0;
                }

                .timeline-content { flex-grow: 1; }
                .timeline-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
                .timeline-header h3 { font-size: 1.1rem; font-weight: 600; color: var(--text-main); }
                .date { font-size: 0.85rem; color: var(--text-muted); }
                
                .btn-link { 
                    display: inline-block; 
                    margin-top: 0.5rem; 
                    font-size: 0.9rem; 
                    color: var(--secondary); 
                    font-weight: 500;
                    text-decoration: none;
                }
                .btn-link:hover { text-decoration: underline; }

                .empty-state { text-align: center; padding: 4rem; color: var(--text-muted); }
            `}</style>
        </div>
    );
};

export default HistoryPage;
