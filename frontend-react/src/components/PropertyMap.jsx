import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Map, ExternalLink, Info } from 'lucide-react';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const PropertyMap = ({ properties, height = "400px" }) => {
    // Center of Tunisia approximately
    const center = [33.8869, 9.5375];
    const zoom = 6;

    // Filter properties that have coordinates
    const mapProperties = properties.filter(p => p.latitude && p.longitude);

    return (
        <div style={{ height, width: '100%', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {mapProperties.map(prop => (
                    <Marker key={prop.id} position={[prop.latitude, prop.longitude]}>
                        <Popup>
                            <div className="map-popup">
                                <img src={prop.main_image} alt={prop.title} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                                <h4 style={{ margin: '8px 0 4px', fontSize: '14px' }}>{prop.title}</h4>
                                <p style={{ color: 'var(--secondary)', fontWeight: 'bold', margin: '0 0 8px' }}>
                                    {Number(prop.price).toLocaleString()} TND
                                </p>
                                <Link to={`/property/${prop.id}`} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px', width: '100%', marginBottom: '8px', display: 'flex', gap: '6px' }}>
                                    <Info size={14} /> Voir Détails
                                </Link>
                                {prop.google_maps_link && (
                                    <a
                                        href={prop.google_maps_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary"
                                        style={{ padding: '6px 12px', fontSize: '13px', width: '100%', display: 'flex', gap: '6px', textDecoration: 'none', color: 'var(--primary)', background: '#fef3c7' }}
                                    >
                                        <ExternalLink size={14} /> Google Maps
                                    </a>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default PropertyMap;
