import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { Search, SlidersHorizontal } from 'lucide-react';

const HomePage = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [filters, setFilters] = useState({
        city: '',
        type: '',
        property_category: '',
        minPrice: '',
        maxPrice: '',
        bedrooms: '',
        sortBy: 'newest'
    });

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async (currentFilters = filters) => {
        try {
            setLoading(true);
            const data = await api.get('/properties', { params: currentFilters });
            setProperties(data);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProperties();
    };

    return (
        <div className="home-page">
            <section className="hero-section">
                <div className="container hero-content">
                    <h1 className="animate-fade-in">Trouvez votre futur chez-vous</h1>
                    <p className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        Découvrez les meilleures propriétés en Tunisie, sélectionnées pour vous.
                    </p>

                    <form className="search-box glass animate-fade-in" style={{ animationDelay: '0.2s' }} onSubmit={handleSearch}>
                        <div className="search-grid">
                            <div className="search-field">
                                <label>Ville</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Tunis, Sousse..."
                                    value={filters.city}
                                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                />
                            </div>
                            <div className="search-field">
                                <label>Type d'offre</label>
                                <select
                                    value={filters.type}
                                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                >
                                    <option value="">Tous les types</option>
                                    <option value="Vente">Vente</option>
                                    <option value="Location">Location</option>
                                </select>
                            </div>
                            <div className="search-field">
                                <label>Prix Max</label>
                                <input
                                    type="number"
                                    placeholder="Budget DT"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="btn btn-secondary search-btn">
                                <Search size={20} /> Rechercher
                            </button>
                        </div>

                        <div className="search-actions">
                            <button
                                type="button"
                                className="toggle-advanced"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                            >
                                <SlidersHorizontal size={16} />
                                {showAdvanced ? "Moins de filtres" : "Plus de filtres"}
                            </button>

                            <div className="sort-box">
                                <label>Trier par :</label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => {
                                        const newFilters = { ...filters, sortBy: e.target.value };
                                        setFilters(newFilters);
                                        fetchProperties(newFilters);
                                    }}
                                >
                                    <option value="newest">Plus récent</option>
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
                                        <label>Chambres min.</label>
                                        <input
                                            type="number"
                                            placeholder="Ex: 2"
                                            value={filters.bedrooms}
                                            onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                                        />
                                    </div>
                                    <div className="search-field">
                                        <label>Prix Min</label>
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

            <section className="container py-12">
                <div className="section-header">
                    <h2>Nos Propriétés en Vedette</h2>
                    <p>Découvrez nos biens les plus populaires et boostés</p>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Chargement des perles rares...</p>
                    </div>
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
                    height: 85vh;
                    background: linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), 
                                url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
                    background-size: cover;
                    background-position: center;
                    display: flex;
                    align-items: center;
                    color: white;
                    border-bottom-left-radius: 60px;
                    border-bottom-right-radius: 60px;
                }
                .hero-content { text-align: center; }
                .hero-content h1 { font-size: 4.5rem; margin-bottom: 1rem; color: var(--secondary); }
                .hero-content p { font-size: 1.4rem; margin-bottom: 3rem; color: rgba(255, 255, 255, 0.9); }
                
                .search-box { max-width: 1100px; margin: 0 auto; padding: 1.5rem; border-radius: 24px; }
                .search-grid { display: grid; grid-template-columns: repeat(3, 1fr) auto; gap: 1.5rem; align-items: flex-end; }
                .search-field { text-align: left; }
                .search-field label { display: block; font-size: 0.85rem; margin-bottom: 0.5rem; font-weight: 700; color: #ffffff; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
                .search-field input, .search-field select {
                    width: 100%;
                    padding: 0.8rem 1rem;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    color: white;
                    outline: none;
                }
                .search-field option { color: black; }
                .search-btn { padding: 0.8rem 2rem; height: 48px; }

                .search-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 1.5rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
                .toggle-advanced {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: white;
                    padding: 0.6rem 1.2rem;
                    border-radius: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .toggle-advanced:hover { background: rgba(255, 255, 255, 0.15); }

                .sort-box {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .sort-box label { color: #ffffff; font-size: 0.9rem; font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
                .sort-box select {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                    color: white;
                    padding: 0.6rem 1rem;
                    outline: none;
                    cursor: pointer;
                }

                .advanced-filters {
                    margin-top: 1.5rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-down { animation: slideDown 0.3s ease; }

                .py-12 { padding-top: 5rem; padding-bottom: 5rem; }
                .section-header { margin-bottom: 4rem; text-align: center; }
                .section-header h2 { font-size: 2.8rem; color: var(--primary); margin-bottom: 0.5rem; }
                .section-header p { color: var(--text-muted); font-size: 1.1rem; }
                .property-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2.5rem; }
                .loading-state { text-align: center; padding: 10rem 0; }
                .no-results { grid-column: 1 / -1; text-align: center; padding: 5rem; background: #f1f5f9; border-radius: 20px; }

                @media (max-width: 768px) {
                    .hero-content h1 { font-size: 2.5rem; }
                    .search-grid { grid-template-columns: 1fr; }
                    .hero-section { height: auto; padding: 8rem 0; border-radius: 0; }
                    .search-actions { flex-direction: column; gap: 1rem; align-items: stretch; }
                    .sort-box { justify-content: space-between; }
                }
            `}</style>
        </div>
    );
};

export default HomePage;
