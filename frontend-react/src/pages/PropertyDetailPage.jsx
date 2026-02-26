import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Bed, Bath, Maximize, MapPin, ExternalLink, Send } from 'lucide-react';
import PropertyMap from '../components/PropertyMap';
import SEO from '../components/SEO';
import './PropertyDetailPage.css';

const PropertyDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        request_type: 'visite'
    });

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    useEffect(() => {
        fetchProperty();
    }, [id]);

    const fetchProperty = async () => {
        try {
            const data = await api.get(`/properties/${id}`);
            setProperty(data);
            if (data && data.title) {
                document.title = `${data.title} | Tsamssira Pro`;
            }

            // Prefill user data if logged in
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                setFormData(prev => ({
                    ...prev,
                    name: user.username || '',
                    email: user.email || '',
                    phone: user.phone || ''
                }));
            }
        } catch (error) {
            toast.error(error.message);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);

        try {
            const payload = {
                property_id: id,
                visitor_name: formData.name,
                visitor_email: formData.email,
                visitor_phone: formData.phone,
                request_type: formData.request_type,
                message: "Demande de contact direct" // Default message since box is removed
            };

            const response = await api.post('/requests', payload);
            toast.success('Demande envoyée ! Redirection...');

            // Redirect to contact details page
            setTimeout(() => {
                navigate(`/property/${id}/contact`, { state: { property } });
            }, 1500);
        } catch (error) {
            toast.error(error.message || 'Erreur lors de l\'envoi');
        } finally {
            setSending(false);
        }
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
            <SEO
                title={property.title}
                description={`${property.title} à ${property.location}. ${property.bedrooms} chambres, ${property.area}m². ${property.description.substring(0, 100)}... عقار في ${property.location}: ${property.title}.`}
                keywords={`${property.type}, ${property.location}, immobilier ${property.location}, ${property.bedrooms > 0 ? `S+${property.bedrooms}` : ''}, ${property.property_type || ''}, haut standing, luxe tunisie, villa avec piscine, appartement à vendre ${property.location}, عقارات ${property.location}, بيع عقارات في ${property.location}, شراء منزل ${property.location}, كراء في ${property.location}`}
            />
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
                        <p className="mb-6 text-sm text-slate-600">
                            Envoyez une demande pour voir les coordonnées directes du propriétaire.
                        </p>

                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Votre nom"
                                    className="w-full"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Votre email"
                                    className="w-full"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Votre téléphone"
                                    className="w-full"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full flex items-center justify-center gap-2"
                                disabled={sending}
                            >
                                <Send size={18} />
                                {sending ? 'Envoi...' : 'Envoyer la demande'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailPage;
