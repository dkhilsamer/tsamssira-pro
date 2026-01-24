import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Upload, Home, MapPin, Tag, Info, Image as ImageIcon, CheckCircle, Map as MapIcon } from 'lucide-react';
import LocationPicker from '../components/LocationPicker';

const AddPropertyPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        bedrooms: 1,
        bathrooms: 1,
        area: '',
        type: 'Location',
        property_category: 'famille',
        is_student: 0,
        latitude: '',
        longitude: '',
        google_maps_link: ''
    });
    const [mainImage, setMainImage] = useState(null);
    const [extraImages, setExtraImages] = useState([]);

    const handleFileChange = (e, type) => {
        if (type === 'main') {
            setMainImage(e.target.files[0]);
        } else {
            setExtraImages(Array.from(e.target.files));
        }
    };

    const [urlError, setUrlError] = useState('');

    const handleUrlBlur = (e) => {
        const url = e.target.value;
        if (url && !url.includes('google.com/maps') && !url.includes('goo.gl')) {
            setUrlError('Lien non reconnu. Veuillez sélectionner votre adresse manuellement sur la carte ci-dessous.');
            toast.error('Adresse non valide, sélectionnez votre adresse manuellement');
        } else {
            setUrlError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        // Trim strings explicitly
        const trimmedData = { ...formData };
        if (trimmedData.title) trimmedData.title = trimmedData.title.trim();
        if (trimmedData.description) trimmedData.description = trimmedData.description.trim();
        if (trimmedData.location) trimmedData.location = trimmedData.location.trim();
        if (trimmedData.google_maps_link) trimmedData.google_maps_link = trimmedData.google_maps_link.trim();

        Object.keys(trimmedData).forEach(key => data.append(key, trimmedData[key]));
        if (mainImage) data.append('main_image', mainImage);
        extraImages.forEach(img => data.append('images', img));

        try {
            await api.post('/properties', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Propriété publiée avec succès !');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-property container py-12 animate-fade-in">
            <div className="form-header">
                <h1>Publier une nouvelle annonce</h1>
                <p>Remplissez les détails pour attirer des acheteurs ou locataires potentiels.</p>
            </div>

            <form onSubmit={handleSubmit} className="premium-form glass">
                <div className="form-section">
                    <div className="section-title">
                        <Info size={20} /> Informations Générales
                    </div>
                    <div className="grid">
                        <div className="form-group span-2">
                            <label>Titre de l'annonce</label>
                            <input
                                className="form-input"
                                placeholder="Ex: Bel appartement S+2 à La Marsa"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Type d'offre</label>
                            <select
                                className="form-input"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="Location">Location</option>
                                <option value="Vente">Vente</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Catégorie</label>
                            <select
                                className="form-input"
                                value={formData.property_category}
                                onChange={(e) => setFormData({ ...formData, property_category: e.target.value })}
                            >
                                <option value="famille">Famille</option>
                                <option value="etudiant">Étudiant / Partage</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <div className="section-title">
                        <MapPin size={20} /> Localisation & Prix
                    </div>
                    <div className="grid">
                        <div className="form-group">
                            <label>Ville / Emplacement</label>
                            <input
                                className="form-input"
                                placeholder="Ex: Tunis, El Menzah 9"
                                required
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Prix (DT)</label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="Prix total"
                                required
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Surface (m²)</label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="Surface en m²"
                                required
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            />
                        </div>
                        <div className="form-group span-2">
                            <label>Lien Google Maps (Optionnel)</label>
                            <input
                                className="form-input"
                                placeholder="Collez le lien de partage Google Maps ici"
                                value={formData.google_maps_link}
                                onChange={(e) => setFormData({ ...formData, google_maps_link: e.target.value })}
                                onBlur={handleUrlBlur}
                            />
                            {urlError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{urlError}</p>}
                        </div>
                        <div className="form-group span-2">
                            <label><MapIcon size={16} className="inline mr-1" /> Emplacement précis sur la carte</label>
                            <LocationPicker
                                lat={formData.latitude}
                                lng={formData.longitude}
                                onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                            />
                            {formData.latitude && (
                                <p className="coords-info">Coordonnées: {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <div className="section-title">
                        <Home size={20} /> Détails du bien
                    </div>
                    <div className="grid grid-4">
                        <div className="form-group">
                            <label>Chambres</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.bedrooms}
                                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Salles de bain</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.bathrooms}
                                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                            />
                        </div>
                        <div className="form-group flex-center">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.is_student === 1}
                                    onChange={(e) => setFormData({ ...formData, is_student: e.target.checked ? 1 : 0 })}
                                />
                                Spécial Étudiant
                            </label>
                        </div>
                    </div>
                    <div className="form-group mt-6">
                        <label>Description détaillée</label>
                        <textarea
                            className="form-input"
                            rows="6"
                            placeholder="Décrivez les atouts de votre bien..."
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>
                </div>

                <div className="form-section">
                    <div className="section-title">
                        <ImageIcon size={20} /> Photos du bien
                    </div>
                    <div className="upload-grid">
                        <div className="upload-box main">
                            <label>
                                <Upload size={32} />
                                <span>Image principale</span>
                                <input type="file" onChange={(e) => handleFileChange(e, 'main')} hidden />
                                {mainImage && <div className="file-name">{mainImage.name} <CheckCircle size={14} color="#10b981" /></div>}
                            </label>
                        </div>
                        <div className="upload-box extra">
                            <label>
                                <ImageIcon size={24} />
                                <span>Images additionnelles</span>
                                <input type="file" multiple onChange={(e) => handleFileChange(e, 'extra')} hidden />
                                {extraImages.length > 0 && <div className="file-name">{extraImages.length} images sélectionnées</div>}
                            </label>
                        </div>
                    </div>
                </div>

                <div className="form-footer">
                    <button type="submit" className="btn btn-primary publish-btn" disabled={loading}>
                        {loading ? 'Publication...' : 'Publier l\'annonce maintenant'}
                    </button>
                </div>
            </form>

            <style jsx>{`
                .add-property { max-width: 900px; }
                .form-header { text-align: center; margin-bottom: 4rem; }
                .form-header h1 { font-size: 3rem; color: var(--primary); margin-bottom: 1rem; }
                .form-header p { color: var(--text-muted); font-size: 1.1rem; }

                .premium-form { padding: 4rem; border-radius: 40px; box-shadow: 0 30px 60px rgba(0,0,0,0.1); }
                .form-section { margin-bottom: 4rem; }
                .section-title { 
                    display: flex; 
                    align-items: center; 
                    gap: 0.75rem; 
                    font-size: 1.25rem; 
                    font-weight: 700; 
                    color: var(--primary);
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--border);
                }
                
                .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; }
                .grid-4 { grid-template-columns: repeat(3, 1fr); }
                .span-2 { grid-column: span 2; }
                
                .form-group label { display: block; margin-bottom: 0.75rem; font-weight: 600; font-size: 0.95rem; }
                .checkbox-label { display: flex !important; align-items: center; gap: 0.5rem; cursor: pointer; padding-top: 1.8rem; }
                
                .upload-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .upload-box {
                    border: 2px dashed var(--border);
                    border-radius: 20px;
                    padding: 2.5rem;
                    text-align: center;
                    transition: all 0.2s;
                    background: #f8fafc;
                }
                .upload-box label { 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    gap: 1rem; 
                    cursor: pointer; 
                    width: 100%;
                }
                .upload-box:hover { border-color: var(--secondary); background: rgba(212, 175, 55, 0.05); }
                .file-name { font-size: 0.8rem; color: var(--text-main); font-weight: 600; margin-top: 0.5rem; display: flex; align-items: center; gap: 4px; }
                
                .form-footer { margin-top: 3rem; text-align: center; }
                .coords-info { font-size: 0.8rem; color: var(--success); font-weight: 600; margin-top: 0.5rem; text-align: center; }
                .publish-btn { padding: 1.25rem 4rem; font-size: 1.1rem; background: var(--secondary); color: var(--primary); }
                .mt-6 { margin-top: 1.5rem; }

                @media (max-width: 768px) {
                    .premium-form { padding: 2rem; border-radius: 24px; }
                    .grid { grid-template-columns: 1fr; }
                    .span-2 { grid-column: span 1; }
                    .upload-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default AddPropertyPage;
