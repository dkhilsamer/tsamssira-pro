import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Bed, Bath, Maximize, MapPin, ExternalLink } from 'lucide-react';
import PropertyMap from '../components/PropertyMap';
import './PropertyDetailPage.css';

const PropertyDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loading, setLoading] = useState(true);

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
        } catch (error) {
            toast.error(error.message);
            navigate('/');
        } finally {
            setLoading(false);
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


            </div>
        </div>
    );
};

export default PropertyDetailPage;
