import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Mail, ArrowLeft, Send, User, Calendar, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: ''
    });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [debugLink, setDebugLink] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setDebugLink(null);
        try {
            const response = await api.post('/auth/forgot-password', formData);
            toast.success(response.message || 'Vérification réussie !');

            if (response.debug_link) {
                setDebugLink(response.debug_link);
            }
            setSent(true);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container glass animate-fade-in">
                <div className="auth-header">
                    <div className="icon-bg">
                        <User size={40} color="var(--primary)" />
                    </div>
                    <h2>Mot de passe oublié ?</h2>
                    <p>Pour sécuriser votre compte, veuillez confirmer vos informations personnelles.</p>
                </div>

                {!sent ? (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label><Mail size={16} /> Email</label>
                            <input
                                type="email"
                                className="form-input"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="exemple@email.com"
                            />
                        </div>

                        <div className="form-group">
                            <label><User size={16} /> Nom d'utilisateur</label>
                            <input
                                type="text"
                                className="form-input"
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="Votre nom d'utilisateur"
                            />
                        </div>

                        <button type="submit" className="btn btn-secondary w-full mt-6" disabled={loading}>
                            {loading ? 'Vérification...' : 'Envoyer le lien'} <Send size={18} />
                        </button>
                    </form>
                ) : (
                    <div className="sent-message text-center">
                        <div className="icon-success"><CheckCircle size={64} color="var(--success)" /></div>
                        <h3>Identité Vérifiée !</h3>
                        <p>Si l'email a pu être envoyé, vérifiez votre boîte de réception.</p>

                        {debugLink && (
                            <div className="debug-box">
                                <p><strong>Note DEBUG (Render Bloque l'email) :</strong></p>
                                <p>Utilisez ce lien pour réinitialiser :</p>
                                <a href={debugLink} className="debug-link block mt-2 font-bold text-red-700">
                                    Cliquez ici pour réinitialiser
                                </a>
                            </div>
                        )}

                        <Link to="/login" className="btn btn-primary mt-6 w-full">Retour à la connexion</Link>
                    </div>
                )}

                <div className="auth-footer">
                    <Link to="/login" className="back-link">
                        <ArrowLeft size={16} /> Retour à la connexion
                    </Link>
                </div>
            </div>

            <style jsx>{`
                .auth-page {
                    min-height: calc(100vh - 80px); /* Ensure minimum height */
                    display: flex;
                    flex-direction: column; /* Force column layout */
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%);
                    padding: 2rem;
                }
                .auth-container {
                    width: 100%;
                    max-width: 500px; /* Slightly wider */
                    padding: 3rem;
                    border-radius: 24px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.1);
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                }
                .auth-header {
                    text-align: center;
                    margin-bottom: 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .icon-bg {
                    width: 80px;
                    height: 80px;
                    background: var(--background);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                }
                .auth-header h2 { 
                    font-size: 1.8rem; 
                    color: var(--primary); 
                    margin-bottom: 0.5rem; 
                    font-weight: 700;
                }
                .auth-header p { 
                    color: var(--text-muted); 
                    font-size: 0.95rem;
                    line-height: 1.5;
                }
                
                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .form-group label { 
                    display: flex; 
                    align-items: center; 
                    gap: 0.5rem; 
                    margin-bottom: 0.5rem; 
                    font-weight: 600; 
                    color: var(--primary);
                    font-size: 0.9rem;
                }
                
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .w-full { width: 100%; display: flex; justify-content: center; gap: 0.5rem; }
                .mt-6 { margin-top: 1.5rem; }
                
                .sent-message { 
                    padding: 1rem 0; 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center;
                }
                .icon-success { margin-bottom: 1.5rem; }
                .debug-box {
                    background: #fee2e2;
                    padding: 1rem;
                    border-radius: 10px;
                    margin-top: 1.5rem;
                    font-size: 0.85rem;
                    color: #b91c1c;
                    width: 100%;
                    text-align: center;
                }

                .auth-footer { margin-top: 2rem; text-align: center; }
                .back-link { 
                    display: inline-flex; 
                    align-items: center; 
                    justify-content: center; 
                    gap: 0.5rem; 
                    color: var(--text-muted); 
                    text-decoration: none; 
                    font-weight: 500; 
                    transition: color 0.2s;
                }
                .back-link:hover { color: var(--primary); }

                @media (max-width: 480px) {
                    .auth-container { padding: 2rem; }
                    .form-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default ForgotPasswordPage;
