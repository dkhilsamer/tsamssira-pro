import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        phone: '',
        role: 'viziteur'
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            toast.success('Compte créé ! Vous pouvez vous connecter.');
            navigate('/login');
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
                    <h2>Créer un compte</h2>
                    <p>Rejoignez la communauté Tsamssira Pro.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
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
                        <label><Mail size={16} /> Email</label>
                        <input
                            type="email"
                            className="form-input"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label><Phone size={16} /> Téléphone</label>
                        <input
                            type="tel"
                            className="form-input"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label><Lock size={16} /> Mot de passe</label>
                        <input
                            type="password"
                            className="form-input"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Vous êtes ?</label>
                        <select
                            className="form-input"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="viziteur">Acheteur / Locataire</option>
                            <option value="proprietaire">Propriétaire / Agent</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-secondary w-full" disabled={loading}>
                        {loading ? 'Création...' : 'S\'inscrire'} <ArrowRight size={18} />
                    </button>
                </form>

                <div className="auth-footer">
                    Déjà un compte ? <Link to="/login">Connectez-vous</Link>
                </div>
            </div>

            <style jsx>{`
                .auth-page {
                    min-height: calc(100vh - 80px);
                    padding: 4rem 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%);
                }
                .auth-container {
                    width: 100%;
                    max-width: 500px;
                    padding: 3rem;
                    border-radius: 30px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.1);
                }
                .auth-header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }
                .auth-header h2 {
                    font-size: 2rem;
                    color: var(--primary);
                    margin-bottom: 0.5rem;
                }
                .auth-header p {
                    color: var(--text-muted);
                }
                .form-group {
                    margin-bottom: 1.25rem;
                }
                .form-group label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: var(--primary);
                }
                .w-full { width: 100%; justify-content: space-between; padding: 1rem 1.5rem; }
                .auth-footer {
                    margin-top: 2rem;
                    text-align: center;
                    font-size: 0.95rem;
                    color: var(--text-muted);
                }
                .auth-footer a {
                    color: var(--secondary);
                    font-weight: 700;
                    text-decoration: none;
                }
            `}</style>
        </div>
    );
};

export default RegisterPage;
