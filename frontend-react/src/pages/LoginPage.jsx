import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

const LoginPage = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await api.post('/auth/login', formData);
            localStorage.setItem('user', JSON.stringify(data.user));
            toast.success('Connexion réussie !');
            navigate('/dashboard');
            window.location.reload(); // Quick way to update Navbar
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
                    <h2>Content de vous revoir</h2>
                    <p>Connectez-vous pour gérer vos biens et messages.</p>
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
                        <label><Lock size={16} /> Mot de passe</label>
                        <input
                            type="password"
                            className="form-input"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="btn btn-secondary w-full" disabled={loading}>
                        {loading ? 'Connexion...' : 'Se connecter'} <ArrowRight size={18} />
                    </button>
                </form>

                <div className="auth-footer">
                    Pas encore de compte ? <Link to="/register">Inscrivez-vous</Link>
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
                .auth-header h2 {
                    font-size: 2rem;
                    color: var(--primary);
                    margin-bottom: 0.5rem;
                }
                .auth-header p {
                    color: var(--text-muted);
                }
                .form-group {
                    margin-bottom: 1.5rem;
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

export default LoginPage;
