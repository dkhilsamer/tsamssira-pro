import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Mail, ArrowLeft, Send, User } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        birth_date: '',
        gender: ''
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
                    <h2>Mot de passe oublié ?</h2>
                    <p>Pour sécuriser votre compte, veuillez confirmer vos informations personnelles.</p>
                </div>

                {!sent ? (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label><User size={16} /> Email</label>
                            <input
                                type="email"
                                className="form-input"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                            />
                        </div>

                        <div className="form-group">
                            <label>Date de Naissance</label>
                            <input
                                type="date"
                                className="form-input"
                                required
                                value={formData.birth_date}
                                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Sexe</label>
                            <select
                                className="form-input"
                                required
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="">Sélectionner</option>
                                <option value="Homme">Homme</option>
                                <option value="Femme">Femme</option>
                                <option value="Autre">Autre</option>
                            </select>
                        </div>

                        <button type="submit" className="btn btn-secondary w-full mt-4" disabled={loading}>
                            {loading ? 'Vérification...' : 'Vérifier et Envoyer'} <Send size={18} />
                        </button>
                    </form>
                ) : (
                    <div className="sent-message text-center">
                        <div className="icon-success">✅</div>
                        <h3>Identité Vérifiée !</h3>
                        <p>Si l'email a pu être envoyé, vérifiez votre boîte de réception.</p>

                        {debugLink && (
                            <div className="debug-box" style={{ background: '#fee2e2', padding: '15px', borderRadius: '10px', marginTop: '20px', fontSize: '0.9rem', color: '#b91c1c' }}>
                                <p><strong>Note DEBUG (Render Bloque l'email) :</strong></p>
                                <p>Utilisez ce lien pour réinitialiser :</p>
                                <a href={debugLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', wordBreak: 'break-all', marginTop: '5px', fontWeight: 'bold', color: '#b91c1c' }}>
                                    Cliquez ici pour réinitialiser
                                </a>
                            </div>
                        )}

                        <Link to="/login" className="btn btn-primary mt-6">Retour à la connexion</Link>
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
                    height: calc(100vh - 80px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%);
                }
                .auth-container {
                    width: 100%;
                    max-width: 450px;
                    padding: 3rem;
                    border-radius: 30px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.1);
                }
                .auth-header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }
                .auth-header h2 { font-size: 1.8rem; color: var(--primary); margin-bottom: 0.5rem; }
                .auth-header p { color: var(--text-muted); }
                
                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; font-weight: 600; }
                
                .w-full { width: 100%; justify-content: space-between; padding: 1rem 1.5rem; }
                
                .sent-message { padding: 1rem 0; }
                .icon-success { font-size: 3rem; margin-bottom: 1rem; }
                .mt-6 { margin-top: 1.5rem; }

                .auth-footer { margin-top: 2rem; text-align: center; }
                .back-link { display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: var(--text-muted); text-decoration: none; font-weight: 500; }
                .back-link:hover { color: var(--primary); }
            `}</style>
        </div>
    );
};

export default ForgotPasswordPage;
