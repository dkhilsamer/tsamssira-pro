import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Rocket, ShieldCheck, ArrowRight, Info, CheckCircle } from 'lucide-react';

const PaymentPage = () => {
    const [searchParams] = useSearchParams();
    const propertyId = searchParams.get('id');
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (propertyId) {
            fetchProperty();
        } else {
            navigate('/dashboard/my-properties');
        }
    }, [propertyId]);

    const fetchProperty = async () => {
        try {
            const data = await api.get(`/properties/${propertyId}`);
            setProperty(data);
        } catch (error) {
            toast.error('Propriété introuvable');
            navigate('/dashboard/my-properties');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleRequestBoost = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Send boost request instead of confirming payment
            const response = await api.put(`/properties/${propertyId}/boost`, { paymentConfirmed: false }); // False triggers the request logic on backend
            toast.success(response.message || 'Demande envoyée avec succès !');
            navigate('/dashboard/my-properties');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) return <div className="loading-state"><div className="spinner"></div></div>;

    return (
        <div className="payment-page container py-12 animate-fade-in">
            <div className="payment-grid">
                <div className="info-side">
                    <h1>Demander un Boost</h1>
                    <p className="subtitle">Mettez votre bien en avant pour obtenir plus de visibilité.</p>

                    <div className="benefit-card glass">
                        <div className="benefit">
                            <Rocket className="icon" />
                            <div>
                                <h4>Position Prioritaire</h4>
                                <p>Votre annonce apparaîtra en haut des résultats de recherche.</p>
                            </div>
                        </div>
                        <div className="benefit">
                            <ShieldCheck className="icon" />
                            <div>
                                <h4>Validation Admin</h4>
                                <p>L'administrateur examinera votre demande et activera le boost.</p>
                            </div>
                        </div>
                        <div className="benefit">
                            <Info className="icon" />
                            <div>
                                <h4>Gratuit pour le moment</h4>
                                <p>Profitez de cette fonctionnalité gratuitement pendant la période de lancement.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-side">
                    <div className="checkout-card glass">
                        <div className="summary">
                            <h3>Détails de la demande</h3>
                            <div className="line">
                                <span>Bien concerné</span>
                                <span className="text-right">{property?.title || 'Votre annonce'}</span>
                            </div>
                            <div className="line">
                                <span>Type de Boost</span>
                                <span>Standard (30 jours)</span>
                            </div>
                            <div className="total">
                                <span>Coût estimé</span>
                                <span className="text-green-600">Gratuit</span>
                            </div>
                        </div>

                        <div className="info-box bg-blue-50 p-4 rounded-xl mb-6 text-blue-700 text-sm">
                            <p>En cliquant ci-dessous, une demande sera envoyée à l'administrateur. Vous serez notifié lorsque le boost sera actif.</p>
                        </div>

                        <button onClick={handleRequestBoost} className="btn btn-secondary w-full publish-btn" disabled={loading}>
                            {loading ? 'Envoi en cours...' : 'Envoyer la demande'} <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .payment-page { max-width: 1100px; padding-top: 5rem; }
                .payment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: flex-start; }
                
                h1 { font-size: 3rem; color: var(--primary); margin-bottom: 1rem; }
                .subtitle { font-size: 1.25rem; color: var(--text-muted); margin-bottom: 3rem; }
                
                .benefit-card { padding: 2.5rem; border-radius: 30px; display: flex; flex-direction: column; gap: 2rem; }
                .benefit { display: flex; gap: 1.5rem; }
                .benefit .icon { color: var(--secondary); flex-shrink: 0; margin-top: 0.2rem; }
                .benefit h4 { font-size: 1.1rem; color: var(--primary); margin-bottom: 0.25rem; }
                .benefit p { font-size: 0.95rem; color: var(--text-muted); }

                .checkout-card { padding: 3rem; border-radius: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); }
                .summary { margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); }
                .summary h3 { margin-bottom: 1.5rem; font-size: 1.2rem; }
                .summary .line { display: flex; justify-content: space-between; color: var(--text-muted); margin-bottom: 0.8rem; }
                .summary .total { display: flex; justify-content: space-between; font-weight: 800; font-size: 1.25rem; color: var(--primary); margin-top: 1rem; }
                
                .text-green-600 { color: #16a34a; }
                .text-right { text-align: right; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .bg-blue-50 { background: #eff6ff; }
                .text-blue-700 { color: #1d4ed8; }
                .p-4 { padding: 1rem; }
                .rounded-xl { border-radius: 0.75rem; }
                .mb-6 { margin-bottom: 1.5rem; }
                .text-sm { font-size: 0.875rem; }

                .w-full { width: 100%; justify-content: space-between; padding: 1rem 1.75rem; font-size: 1.1rem; }

                @media (max-width: 900px) {
                    .payment-grid { grid-template-columns: 1fr; }
                    h1 { font-size: 2.2rem; }
                }
            `}</style>
        </div>
    );
};

export default PaymentPage;
