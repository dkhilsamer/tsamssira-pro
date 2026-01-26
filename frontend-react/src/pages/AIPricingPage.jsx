import React, { useState, useMemo } from 'react';
import api from '../services/api';
import {
    Calculator, MapPin, Maximize, Home, Sparkles,
    Building2, UserCircle, Briefcase, TrendingUp, Info,
    CheckCircle2, Globe, Database, Layers, Check
} from 'lucide-react';

// Tunisian Regions Data
const TUNISIAN_REGIONS = {
    "Ariana": ["Ariana Ville", "Ettadhamen", "Kalaat el Andalous", "Raoued", "Sidi Thabet", "Soukra"],
    "Béja": ["Béja Nord", "Béja Sud", "Amdoun", "Goubellat", "Medjez el-Bab", "Nefza", "Téboursouk", "Testour", "Thibar"],
    "Ben Arous": ["Ben Arous", "Bou Mhel el-Bassatine", "El Mourouj", "Ezzahra", "Fouchana", "Hammam Chrif", "Hammam Lif", "Mohamedia", "Medina Jedida", "Mégrine", "Mornag", "Radès"],
    "Bizerte": ["Bizerte Nord", "Bizerte Sud", "Ghar El Melh", "Mateur", "Menzel Bourguiba", "Menzel Jemil", "Ras Jebel", "Sejnane", "Tinja", "Utique", "Zarzouna"],
    "Gabès": ["Gabès Médina", "Gabès Ouest", "Gabès Sud", "Ghannouch", "Hamma", "Mareth", "Matmata", "Métouia", "Nouvelle Matmata"],
    "Gafsa": ["Gafsa Nord", "Gafsa Sud", "Belkhir", "El Guettar", "Ksar", "Mdhilla", "Métlaoui", "Moularès", "Redeyef", "Sened"],
    "Jendouba": ["Jendouba Ville", "Aïn Draham", "Balta-Bou Aouane", "Bou Salem", "Fernana", "Ghardimaou", "Oued Mliz", "Tabarka"],
    "Kairouan": ["Kairouan Nord", "Kairouan Sud", "Bou Hajla", "Chebika", "Echrarda", "Haffouz", "Hajeb El Ayoun", "Nasrallah", "Oueslatia", "Sbikha"],
    "Kasserine": ["Kasserine Nord", "Kasserine Sud", "Ezzouhour", "Fériana", "Foussana", "Haïdra", "Jedelienne", "Majel Bel Abbès", "Sbeïtla", "Sbiba", "Thala"],
    "Kébili": ["Kébili Nord", "Kébili Sud", "Douz Nord", "Douz Sud", "Faouar", "Souk Lahad"],
    "Le Kef": ["Le Kef Est", "Le Kef Ouest", "Dahmani", "Jérissa", "Kalâat Khasba", "Kalaat Senan", "Nebeur", "Sakiet Sidi Youssef", "Tajerouine", "Touiref"],
    "Mahdia": ["Mahdia", "Bou Merdes", "Chébba", "Chorbane", "El Jem", "Essouassi", "Hebira", "Ksour Essef", "Melloulèche", "Ouled Chamekh", "Sidi Alouane"],
    "Manouba": ["Manouba", "Borj El Amri", "Djedeida", "Douar Hicher", "Mornaguia", "Oued Ellil", "Tebourba"],
    "Médenine": ["Médenine Nord", "Médenine Sud", "Ben Guerdane", "Beni Khedache", "Houmt Souk (Djerba)", "Midoun (Djerba)", "Ajim (Djerba)", "Sidi Makhlouf", "Zarzis"],
    "Monastir": ["Monastir", "Bekalta", "Bembla", "Beni Hassen", "Jemmel", "Ksar Hellal", "Ksibet el-Médiouni", "Moknine", "Ouerdanine", "Sahline", "Sayada-Lamta-Bou Hajar", "Téboulba", "Zéramdine"],
    "Nabeul": ["Nabeul", "Béni Khalled", "Béni Khiar", "Bou Argoub", "Dar Chaâbane el-Fehri", "El Haouaria", "El Mida", "Grombalia", "Hammam Ghezèze", "Hammamet", "Kélibia", "Korba", "Menzel Bouzelfa", "Menzel Temime", "Soliman", "Takelsa"],
    "Sfax": ["Sfax Ville", "Sfax Ouest", "Sfax Sud", "Agareb", "Bir Ali Ben Khalifa", "El Amra", "El Hencha", "Graïba", "Jebiniana", "Kerkennah", "Mahrès", "Menzel Chaker", "Sakiet Eddaïer", "Sakiet Ezzit", "Skhira"],
    "Sidi Bouzid": ["Sidi Bouzid Est", "Sidi Bouzid Ouest", "Bir El Hafey", "Cebbala Ouled Asker", "Jilma", "Menzel Bouzaiane", "Mezzouna", "Ouled Haffouz", "Regueb", "Sidi Ali Ben Aoun"],
    "Siliana": ["Siliana Nord", "Siliana Sud", "Bargou", "Bou Arada", "Gaâfour", "Kesra", "Makthar", "Rouhia"],
    "Sousse": ["Sousse Ville", "Sousse Jawhara", "Sousse Riadh", "Sousse Sidi Abdelhamid", "Akouda", "Bouficha", "Enfidha", "Hammam Sousse", "Kalaâ Kebira", "Kalaâ Seghira", "Kondar", "M'saken", "Sidi Bou Ali", "Sidi El Hani"],
    "Tataouine": ["Tataouine Nord", "Tataouine Sud", "Bir Lahmar", "Dehiba", "Ghomrassen", "Remada"],
    "Tozeur": ["Tozeur", "Degache", "Hazoua", "Nefta", "Tamaghza"],
    "Tunis": ["Tunis Ville", "Le Bardo", "Le Kram", "La Goulette", "Carthage", "Sidi Bou Saïd", "La Marsa", "Sidi Hassine"],
    "Zaghouan": ["Zaghouan", "Bir Mcherga", "El Fahs", "Nadhour", "Saouaf", "Zriba"]
};

const AIPricingPage = () => {
    const [data, setData] = useState({
        governorate: 'Tunis',
        city: 'Tunis Ville',
        surface: 100,
        rooms: 'S+2',
        type: 'Appartement',
        category: 'famille',
        transaction: 'Vente',
        is_furnished: false,
        source: 'both' // local, external, both
    });

    const [estimation, setEstimation] = useState(null);
    const [loading, setLoading] = useState(false);

    // Filter cities when governorate changes
    const cities = useMemo(() => TUNISIAN_REGIONS[data.governorate] || [], [data.governorate]);

    const handleGovChange = (e) => {
        const gov = e.target.value;
        setData({
            ...data,
            governorate: gov,
            city: TUNISIAN_REGIONS[gov][0]
        });
    };

    const calculatePrice = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/ai/estimate', data);
            if (response && response.avg) {
                setEstimation(response);
                setLoading(false);
                return;
            }
        } catch (error) {
            console.warn("Gemini API not available, using local smart logic.");
        }

        // Fallback: Smart local logic
        setTimeout(() => {
            const baseRates = {
                'Tunis': 2800, 'Sousse': 2200, 'Hammamet': 2600, 'Bizerte': 1800,
                'Sfax': 1900, 'Ariana': 2400, 'Ben Arous': 2100, 'Monastir': 2000, 'Nabeul': 2100
            };

            const baseRate = baseRates[data.governorate] || 1300;

            const typeMult = { 'Appartement': 1.0, 'Villa': 1.7, 'Studio': 1.1, 'Bureau': 1.3, 'Terrain': 0.8 };
            const roomMult = { 'S+0': 0.9, 'S+1': 1.0, 'S+2': 1.1, 'S+3': 1.2, 'S+4+': 1.4 };

            let price = baseRate * typeMult[data.type] * (roomMult[data.rooms] || 1) * data.surface;

            // Apply Source factor (slight variations)
            if (data.source === 'external') price *= 1.05;
            if (data.source === 'local') price *= 0.95;

            let result = {};
            if (data.transaction === 'Location') {
                let monthly = price * 0.0035;
                if (data.is_furnished) monthly *= 1.25; // +25% for furnished
                if (data.category === 'etudiant') monthly *= 0.9; // Slight discount for students potentially

                result = {
                    avg: Math.round(monthly),
                    min: Math.round(monthly * 0.8),
                    max: Math.round(monthly * 1.3),
                    analysis: `Estimation locale pour un bien ${data.is_furnished ? 'meublé' : 'non meublé'} à ${data.city}.`
                };
            } else {
                if (data.is_furnished) price *= 1.1; // +10% for sale if furnished

                result = {
                    avg: Math.round(price),
                    min: Math.round(price * 0.75),
                    max: Math.round(price * 1.25),
                    analysis: `Estimation basée sur les actifs immobiliers à ${data.governorate}.`
                };
            }

            setEstimation(result);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="ai-pricing-page container py-12 max-w-6xl animate-fade-in">
            <div className="flex flex-col items-center text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary font-bold text-sm mb-6 border border-secondary/20 shadow-sm animate-pulse">
                    <Sparkles size={16} />
                    <span>Propulsé par Gemini 1.5 Pro</span>
                </div>
                <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                    Estimation Immobilière <span className="text-secondary">Ultra-Précise</span>
                </h1>
                <p className="text-xl text-slate-500 max-w-3xl leading-relaxed">
                    Notre intelligence artificielle analyse des milliers de points de données pour vous offrir une estimation fiable en moins d'une minute sur toute la Tunisie.
                </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Form Sidebar */}
                <div className="lg:col-span-5 space-y-6">
                    <form onSubmit={calculatePrice} className="glass p-8 rounded-[2rem] shadow-2xl border border-white/40 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-colors"></div>

                        {/* Transaction Type Segmented Toggle */}
                        <div className="relative flex p-1 bg-slate-100/50 rounded-2xl border border-slate-200 shadow-inner">
                            <button
                                type="button"
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-300 ${data.transaction === 'Vente' ? 'bg-white shadow-lg text-secondary scale-100' : 'text-slate-400 hover:text-slate-600'}`}
                                onClick={() => setData({ ...data, transaction: 'Vente' })}
                            >
                                <TrendingUp size={18} /> Achat / Vente
                            </button>
                            <button
                                type="button"
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-300 ${data.transaction === 'Location' ? 'bg-white shadow-lg text-secondary scale-100' : 'text-slate-400 hover:text-slate-600'}`}
                                onClick={() => setData({ ...data, transaction: 'Location' })}
                            >
                                <Briefcase size={18} /> Location
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Location Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <MapPin size={14} /> Emplacement & Secteur
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="field">
                                        <select
                                            className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-secondary/30 outline-none focus:bg-white transition-all appearance-none cursor-pointer font-medium"
                                            value={data.governorate}
                                            onChange={handleGovChange}
                                        >
                                            {Object.keys(TUNISIAN_REGIONS).map(gov => (
                                                <option key={gov} value={gov}>{gov}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="field">
                                        <select
                                            className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-secondary/30 outline-none focus:bg-white transition-all appearance-none cursor-pointer font-medium"
                                            value={data.city}
                                            onChange={(e) => setData({ ...data, city: e.target.value })}
                                        >
                                            {cities.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Property Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Layers size={14} /> Caractéristiques
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <select
                                        className="p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-secondary/30 outline-none font-medium"
                                        value={data.type}
                                        onChange={(e) => setData({ ...data, type: e.target.value })}
                                    >
                                        <option>Appartement</option>
                                        <option>Villa</option>
                                        <option>Studio</option>
                                        <option>Terrain</option>
                                        <option>Bureau</option>
                                    </select>
                                    <select
                                        className="p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-secondary/30 outline-none font-medium"
                                        value={data.rooms}
                                        onChange={(e) => setData({ ...data, rooms: e.target.value })}
                                    >
                                        <option>S+0</option>
                                        <option>S+1</option>
                                        <option>S+2</option>
                                        <option>S+3</option>
                                        <option>S+4+</option>
                                    </select>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-secondary transition-colors">
                                        <Maximize size={20} />
                                    </div>
                                    <input
                                        type="number"
                                        className="w-full pl-12 pr-12 p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-secondary/30 outline-none font-bold text-lg"
                                        value={data.surface}
                                        onChange={(e) => setData({ ...data, surface: e.target.value })}
                                        placeholder="Surface (m²)"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">m²</div>
                                </div>
                            </div>

                            {/* Advanced Options */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                        <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${data.is_furnished ? 'bg-secondary' : 'bg-slate-200'}`}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={data.is_furnished}
                                                onChange={() => setData({ ...data, is_furnished: !data.is_furnished })}
                                            />
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${data.is_furnished ? 'translate-x-7' : 'translate-x-1'}`}></div>
                                        </div>
                                        <span className={`font-bold text-sm ${data.is_furnished ? 'text-slate-900' : 'text-slate-400'}`}>Bien Meublé</span>
                                    </label>

                                    <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                                        {['famille', 'etudiant'].map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setData({ ...data, category: cat })}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-tighter transition-all ${data.category === cat ? 'bg-white shadow-sm text-secondary' : 'text-slate-400'}`}
                                            >
                                                {cat === 'famille' ? 'Standard' : 'Étudiant'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Source de calcul préférentielle</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'local', icon: <Database size={14} />, label: 'Interne' },
                                            { id: 'external', icon: <Globe size={14} />, label: 'Web' },
                                            { id: 'both', icon: <Layers size={14} />, label: 'Fusion' }
                                        ].map(src => (
                                            <button
                                                key={src.id}
                                                type="button"
                                                onClick={() => setData({ ...data, source: src.id })}
                                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${data.source === src.id ? 'border-secondary bg-secondary/5 text-secondary shadow-md' : 'border-slate-100 text-slate-400 grayscale hover:grayscale-0'}`}
                                            >
                                                {src.icon}
                                                <span className="text-[10px] font-bold">{src.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full py-5 rounded-2xl bg-secondary text-white font-black text-lg shadow-xl shadow-secondary/30 hover:shadow-secondary/50 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="spinner-small"></div>
                                    <span>Analyse en cours...</span>
                                </div>
                            ) : (
                                <>
                                    <Calculator size={22} className="relative z-10" />
                                    <span className="relative z-10">Démarrer l'IA Estimateur</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-7 h-full">
                    {estimation ? (
                        <div className="animate-slide-up space-y-6 h-full flex flex-col">
                            {/* Main Display Card */}
                            <div className="bg-slate-900 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden flex-1 border border-slate-800">
                                <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]"></div>
                                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]"></div>

                                <div className="relative z-10 h-full flex flex-col">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary border border-secondary/30">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-white text-2xl font-black tracking-tight">Analyse Terminée</h2>
                                            <p className="text-slate-400 text-sm font-medium">Prix estimé pour <span className="text-white underline decoration-secondary/50 underline-offset-4">{data.city}</span></p>
                                        </div>
                                    </div>

                                    <div className="mb-12">
                                        <p className="text-secondary font-black text-sm uppercase tracking-[0.2em] mb-4">Valeur Moyenne du Marché</p>
                                        <div className="flex items-baseline gap-4">
                                            <span className="text-7xl font-black text-white tracking-tighter">
                                                {new Intl.NumberFormat('fr-TN', { maximumFractionDigits: 0 }).format(estimation.avg)}
                                            </span>
                                            <span className="text-3xl font-bold text-secondary">TND</span>
                                            {data.transaction === 'Location' && <span className="text-slate-500 font-bold">/ mois</span>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 mb-12">
                                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
                                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
                                                <TrendingUp size={14} className="rotate-180 text-blue-400" /> Prix Minimum
                                            </div>
                                            <p className="text-2xl font-black text-white">{new Intl.NumberFormat('fr-TN').format(estimation.min)} <span className="text-sm font-medium">TND</span></p>
                                        </div>
                                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
                                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
                                                <TrendingUp size={14} className="text-green-400" /> Prix Maximum
                                            </div>
                                            <p className="text-2xl font-black text-white">{new Intl.NumberFormat('fr-TN').format(estimation.max)} <span className="text-sm font-medium">TND</span></p>
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        <div className="p-6 rounded-3xl bg-secondary/5 border border-secondary/10 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <Sparkles size={40} className="text-secondary" />
                                            </div>
                                            <div className="flex gap-3 text-secondary mb-2 items-center">
                                                <Info size={18} />
                                                <span className="text-xs font-black uppercase tracking-widest">Analyse IA</span>
                                            </div>
                                            <p className="text-slate-300 text-lg font-medium italic leading-relaxed">
                                                "{estimation.analysis}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setEstimation(null)}
                                className="w-full py-4 text-slate-400 hover:text-slate-900 font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <Calculator size={16} /> Effectuer un nouveau calcul
                            </button>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-20 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200 text-slate-300 group hover:border-secondary/20 hover:bg-slate-100/50 transition-all duration-500">
                            <div className="relative mb-8">
                                <Building2 size={120} className="opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500" />
                                <Sparkles size={40} className="absolute -top-4 -right-4 text-secondary opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-400 mb-2">Prêt pour l'analyse</h3>
                            <p className="font-medium text-center max-w-xs">
                                Remplissez les détails à gauche pour obtenir une valorisation immobilière précise.
                            </p>

                            <div className="grid grid-cols-2 gap-4 mt-12 opacity-50">
                                <div className="flex items-center gap-2 text-xs font-bold"><Check size={14} /> Données 2025</div>
                                <div className="flex items-center gap-2 text-xs font-bold"><Check size={14} /> Marché Tunisien</div>
                                <div className="flex items-center gap-2 text-xs font-bold"><Check size={14} /> Location & Vente</div>
                                <div className="flex items-center gap-2 text-xs font-bold"><Check size={14} /> Mode Étudiant</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .glass { 
                    background: rgba(255, 255, 255, 0.95); 
                    backdrop-filter: blur(20px); 
                }
                .spinner-small { 
                    width: 20px; 
                    height: 20px; 
                    border: 3px solid rgba(255,255,255,0.3); 
                    border-top-color: white; 
                    border-radius: 50%; 
                    animation: spin 1s linear infinite; 
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                
                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

                input[type=number]::-webkit-inner-spin-button, 
                input[type=number]::-webkit-outer-spin-button { 
                    -webkit-appearance: none; 
                    margin: 0; 
                }
            `}</style>
        </div>
    );
};

export default AIPricingPage;
