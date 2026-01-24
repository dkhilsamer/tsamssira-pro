import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LocationPicker = ({ lat, lng, onChange }) => {
    const center = lat && lng ? [lat, lng] : [33.8869, 9.5375]; // Tunisia center
    const zoom = lat && lng ? 13 : 6;

    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                onChange(e.latlng.lat, e.latlng.lng);
            },
        });

        return lat && lng ? (
            <Marker position={[lat, lng]} />
        ) : null;
    };

    return (
        <div className="location-picker-container">
            <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '300px', width: '100%', borderRadius: '12px' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker />
            </MapContainer>
            <p className="picker-hint">Cliquez sur la carte pour placer l'épingle précisément.</p>

            <style jsx>{`
                .location-picker-container {
                    margin-top: 1rem;
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    overflow: hidden;
                }
                .picker-hint {
                    padding: 0.5rem;
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    background: #f8fafc;
                    margin: 0;
                    text-align: center;
                }
            `}</style>
        </div>
    );
};

export default LocationPicker;
