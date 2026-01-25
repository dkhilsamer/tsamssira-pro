import React, { useState } from 'react';
import { Calculator, MapPin, Maximize, Home, Sparkles, Building2, UserCircle, Briefcase, TrendingUp, Info } from 'lucide-react';

const AIPricingPage = () => {
    const [data, setData] = useState({
        city: 'Tunis',
        surface: 100,
        type: 'Appartement',
        category: 'famille',
        transaction: 'Vente'
    });

    const [estimation, setEstimation] = useState(null);
    const [loading, setLoading] = useState(false);

    const calculatePrice = (e) => {
        e.preventDefault();
        setLoading(true);

        // Simple mock "AI" logic based on typical Tunisian market trends
        // In a real app, this would call a backend ML model
        setTimeout(() => {
            let basePricePerM2 = 2500; // Base price for Tunis Apartment Sale

            // Location Multiplier
            const cityMultipliers = {
                'Tunis': 1.2,
                'Sousse': 1.1,
                'Hammamet': 1.3,
                'Sfax': 0.9,
                'Bizerte': 0.85,
                'Autre': 0.7
            };

            // Type Multiplier
            const typeMultipliers = {
                'Appartement': 1.0,
                'Villa': 1.5,
                'Studio': 0.9,
                'Terrain': 0.6,
                'Bureau': 1.2
            };

            // Transaction Scaling
            const transactionScale = data.transaction === 'Location' ? 0.005 : 1.0;

            // Student/Family scaling (Category)
            const categoryScale = data.category === 'etudiant' ? 0.9 : 1.0;

            let pricePerM2 = basePricePerM2 * (cityMultipliers[data.city] || 1) * typeMultipliers[data.type] * categoryScale;

            const avg = Math.round(pricePerM2 * data.surface * transactionScale);
            const min = Math.round(avg * 0.85);
            const max = Math.round(avg * 1.2);

            setEstimation({ min, max, avg });
            setLoading(false);
        }, 800);
    };

    return (
        <div className="ai-pricing-page container py-12 max-w-5xl animate-fade-in">
            <div className="flex flex-col items-center text-center mb-12">
                <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-6">
                    <Sparkles size={32} />
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Estimateur de Prix intelligent (IA)</h1>
                <p className="text-lg text-slate-600 max-w-2xl">
                    Calculez instantanément les prix minimum, maximum et moyens du marché en fonction des caractéristiques de votre bien.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
                <form onSubmit={calculatePrice} className="glass p-8 rounded-3xl shadow-xl space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${data.transaction === 'Vente' ? 'border-secondary bg-secondary/5' : 'border-slate-100'}`} onClick={() => setData({ ...data, transaction: 'Vente' })}>
                            <TrendingUp className={data.transaction === 'Vente' ? 'text-secondary' : 'text-slate-400'} />
                            <span className="font-bold">Achat / Vente</span>
                        </div>
                        <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${data.transaction === 'Location' ? 'border-secondary bg-secondary/5' : 'border-slate-100'}`} onClick={() => setData({ ...data, transaction: 'Location' })}>
                            <Briefcase className={data.transaction === 'Location' ? 'text-secondary' : 'text-slate-400'} />
                            <span className="font-bold">Location</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="field">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                <MapPin size={16} /> Emplacement
                            </label>
                            <select
                                className="w-full p-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-secondary/50"
                                value={data.city}
                                onChange={(e) => setData({ ...data, city: e.target.value })}
                            >
                                <option>Tunis</option>
                                <option>Sousse</option>
                                <option>Hammamet</option>
                                <option>Sfax</option>
                                <option>Bizerte</option>
                                <option>Autre</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="field">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                    <Home size={16} /> Type de bien
                                </label>
                                <select
                                    className="w-full p-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-secondary/50"
                                    value={data.type}
                                    onChange={(e) => setData({ ...data, type: e.target.value })}
                                >
                                    <option>Appartement</option>
                                    <option>Villa</option>
                                    <option>Studio</option>
                                    <option>Terrain</option>
                                    <option>Bureau</option>
                                </select>
                            </div>
                            <div className="field">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                    <Maximize size={16} /> Surface (m²)
                                </label>
                                <input
                                    type="number"
                                    className="w-full p-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-secondary/50"
                                    value={data.surface}
                                    onChange={(e) => setData({ ...data, surface: e.target.value })}
                                    min="1"
                                />
                            </div>
                        </div>

                        <div className="field">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                <UserCircle size={16} /> Public cible
                            </label>
                            <select
                                className="w-full p-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-secondary/50"
                                value={data.category}
                                onChange={(e) => setData({ ...data, category: e.target.value })}
                            >
                                <option value="famille">Famille / Général</option>
                                <option value="etudiant">Étudiants</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-3 text-lg"
                    >
                        {loading ? <div className="spinner-small"></div> : <><Calculator size={20} /> Estimer le prix</>}
                    </button>
                </form>

                <div className="estimation-results space-y-6">
                    {estimation ? (
                        <div className="animate-slide-up space-y-6">
                            <div className="bg-slate-900 text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-white/60 font-medium mb-2 uppercase tracking-widest text-xs">Prix Moyen Estimé</p>
                                    <div className="text-5xl font-bold text-secondary mb-4">
                                        {new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(estimation.avg)}
                                        {data.transaction === 'Location' && <span className="text-xl text-white/50"> / mois</span>}
                                    </div>
                                    <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                                        <TrendingUp size={16} />
                                        <span>Basé sur les tendances actuelles</span>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Sparkles size={120} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-slate-500 text-sm mb-1">Prix Minimum</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(estimation.min)}
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-slate-500 text-sm mb-1">Prix Maximum</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(estimation.max)}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 flex gap-4 text-blue-800">
                                <Info className="shrink-0" />
                                <p className="text-sm">
                                    Cette estimation est fournie à titre indicatif par notre algorithme. Le prix réel peut varier selon l'état du bien, l'étage, et les commodités spécifiques.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                            <Building2 size={64} className="mb-6 opacity-20" />
                            <p className="font-medium">Remplissez le formulaire pour voir l'estimation AI</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .glass { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.3); }
                .spinner-small { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default AIPricingPage;
