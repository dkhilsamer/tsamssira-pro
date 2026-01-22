import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { CreditCard, Rocket, ShieldCheck, ArrowRight, Info } from 'lucide-react';

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

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Simulated payment confirmation
            await api.put(`/properties/${propertyId}/boost`, { paymentConfirmed: true });
            toast.success('Votre bien est désormais en vedette !');
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
                    <h1>Booster votre annonce</h1>
                    <p className="subtitle">Mettez votre bien en avant et recevez jusqu'à 5x plus de demandes.</p>

                    <div className="benefit-card glass">
                        <div className="benefit">
                            <Rocket className="icon" />
                            <div>
                                <h4>Position Prioritaire</h4>
                                <p>Votre annonce apparaîtra en haut des résultats de recherche pendant 30 jours.</p>
                            </div>
                        </div>
                        <div className="benefit">
                            <ShieldCheck className="icon" />
                            <div>
                                <h4>Badge "Vedette"</h4>
                                <p>Un badge distinctif pour attirer l'attention des acheteurs potentiels.</p>
                            </div>
                        </div>
                        <div className="benefit">
                            <Info className="icon" />
                            <div>
                                <h4>Statistiques Gratuites</h4>
                                <p>Suivez l'évolution des vues et des demandes générées par le boost.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-side">
                    <div className="checkout-card glass">
                        <div className="summary">
                            <h3>Résumé de la commande</h3>
                            <div className="line">
                                <span>Boost "Premium" (30 jours)</span>
                                <span>10,000 DT</span>
                            </div>
                            <div className="total">
                                <span>Total à payer</span>
                                <span>10,000 DT</span>
                            </div>
                        </div>

                        <form onSubmit={handlePayment} className="card-form">
                            <h3>Informations de paiement</h3>
                            <div className="form-group">
                                <label>Nom sur la carte</label>
                                <input type="text" className="form-input" placeholder="M. Samer Dkhil" required />
                            </div>
                            <div className="form-group">
                                <label>Numéro de carte</label>
                                <div className="input-with-icon">
                                    <CreditCard size={18} />
                                    <input type="text" className="form-input" placeholder="0000 0000 0000 0000" maxLength="16" required />
                                </div>
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label>Date d'expiration</label>
                                    <input type="text" className="form-input" placeholder="MM/YY" maxLength="5" required />
                                </div>
                                <div className="form-group">
                                    <label>CVV</label>
                                    <input type="password" className="form-input" placeholder="***" maxLength="3" required />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-secondary w-full publish-btn" disabled={loading}>
                                {loading ? 'Traitement...' : 'Confirmer le paiement'} <ArrowRight size={18} />
                            </button>
                        </form>

                        <div className="secure-footer">
                            <ShieldCheck size={14} /> Paiement 100% sécurisé via Flouci / Stripe
                        </div>
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
                .summary .line { display: flex; justify-content: space-between; color: var(--text-muted); margin-bottom: 0.5rem; }
                .summary .total { display: flex; justify-content: space-between; font-weight: 800; font-size: 1.25rem; color: var(--primary); margin-top: 1rem; }

                .card-form h3 { margin-bottom: 1.5rem; font-size: 1.2rem; }
                .form-group { margin-bottom: 1.25rem; }
                .form-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; }
                
                .input-with-icon { position: relative; }
                .input-with-icon svg { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
                .input-with-icon input { padding-left: 3rem; }
                
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .w-full { width: 100%; justify-content: space-between; padding: 1rem 1.75rem; font-size: 1.1rem; }
                
                .secure-footer { margin-top: 1.5rem; text-align: center; font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; justify-content: center; gap: 0.5rem; }

                @media (max-width: 900px) {
                    .payment-grid { grid-template-columns: 1fr; }
                    h1 { font-size: 2.2rem; }
                }
            `}</style>
        </div>
    );
};

export default PaymentPage;
