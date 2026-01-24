import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Bed, Bath, Maximize, MapPin, Send, MessageCircle, ExternalLink, Map as MapIcon, User, Phone, Mail as MailIcon } from 'lucide-react';
import PropertyMap from '../components/PropertyMap';
import './PropertyDetailPage.css';

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
            await api.post('/requests', {
                ...contactData,
                property_id: id,
                request_type: 'Renseignements'
            });
            toast.success('Demande envoyée avec succès !');
            setContactData({
                visitor_name: '',
                visitor_email: '',
                visitor_phone: '',
                num_persons: 1,
                message: 'Je suis intéressé par cette propriété.'
            });
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

        if (user.id === property.user_id) {
            toast.error("Vous ne pouvez pas discuter avec vous-même !");
            return;
        }

        navigate('/messages', {
            state: {
                userId: property.user_id,
                username: property.owner_username,
                propertyId: property.id,
                propertyTitle: property.title
            }
        });
    };

    const [activeImage, setActiveImage] = useState('');

    useEffect(() => {
        if (property) {
            setActiveImage(property.main_image);
        }
    }, [property]);

    const getImageUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/1200x600?text=Indisponible';
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${BACKEND_URL}${cleanPath}`;
    };

    if (loading) return <div className="loading-state"><div className="spinner"></div></div>;

    const allImages = property ? [property.main_image, ...(property.images || [])].filter(Boolean) : [];
    return (
        <div className="property-detail container py-12 animate-fade-in">
            <div className="gallery-section">
                <div className="main-image">
                    <img src={getImageUrl(activeImage)} alt={property.title} />
                    <div className="type-badge">{property.type}</div>
                </div>

                {allImages.length > 1 && (
                    <div className="image-thumbnails">
                        {allImages.map((img, index) => (
                            <div
                                key={index}
                                className={`thumbnail ${activeImage === img ? 'active' : ''}`}
                                onClick={() => setActiveImage(img)}
                            >
                                <img src={getImageUrl(img)} alt={`Vue ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="content-grid">
                <div className="details-card">
                    <div className="header">
                        <div className="price">{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(property.price)}</div>
                        <h1>{property.title}</h1>
                        <div className="header-meta">
                            <p className="location"><MapPin size={18} /> {property.location}</p>
                            {property.google_maps_link && (
                                <a href={property.google_maps_link} target="_blank" rel="noopener noreferrer" className="map-link">
                                    <ExternalLink size={16} /> Voir sur Google Maps
                                </a>
                            )}
                        </div>
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

                    {property.latitude && property.longitude && (
                        <div className="map-section mt-12">
                            <h3>Emplacement précis</h3>
                            <PropertyMap properties={[property]} height="300px" />
                        </div>
                    )}
                </div>

                <div className="sidebar">
                    <div className="contact-card glass">
                        <h3>Contacter le propriétaire</h3>

                        <div className="owner-contact-info mb-6">
                            <div className="owner-detail">
                                <User size={18} />
                                <span>{property.owner_username}</span>
                            </div>
                            <a href={`tel:${property.owner_phone}`} className="owner-link">
                                <Phone size={18} />
                                <span>{property.owner_phone}</span>
                            </a>
                            <a href={`mailto:${property.owner_email}`} className="owner-link">
                                <MailIcon size={18} />
                                <span>{property.owner_email}</span>
                            </a>
                        </div>

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
                            <input
                                className="form-input"
                                type="tel"
                                placeholder="Téléphone"
                                required
                                value={contactData.visitor_phone}
                                onChange={(e) => setContactData({ ...contactData, visitor_phone: e.target.value })}
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
        </div>
    );
};

export default PropertyDetailPage;
