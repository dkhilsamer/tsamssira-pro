import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Bed, Bath, Maximize, MapPin, Send, MessageCircle } from 'lucide-react';

const PropertyDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [contactData, setContactData] = useState({
        visitor_name: '',
        visitor_email: '',
        visitor_phone: '',
        num_persons: 1,
        message: 'Je suis intéressé par cette propriété.'
    });

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    useEffect(() => {
        fetchProperty();
    }, [id]);

    const fetchProperty = async () => {
        try {
            const data = await api.get(`/properties/${id}`);
            setProperty(data);
        } catch (error) {
            toast.error(error.message);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleContact = async (e) => {
        e.preventDefault();
        try {
            await api.post('/requests', { ...contactData, property_id: id });
            toast.success('Demande envoyée avec succès !');
        } catch (error) {
            toast.error(error.message);
        }
    };

    const startChat = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            toast.error('Veuillez vous connecter pour discuter.');
            navigate('/login');
            return;
        }
        try {
            const msg = `Bonjour, je suis intéressé par votre propriété "${property.title}".`;
            await api.post('/messages', {
                receiver_id: property.user_id,
                content: msg,
                property_id: property.id
            });
            navigate('/messages');
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/1200x600?text=Indisponible';
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${BACKEND_URL}${cleanPath}`;
    };

    if (loading) return <div className="loading-state"><div className="spinner"></div></div>;

    return (
        <div className="property-detail container py-12 animate-fade-in">
            <div className="main-image">
                <img src={getImageUrl(property.main_image)} alt={property.title} />
                <div className="type-badge">{property.type}</div>
            </div>

            <div className="content-grid">
                <div className="details-card">
                    <div className="header">
                        <div className="price">{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(property.price)}</div>
                        <h1>{property.title}</h1>
                        <p className="location"><MapPin size={18} /> {property.location}</p>
                    </div>

                    <div className="stats-grid">
                        <div className="stat">
                            <Bed size={24} />
                            <div>
                                <span className="value">{property.bedrooms}</span>
                                <span className="label">Chambres</span>
                            </div>
                        </div>
                        <div className="stat">
                            <Bath size={24} />
                            <div>
                                <span className="value">{property.bathrooms}</span>
                                <span className="label">Bains</span>
                            </div>
                        </div>
                        <div className="stat">
                            <Maximize size={24} />
                            <div>
                                <span className="value">{property.area} m²</span>
                                <span className="label">Surface</span>
                            </div>
                        </div>
                    </div>

                    <div className="description">
                        <h3>Description</h3>
                        <p>{property.description}</p>
                    </div>
                </div>

                <div className="sidebar">
                    <div className="contact-card glass">
                        <h3>Contacter le propriétaire</h3>

                        <button onClick={startChat} className="btn btn-secondary w-full mb-6">
                            <MessageCircle size={20} /> Discuter en direct
                        </button>

                        <div className="divider">OU</div>

                        <form onSubmit={handleContact} className="contact-form">
                            <input
                                className="form-input"
                                placeholder="Votre Nom"
                                required
                                value={contactData.visitor_name}
                                onChange={(e) => setContactData({ ...contactData, visitor_name: e.target.value })}
                            />
                            <input
                                className="form-input"
                                type="email"
                                placeholder="Email"
                                required
                                value={contactData.visitor_email}
                                onChange={(e) => setContactData({ ...contactData, visitor_email: e.target.value })}
                            />
                            <textarea
                                className="form-input"
                                rows="4"
                                placeholder="Message"
                                value={contactData.message}
                                onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                            ></textarea>
                            <button type="submit" className="btn btn-primary w-full">
                                <Send size={18} /> Envoyer la demande
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .property-detail { padding-top: 1.5rem; }
                .main-image {
                    height: 50vh;
                    min-height: 300px;
                    border-radius: 20px;
                    overflow: hidden;
                    position: relative;
                    margin-bottom: 2rem;
                }
                .main-image img { width: 100%; height: 100%; object-fit: cover; }
                
                @media (min-width: 768px) {
                    .property-detail { padding-top: 3rem; }
                    .main-image { height: 500px; border-radius: 30px; margin-bottom: 3rem; }
                }

                .type-badge {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: var(--secondary);
                    color: white;
                    padding: 6px 16px;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 0.9rem;
                }
                .content-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2rem;
                }
                @media (min-width: 1024px) {
                    .content-grid { grid-template-columns: 2fr 1fr; gap: 3rem; }
                }

                .details-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 24px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.05);
                }
                @media (min-width: 768px) {
                    .details-card { padding: 3rem; border-radius: 30px; }
                }

                .header .price { font-size: 1.8rem; color: var(--secondary); font-weight: 800; margin-bottom: 0.5rem; }
                .header h1 { font-size: 1.8rem; color: var(--primary); margin-bottom: 0.5rem; line-height: 1.2; }
                @media (min-width: 768px) {
                    .header .price { font-size: 2.5rem; }
                    .header h1 { font-size: 2.5rem; }
                }
                
                .header .location { display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); font-size: 1rem; }
                
                .stats-grid { 
                    display: grid; 
                    grid-template-columns: repeat(3, 1fr); 
                    gap: 1rem; 
                    margin: 2rem 0;
                    padding: 1.5rem;
                    background: var(--background);
                    border-radius: 16px;
                }
                .stat { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; color: var(--primary); }
                .stat .value { font-size: 1.1rem; font-weight: 700; }
                .stat .label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                
                @media (min-width: 768px) {
                    .stat { flex-direction: row; text-align: left; }
                }
                
                .description h3 { font-size: 1.3rem; margin-bottom: 1rem; }
                .description p { color: #4b5563; line-height: 1.7; font-size: 1rem; }
                
                .contact-card { padding: 2rem; border-radius: 24px; border: 1px solid var(--border); }
                @media (min-width: 768px) {
                    .contact-card { padding: 2.5rem; border-radius: 30px; }
                }
                .contact-card h3 { margin-bottom: 1.5rem; color: var(--primary); font-size: 1.2rem; }

                .divider { text-align: center; margin: 1.5rem 0; color: var(--text-muted); font-weight: 600; font-size: 0.8rem; position: relative; }
                .divider::before, .divider::after { content: ''; position: absolute; top: 50%; width: 40%; height: 1px; background: var(--border); }
                .divider::before { left: 0; } .divider::after { right: 0; }
                
                .contact-form { display: flex; flex-direction: column; gap: 1rem; }
                .w-full { width: 100%; }
                .mb-6 { margin-bottom: 1.5rem; }
                
                @media (max-width: 1024px) {
                    .content-grid { grid-template-columns: 1fr; }
                    .sidebar { position: static; }
                }
            `}</style>
        </div>
    );
};

export default PropertyDetailPage;
