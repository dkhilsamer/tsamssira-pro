import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PropertyCard from '../components/PropertyCard';
import PropertyMap from '../components/PropertyMap';
import { Search, SlidersHorizontal, Map as MapIcon, Grid, MapPin } from 'lucide-react';
import SEO from '../components/SEO';
import AdBanner from '../components/AdBanner';

const HomePage = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
    const [filters, setFilters] = useState({
        city: '',
        type: '',
        property_category: '',
        minPrice: '',
        maxPrice: '',
        minArea: '',
        maxArea: '',
        bedrooms: '',
        sortBy: 'newest'
    });

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async (currentFilters = filters) => {
        try {
            setLoading(true);
            const response = await api.get('/properties', { params: currentFilters });

            // Safety check for response format
            let data = [];
            if (Array.isArray(response)) {
                data = response;
            } else if (response && Array.isArray(response.data)) {
                data = response.data;
            } else if (response && Array.isArray(response.properties)) {
                data = response.properties;
            } else {
                console.warn('Unexpected API response format:', response);
            }

            setProperties(data);
        } catch (error) {
            console.error('Fetch error:', error);
            setProperties([]); // Safe fallback
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProperties();
    };

    const handleReset = () => {
        const defaultFilters = {
            city: '',
            type: '',
            property_category: '',
            minPrice: '',
            maxPrice: '',
            minArea: '',
            maxArea: '',
            bedrooms: '',
            sortBy: 'newest'
        };
        setFilters(defaultFilters);
        fetchProperties(defaultFilters);
    };

    return (
        <div className="home-page">
            <SEO
                title="Accueil"
                description="Tsamssira Pro: L'immobilier de luxe en Tunisie. Vente et location d'appartements de haut standing, villas avec piscine et maisons de prestige à Tunis, Hammamet et Sousse. عقارات تونس: بيع و كراء شقق و فيلات فاخرة بتونس، الحمامات و سوسة."
                keywords="immobilier tunisie, agence immobilière tunis, luxe, haut standing, prestige, vente appartement tunisie, location villa hammamet, S+1 tunisie, S+2 tunis, S+3, villa avec piscine, résidence sécurisée, Gammarth, La Marsa, Lac 1, Lac 2, Ennasr, Sousse, Hammamet, Djerba, Tunisie, عقارات تونس, بيع عقارات تونس, شراء منزل, كراء شقق, فيلا للبيع تونس, مكتب للكراء, محل تجاري, أرض للبيع, تسامسيرة برو, وكالة عقارية تونس"
            />
            <section className="hero-section">
                <div className="container hero-content">
                    <div className="hero-badge animate-fade-in">
                        <span className="premium-tag">EXCELLENCE & PRESTIGE</span>
                    </div>
                    <h1 className="animate-fade-in">Tsamssira Pro</h1>
                    <h2 className="hero-subtitle animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        L'Immobilier de Luxe en Tunisie
                    </h2>
                    <p className="hero-description animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        Découvrez une sélection exclusive de propriétés d'exception.
                        Vente et location d'appartements de haut standing, villas de prestige et résidences uniques.
                    </p>

                    <form className="search-box glass animate-fade-in" style={{ animationDelay: '0.3s' }} onSubmit={handleSearch}>
                        <div className="search-grid">
                            <div className="search-field">
                                <label>Destinations</label>
                                <div className="input-with-icon">
                                    <MapPin size={18} className="input-icon" />
                                    <input
                                        type="text"
                                        placeholder="Tunis, Sousse, Hammamet..."
                                        value={filters.city}
                                        onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="search-field">
                                <label>Services</label>
                                <select
                                    value={filters.type}
                                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                >
                                    <option value="">Tous types</option>
                                    <option value="Vente">Acquisition</option>
                                    <option value="Location">Location Prestige</option>
                                </select>
                            </div>
                            <div className="search-field">
                                <label>Budget Maximum</label>
                                <input
                                    type="number"
                                    placeholder="Budget en DT"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                />
                            </div>
                            <div className="search-btn-group flex gap-2">
                                <button type="submit" className="btn btn-secondary search-btn flex-1">
                                    <Search size={20} /> <span className="btn-text">Découvrir</span>
                                </button>
                                <button type="button" onClick={handleReset} className="btn btn-primary-outline search-btn px-4" title="Réinitialiser">
                                    <SlidersHorizontal size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="search-actions">
                            <button
                                type="button"
                                className="toggle-advanced"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                            >
                                <SlidersHorizontal size={16} />
                                {showAdvanced ? "Filtres simplifiés" : "Recherche personnalisée"}
                            </button>

                            <div className="sort-box">
                                <span className="sort-label">Ordonner par</span>
                                <select
                                    className="sort-select"
                                    value={filters.sortBy}
                                    onChange={(e) => {
                                        const newFilters = { ...filters, sortBy: e.target.value };
                                        setFilters(newFilters);
                                        fetchProperties(newFilters);
                                    }}
                                >
                                    <option value="newest">Plus récents</option>
                                    <option value="price_asc">Prix croissant</option>
                                    <option value="price_desc">Prix décroissant</option>
                                    <option value="area">Surface (max)</option>
                                </select>
                            </div>
                        </div>

                        {showAdvanced && (
                            <div className="advanced-filters animate-slide-down">
                                <div className="search-grid">
                                    <div className="search-field">
                                        <label>Catégorie</label>
                                        <select
                                            value={filters.property_category}
                                            onChange={(e) => setFilters({ ...filters, property_category: e.target.value })}
                                        >
                                            <option value="">Tout</option>
                                            <option value="famille">Famille</option>
                                            <option value="etudiant">Étudiant</option>
                                        </select>
                                    </div>
                                    <div className="search-field">
                                        <label>Chambres</label>
                                        <input
                                            type="number"
                                            placeholder="Nombre min."
                                            value={filters.bedrooms}
                                            onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                                        />
                                    </div>
                                    <div className="search-field">
                                        <label>Surface (min - max)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                placeholder="Min m²"
                                                className="w-1/2"
                                                value={filters.minArea}
                                                onChange={(e) => setFilters({ ...filters, minArea: e.target.value })}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Max m²"
                                                className="w-1/2"
                                                value={filters.maxArea}
                                                onChange={(e) => setFilters({ ...filters, maxArea: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="search-field">
                                        <label>Prix Minimum</label>
                                        <input
                                            type="number"
                                            placeholder="DT"
                                            value={filters.minPrice}
                                            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </section>

            <div className="container">
                <AdBanner slot="0000000000" />
            </div>

            <section className="container py-12">
                <div className="section-header">
                    <h2>Nos Propriétés en Vedette</h2>
                    <p>Découvrez nos biens les plus populaires et boostés</p>

                    <div className="view-toggle">
                        <button
                            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid size={18} /> Grille
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                            onClick={() => setViewMode('map')}
                        >
                            <MapIcon size={18} /> Carte
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Chargement des perles rares...</p>
                    </div>
                ) : viewMode === 'map' ? (
                    <PropertyMap properties={properties} height="600px" />
                ) : (
                    <div className="property-grid">
                        {properties.length > 0 ? (
                            properties.map(prop => (
                                <PropertyCard key={prop.id} property={prop} />
                            ))
                        ) : (
                            <div className="no-results">
                                <h3>Aucune propriété trouvée</h3>
                                <p>Essayez de modifier vos filtres pour voir plus de résultats.</p>
                            </div>
                        )}
                    </div>
                )}
            </section>

            <style jsx>{`
                .home-page { min-height: 100vh; }
                .hero-section {
                    height: 90vh;
                    background: linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.8)), 
                                 url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
                    background-size: cover;
                    background-position: center;
                    display: flex;
                    align-items: center;
                    color: white;
                    border-bottom-left-radius: 80px;
                    border-bottom-right-radius: 80px;
                    position: relative;
                }
                .hero-content { text-align: center; max-width: 1200px; margin: 0 auto; padding-top: 4rem; }
                
                .hero-badge { margin-bottom: 2rem; }
                .premium-tag {
                    background: rgba(212, 175, 55, 0.2);
                    border: 1px solid var(--secondary);
                    color: var(--secondary);
                    padding: 0.5rem 1.5rem;
                    border-radius: 30px;
                    font-size: 0.8rem;
                    font-weight: 800;
                    letter-spacing: 3px;
                    backdrop-filter: blur(10px);
                }

                .hero-content h1 { 
                    font-size: 6rem; 
                    margin-bottom: 0.5rem; 
                    color: white; 
                    font-family: var(--font-heading);
                    font-weight: 700;
                    letter-spacing: -2px;
                }
                .hero-subtitle {
                    font-size: 2.2rem;
                    color: var(--secondary);
                    font-family: var(--font-heading);
                    margin-bottom: 1.5rem;
                    font-weight: 600;
                    font-style: italic;
                }
                .hero-description { 
                    font-size: 1.2rem; 
                    margin: 0 auto 4rem; 
                    color: rgba(255, 255, 255, 0.8); 
                    max-width: 800px;
                    line-height: 1.8;
                }
                
                .search-box { 
                    max-width: 1100px; 
                    margin: 0 auto; 
                    padding: 2.5rem; 
                    border-radius: 30px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
                .search-grid { 
                    display: grid; 
                    grid-template-columns: 1.5fr 1fr 1fr auto; 
                    gap: 1.5rem; 
                    align-items: flex-end; 
                }
                .search-field { text-align: left; }
                .search-field label { 
                    display: block; 
                    font-size: 0.75rem; 
                    margin-bottom: 0.75rem; 
                    font-weight: 800; 
                    color: var(--secondary); 
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }
                
                .input-with-icon { position: relative; }
                .input-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--secondary); opacity: 0.7; }

                .search-field input, .search-field select {
                    width: 100%;
                    padding: 1rem 1.2rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 16px;
                    color: white;
                    outline: none;
                    font-size: 1rem;
                    transition: all 0.3s;
                }
                .search-field input:focus, .search-field select:focus {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: var(--secondary);
                }
                .search-field.with-icon input { padding-left: 3rem; }
                
                .search-field option { color: #0f172a; }
                .search-btn { 
                    padding: 0 2.5rem; 
                    height: 58px; 
                    font-size: 1.1rem;
                    box-shadow: 0 10px 20px rgba(212, 175, 55, 0.3);
                }

                .search-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 2rem;
                    padding-top: 2rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
                .toggle-advanced {
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    padding: 0.7rem 1.5rem;
                    border-radius: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.7rem;
                    font-weight: 600;
                    transition: all 0.3s;
                }
                .toggle-advanced:hover { background: rgba(255, 255, 255, 0.1); border-color: var(--secondary); }

                .sort-box { display: flex; align-items: center; gap: 1rem; }
                .sort-label { color: rgba(255,255,255,0.6); font-size: 0.9rem; font-weight: 600; }
                .sort-select {
                    background: transparent;
                    border: none;
                    color: var(--secondary);
                    font-weight: 700;
                    cursor: pointer;
                    outline: none;
                    font-size: 0.9rem;
                }

                .advanced-filters { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }

                .py-12 { padding-top: 8rem; padding-bottom: 8rem; }
                .section-header { margin-bottom: 5rem; text-align: center; }
                .section-header h2 { 
                    font-size: 3.5rem; 
                    color: var(--primary); 
                    margin-bottom: 1rem; 
                    font-family: var(--font-heading);
                    font-weight: 700;
                }
                .section-header p { 
                    color: var(--text-muted); 
                    font-size: 1.2rem; 
                    margin-bottom: 2.5rem; 
                    max-width: 600px;
                    margin-left: auto;
                    margin-right: auto;
                }
                
                .view-toggle {
                    display: inline-flex;
                    background: #f1f5f9;
                    padding: 0.4rem;
                    border-radius: 16px;
                }
                .toggle-btn {
                    padding: 0.7rem 1.5rem;
                    border-radius: 12px;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    transition: all 0.3s;
                }
                .toggle-btn.active {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }
                .property-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); 
                    gap: 3rem; 
                }
                .loading-state { text-align: center; padding: 10rem 0; color: var(--text-muted); font-weight: 600; }
                .spinner {
                    width: 50px; height: 50px;
                    border: 4px solid rgba(15, 23, 42, 0.1);
                    border-top-color: var(--secondary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1.5rem;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                .no-results { grid-column: 1 / -1; text-align: center; padding: 6rem; background: #fafaf9; border-radius: 30px; border: 1px solid #f1f5f9; }

                @media (max-width: 1024px) {
                    .hero-content h1 { font-size: 4.5rem; }
                    .search-grid { grid-template-columns: 1fr 1fr; }
                    .search-btn { grid-column: span 2; }
                }

                @media (max-width: 768px) {
                    .hero-content h1 { font-size: 3.5rem; }
                    .hero-subtitle { font-size: 1.5rem; }
                    .search-grid { grid-template-columns: 1fr; }
                    .search-btn { grid-column: auto; }
                    .hero-section { height: auto; padding: 10rem 0 6rem; border-radius: 0; }
                    .search-actions { flex-direction: column; gap: 1.5rem; align-items: stretch; text-align: center; }
                    .sort-box { justify-content: center; }
                }
            `}</style>
        </div>
    );
};

export default HomePage;
