import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Save, Home, MapPin, Info, Image as ImageIcon, ChevronLeft, Map as MapIcon } from 'lucide-react';
import LocationPicker from '../components/LocationPicker';

const EditPropertyPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
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
    const [mainImagePreview, setMainImagePreview] = useState('');
    const [existingMainImage, setExistingMainImage] = useState('');

    const [extraImages, setExtraImages] = useState([]);
    const [existingExtraImages, setExistingExtraImages] = useState([]);

    useEffect(() => {
        fetchPropertyData();
    }, [id]);

    const fetchPropertyData = async () => {
        try {
            const data = await api.get(`/properties/${id}`);
            setFormData({
                title: data.title,
                description: data.description,
                price: data.price,
                location: data.location,
                bedrooms: data.bedrooms,
                bathrooms: data.bathrooms,
                area: data.area,
                type: data.type,
                property_category: data.property_category,
                is_student: data.is_student,
                latitude: data.latitude,
                longitude: data.longitude,
                google_maps_link: data.google_maps_link || ''
            });
            setExistingMainImage(data.main_image);
            setExistingExtraImages(data.images || []);
        } catch (error) {
            toast.error('Erreur lors du chargement des données');
            navigate('/dashboard/my-properties');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainImage(file);
            setMainImagePreview(URL.createObjectURL(file));
        }
    };

    const handleExtraImagesChange = (e) => {
        setExtraImages(Array.from(e.target.files));
    };

    const handleDeleteExistingImage = async (imageUrl) => {
        if (!window.confirm('Voulez-vous vraiment supprimer cette image ?')) return;
        try {
            await api.delete(`/properties/${id}/images`, { data: { imageUrl } });
            setExistingExtraImages(prev => prev.filter(img => img !== imageUrl));
            toast.success('Image supprimée');
        } catch (error) {
            toast.error('Erreur suppression image: ' + error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (Number(formData.price) <= 0 || Number(formData.area) <= 0 || Number(formData.bedrooms) <= 0 || Number(formData.bathrooms) <= 0) {
            toast.error("Toutes les valeurs numériques doivent être positives");
            setLoading(false);
            return;
        }

        const data = new FormData();
        const trimmedData = { ...formData };
        if (trimmedData.title) trimmedData.title = trimmedData.title.trim();
        if (trimmedData.description) trimmedData.description = trimmedData.description.trim();
        if (trimmedData.location) trimmedData.location = trimmedData.location.trim();
        if (trimmedData.google_maps_link) trimmedData.google_maps_link = trimmedData.google_maps_link.trim();

        Object.keys(trimmedData).forEach(key => data.append(key, trimmedData[key]));

        if (mainImage) data.append('main_image', mainImage);
        extraImages.forEach(img => data.append('images', img));

        try {
            await api.put(`/properties/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Mise à jour réussie !');
            navigate('/dashboard/my-properties');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return '';
        return path.startsWith('http') ? path : `${api.defaults.baseURL.replace('/api', '')}${path}`;
    };

    if (fetchLoading) return <div className="loading-state"><div className="spinner"></div></div>;

    return (
        <div className="add-property container py-12 animate-fade-in">
            {/* ... Header ... */}
            <div className="form-header">
                <button onClick={() => navigate(-1)} className="btn-back">
                    <ChevronLeft size={20} /> Retour
                </button>
                <h1>Modifier votre annonce</h1>
                <p>Mettez à jour les informations de votre propriété #{id}.</p>
            </div>

            <form onSubmit={handleSubmit} className="premium-form glass">
                {/* ... General Info ... */}
                <div className="form-section">
                    <div className="section-title">
                        <Info size={20} /> Informations Générales
                    </div>
                    <div className="grid">
                        <div className="form-group span-2">
                            <label>Titre de l'annonce</label>
                            <input
                                className="form-input"
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

                {/* ... Location ... */}
                <div className="form-section">
                    <div className="section-title">
                        <MapPin size={20} /> Localisation & Prix
                    </div>
                    {/* ... (Keep existing inputs: location, price, area, google_maps, picker) ... */}
                    <div className="grid">
                        <div className="form-group">
                            <label>Ville / Emplacement</label>
                            <input
                                className="form-input"
                                required
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Prix (DT)</label>
                            <input
                                type="number"
                                min="1"
                                className="form-input"
                                required
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Surface (m²)</label>
                            <input
                                type="number"
                                min="1"
                                className="form-input"
                                required
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="form-group span-2">
                            <label>Lien Google Maps (Optionnel)</label>
                            <input
                                className="form-input"
                                placeholder="Collez le lien de partage Google Maps ici"
                                value={formData.google_maps_link}
                                onChange={(e) => setFormData({ ...formData, google_maps_link: e.target.value })}
                            />
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

                {/* ... Details ... */}
                <div className="form-section">
                    <div className="section-title">
                        <Home size={20} /> Détails du bien
                    </div>
                    {/* ... (Keep existing inputs: bedrooms, bathrooms, description) ... */}
                    <div className="grid grid-4">
                        <div className="form-group">
                            <label>Chambres</label>
                            <input
                                type="number"
                                min="1"
                                className="form-input"
                                value={formData.bedrooms}
                                onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Salles de bain</label>
                            <input
                                type="number"
                                min="1"
                                className="form-input"
                                value={formData.bathrooms}
                                onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
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
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>
                </div>

                {/* ... NEW: Photos ... */}
                <div className="form-section">
                    <div className="section-title">
                        <ImageIcon size={20} /> Photos du bien
                    </div>

                    <div className="edit-photos-grid">
                        <div className="photo-column">
                            <label className="field-label">Image Principale</label>
                            <div className="current-image-preview">
                                {(mainImagePreview || existingMainImage) ? (
                                    <img
                                        src={mainImagePreview || getImageUrl(existingMainImage)}
                                        alt="Principal"
                                        className="preview-img main"
                                    />
                                ) : (
                                    <div className="no-image-placeholder">Pas d'image</div>
                                )}
                            </div>
                            <input type="file" onChange={handleMainImageChange} className="file-input-mt" />
                            <p className="hint">Télécharger une nouvelle image remplacera l'actuelle.</p>
                        </div>

                        <div className="photo-column">
                            <label className="field-label">Galerie ({existingExtraImages.length} existantes)</label>

                            {/* Existing Images List */}
                            <div className="existing-gallery">
                                {existingExtraImages.map((img, idx) => (
                                    <div key={idx} className="gallery-thumb-wrapper">
                                        <img src={getImageUrl(img)} alt={`Gallery ${idx}`} className="gallery-thumb" />
                                        <button
                                            type="button"
                                            className="btn-delete-img"
                                            onClick={() => handleDeleteExistingImage(img)}
                                            title="Supprimer"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <label className="field-label mt-4">Ajouter des photos</label>
                            <input type="file" multiple onChange={handleExtraImagesChange} className="file-input-mt" />
                            {extraImages.length > 0 && (
                                <p className="file-status">{extraImages.length} nouvelles images sélectionnées</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-footer">
                    <button type="submit" className="btn btn-primary publish-btn" disabled={loading}>
                        <Save size={18} /> {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </form>

            <style jsx>{`
                .add-property { max-width: 900px; }
                .form-header { text-align: center; margin-bottom: 4rem; position: relative; }
                .btn-back { position: absolute; left: 0; top: 0; display: flex; align-items: center; gap: 0.5rem; background: none; border: none; font-weight: 600; cursor: pointer; color: var(--text-muted); }
                .btn-back:hover { color: var(--primary); }
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
                
                .form-footer { margin-top: 3rem; text-align: center; }
                .publish-btn { padding: 1.25rem 4rem; font-size: 1.1rem; background: var(--primary); color: white; display: flex; align-items: center; gap: 0.75rem; margin: 0 auto; }
                .mt-6 { margin-top: 1.5rem; }

                @media (max-width: 768px) {
                    .premium-form { padding: 2rem; border-radius: 24px; }
                    .grid { grid-template-columns: 1fr; }
                    .span-2 { grid-column: span 1; }
                }
                .coords-info { font-size: 0.8rem; color: var(--success); font-weight: 600; margin-top: 0.5rem; text-align: center; }
            `}</style>
        </div>
    );
};

export default EditPropertyPage;
