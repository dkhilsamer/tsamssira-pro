import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Lock, ArrowRight } from 'lucide-react';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error('Les mots de passe ne correspondent pas');
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, newPassword: password });
            toast.success('Mot de passe mis à jour avec succès !');
            navigate('/login');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="auth-page">
                <div className="auth-container glass text-center">
                    <h3>Lien invalide</h3>
                    <p>Le jeton de réinitialisation est manquant ou a expiré.</p>
                    <button onClick={() => navigate('/login')} className="btn btn-primary mt-4">Retour</button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container glass animate-fade-in">
                <div className="auth-header">
                    <h2>Réinitialisation</h2>
                    <p>Choisissez votre nouveau mot de passe sécurisé.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label><Lock size={16} /> Nouveau mot de passe</label>
                        <input
                            type="password"
                            className="form-input"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label><Lock size={16} /> Confirmer le mot de passe</label>
                        <input
                            type="password"
                            className="form-input"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn btn-secondary w-full" disabled={loading}>
                        {loading ? 'Mise à jour...' : 'Réinitialiser'} <ArrowRight size={18} />
                    </button>
                </form>
            </div>

            <style jsx>{`
                .auth-page {
                    min-height: calc(100vh - 80px);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%);
                    padding: 2rem;
                }
                .auth-container {
                    width: 100%;
                    max-width: 450px;
                    padding: 3rem;
                    border-radius: 30px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.1);
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
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
                .mt-4 { margin-top: 1rem; }
            `}</style>
        </div>
    );
};

export default ResetPasswordPage;
