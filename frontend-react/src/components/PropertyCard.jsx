import React from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize, MapPin, Star } from 'lucide-react';

const PropertyCard = ({ property }) => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    const getImageUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/400x300?text=Indisponible';
        if (path.startsWith('http')) return path;
        // Ensure path starts with /uploads/
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${BACKEND_URL}${cleanPath}`;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-TN', {
            style: 'currency',
            currency: 'TND',
        }).format(price);
    };

    return (
        <div className={`property-card animate-fade-in ${property.is_boosted ? 'boosted' : ''}`}>
            {property.is_boosted && (
                <div className="boost-badge">
                    <Star size={14} fill="currentColor" /> Vedette
                </div>
            )}

            <div className="card-image">
                <img src={getImageUrl(property.main_image)} alt={property.title} loading="lazy" />
                <div className="property-type">{property.type}</div>
            </div>

            <div className="card-content">
                <div className="price-tag">{formatPrice(property.price)}</div>
                <h3 className="title">{property.title}</h3>

                <div className="location">
                    <MapPin size={16} /> {property.location}
                </div>

                <div className="features">
                    <div className="feature">
                        <Bed size={16} /> <span>{property.bedrooms}</span>
                    </div>
                    <div className="feature">
                        <Bath size={16} /> <span>{property.bathrooms}</span>
                    </div>
                    <div className="feature">
                        <Maximize size={16} /> <span>{property.area} m²</span>
                    </div>
                </div>

                <Link to={`/property/${property.id}`} className="btn btn-primary w-full mt-4">
                    Voir les détails
                </Link>
            </div>

            <style jsx>{`
                .property-card {
                    background: var(--surface);
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                    transition: all 0.3s ease;
                    position: relative;
                    border: 1px solid var(--border);
                }
                .property-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.1);
                }
                .property-card.boosted {
                    border: 2px solid var(--secondary);
                }
                .boost-badge {
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    background: var(--secondary);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    z-index: 10;
                    box-shadow: 0 4px 10px rgba(212, 175, 55, 0.4);
                }
                .card-image {
                    height: 220px;
                    position: relative;
                    overflow: hidden;
                }
                .card-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }
                .property-card:hover .card-image img {
                    transform: scale(1.1);
                }
                .property-type {
                    position: absolute;
                    bottom: 12px;
                    right: 12px;
                    background: rgba(15, 23, 42, 0.8);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    backdrop-filter: blur(4px);
                }
                .card-content {
                    padding: 1.5rem;
                }
                .price-tag {
                    color: var(--secondary);
                    font-weight: 800;
                    font-size: 1.25rem;
                    margin-bottom: 0.5rem;
                }
                .title {
                    font-size: 1.2rem;
                    margin-bottom: 0.75rem;
                    color: var(--primary);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .location {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    margin-bottom: 1.25rem;
                }
                .features {
                    display: flex;
                    justify-content: space-between;
                    padding-top: 1rem;
                    border-top: 1px solid var(--border);
                }
                .feature {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    color: var(--text-main);
                    font-size: 0.85rem;
                    font-weight: 500;
                }
                .w-full { width: 100%; }
            `}</style>
        </div>
    );
};

export default PropertyCard;
