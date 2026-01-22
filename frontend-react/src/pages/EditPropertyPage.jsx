import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Save, Home, MapPin, Info, Image as ImageIcon, ChevronLeft } from 'lucide-react';

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
        is_student: 0
    });

    useEffect(() => {
        fetchPropertyData();
    }, [id]);

    const fetchPropertyData = async () => {
        try {
            const data = await api.get(`/properties/${id}`);
            // Clean up data for form
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
                is_student: data.is_student
            });
        } catch (error) {
            toast.error('Erreur lors du chargement des données');
            navigate('/dashboard/my-properties');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/properties/${id}`, formData);
            toast.success('Mise à jour réussie !');
            navigate('/dashboard/my-properties');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) return <div className="loading-state"><div className="spinner"></div></div>;

    return (
        <div className="add-property container py-12 animate-fade-in">
            <div className="form-header">
                <button onClick={() => navigate(-1)} className="btn-back">
                    <ChevronLeft size={20} /> Retour
                </button>
                <h1>Modifier votre annonce</h1>
                <p>Mettez à jour les informations de votre propriété #{id}.</p>
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
                                required
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Surface (m²)</label>
                            <input
                                type="number"
                                className="form-input"
                                required
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) })}
                            />
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
                                onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Salles de bain</label>
                            <input
                                type="number"
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
            `}</style>
        </div>
    );
};

export default EditPropertyPage;
