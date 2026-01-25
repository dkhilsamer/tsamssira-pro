import React from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { Phone, Mail, MessageCircle, ArrowLeft, Home, User, CheckCircle2 } from 'lucide-react';

const ContactOwnerPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const property = location.state?.property;

    if (!property) {
        return (
            <div className="container py-24 text-center">
                <h2 className="text-2xl font-bold mb-4">Informations non disponibles</h2>
                <p className="mb-8 text-gray-600">Veuillez d'abord envoyer une demande depuis la page du bien.</p>
                <button onClick={() => navigate(`/property/${id}`)} className="btn btn-primary">
                    Retour au bien
                </button>
            </div>
        );
    }

    const whatsappNumber = property.owner_phone ? property.owner_phone.replace(/\s+/g, '') : '';
    const whatsappMessage = encodeURIComponent(`Bonjour, je vous contacte à propos de votre bien : ${property.title} (ID: ${property.id}) vu sur Tsamssira Pro.`);
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    const getImageUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/1200x600?text=Indisponible';
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${BACKEND_URL}${cleanPath}`;
    };

    return (
        <div className="contact-owner-page container py-12 max-w-4xl animate-fade-in">
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-6">
                    <CheckCircle2 size={40} />
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Demande Envoyée !</h1>
                <p className="text-lg text-slate-600">
                    Voici les coordonnées directes du propriétaire pour finaliser votre transaction.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="property-summary glass p-8 rounded-3xl">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Home size={20} className="text-secondary" /> Détails du bien
                    </h2>
                    <div className="flex gap-4 mb-6">
                        <img
                            src={getImageUrl(property.main_image)}
                            alt={property.title}
                            className="w-24 h-24 object-cover rounded-xl"
                        />
                        <div>
                            <h3 className="font-bold text-lg">{property.title}</h3>
                            <p className="text-secondary font-bold text-xl">{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(property.price)}</p>
                            <p className="text-slate-500 text-sm">{property.location}</p>
                        </div>
                    </div>
                    <Link to={`/property/${id}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-secondary font-medium transition-colors">
                        <ArrowLeft size={16} /> Revoir la description complète
                    </Link>
                </div>

                <div className="contact-options space-y-4">
                    <div className="owner-card bg-slate-900 text-white p-8 rounded-3xl mb-4">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                                <User size={24} />
                            </div>
                            <div>
                                <p className="text-white/60 text-sm">Propriétaire</p>
                                <h3 className="text-xl font-bold">{property.owner_username}</h3>
                            </div>
                        </div>
                    </div>

                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-6 bg-green-500 hover:bg-green-600 text-white rounded-2xl transition-all hover:scale-[1.02] shadow-lg shadow-green-500/20"
                    >
                        <div className="flex items-center gap-4">
                            <MessageCircle size={24} />
                            <div className="text-left">
                                <p className="font-bold text-lg">Discuter sur WhatsApp</p>
                                <p className="text-white/80 text-sm">Réponse instantanée</p>
                            </div>
                        </div>
                    </a>

                    <a
                        href={`tel:${property.owner_phone}`}
                        className="flex items-center justify-between p-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all hover:scale-[1.02] shadow-lg shadow-blue-600/20"
                    >
                        <div className="flex items-center gap-4">
                            <Phone size={24} />
                            <div className="text-left">
                                <p className="font-bold text-lg">Appeler directement</p>
                                <p className="text-white/80 text-sm">{property.owner_phone}</p>
                            </div>
                        </div>
                    </a>

                    <a
                        href={`mailto:${property.owner_email}`}
                        className="flex items-center justify-between p-6 bg-white border border-slate-200 hover:border-secondary text-slate-900 rounded-2xl transition-all hover:scale-[1.02]"
                    >
                        <div className="flex items-center gap-4">
                            <Mail size={24} className="text-secondary" />
                            <div className="text-left">
                                <p className="font-bold text-lg">Envoyer un Email</p>
                                <p className="text-slate-500 text-sm">{property.owner_email}</p>
                            </div>
                        </div>
                    </a>
                </div>
            </div>

            <style jsx>{`
                .glass {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
            `}</style>
        </div>
    );
};

export default ContactOwnerPage;
