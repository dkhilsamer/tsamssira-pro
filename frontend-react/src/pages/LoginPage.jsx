import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Lock, User, ArrowRight } from 'lucide-react';

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
            window.dispatchEvent(new Event("storage")); // Trigger storage event for Navbar
            window.location.reload(); // Ensure global state refresh
        } catch (error) {
            toast.error(error.message || 'Identifiants incorrects.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-split">
                {/* Left Side - Visual */}
                <div className="auth-visual">
                    <div className="visual-overlay"></div>
                    <div className="visual-content">
                        <h2>Content de vous revoir</h2>
                        <p>Plongez dans l'univers de l'immobilier de prestige. Connectez-vous pour gérer vos biens d'exception, suivre vos annonces et échanger avec vos clients exclusifs.</p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="auth-form-container">
                    <div className="auth-card glass-premium animate-fade-in-up">
                        <div className="auth-header">
                            <div className="icon-wrapper">
                                <User size={32} className="auth-icon" />
                            </div>
                            <h2>Bienvenue</h2>
                            <p>Connectez-vous pour accéder à votre espace personnel.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="input-group">
                                <label><User size={16} /> Nom d'utilisateur</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        className="premium-input"
                                        required
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        placeholder="Votre identifiant"
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label><Lock size={16} /> Mot de passe</label>
                                <div className="input-wrapper">
                                    <input
                                        type="password"
                                        className="premium-input"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="forgot-password-link">
                                <Link to="/forgot-password" className="text-secondary-premium">
                                    Mot de passe oublié ?
                                </Link>
                            </div>

                            <button type="submit" className="btn-premium w-full mt-2" disabled={loading}>
                                <span>{loading ? 'Connexion...' : 'Se connecter'}</span>
                                <ArrowRight size={18} className={loading ? 'animate-pulse' : ''} />
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>Pas encore de compte ? <Link to="/register" className="text-secondary-premium font-bold">Inscrivez-vous</Link></p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                /* Global Auth Wrapper */
                .auth-wrapper {
                    min-height: 100vh;
                    background-color: #0f172a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Outfit', 'Inter', sans-serif;
                }

                /* Split Layout */
                .auth-split {
                    display: flex;
                    width: 100%;
                    min-height: 100vh;
                }

                /* Left Visual Side (Hidden on Mobile) */
                .auth-visual {
                    flex: 1;
                    position: relative;
                    background-image: url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
                    background-size: cover;
                    background-position: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem;
                    overflow: hidden;
                }

                .visual-overlay {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(212,175,55,0.6) 100%);
                    z-index: 1;
                }

                .visual-content {
                    position: relative;
                    z-index: 2;
                    color: white;
                    max-width: 500px;
                    text-align: left;
                }

                .visual-content h2 {
                    font-size: 3.5rem;
                    font-weight: 800;
                    margin-bottom: 1.5rem;
                    line-height: 1.1;
                    letter-spacing: -1.5px;
                }

                .visual-content p {
                    font-size: 1.2rem;
                    line-height: 1.6;
                    opacity: 0.95;
                    font-weight: 300;
                }

                /* Right Form Side */
                .auth-form-container {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    background: #f8fafc;
                    position: relative;
                }

                .auth-card {
                    width: 100%;
                    max-width: 440px;
                    padding: 3.5rem 2.5rem;
                    border-radius: 24px;
                    background: white;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
                    border: 1px solid rgba(226, 232, 240, 0.8);
                }

                .glass-premium {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }

                .auth-header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .icon-wrapper {
                    width: 68px;
                    height: 68px;
                    background: linear-gradient(135deg, #fefce8 0%, #fef08a 100%);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                    box-shadow: 0 10px 15px -3px rgba(234, 179, 8, 0.2);
                    transform: rotate(-5deg);
                }

                .auth-icon {
                    color: #ca8a04;
                    transform: rotate(5deg);
                }

                .auth-header h2 {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 0.5rem;
                }

                .auth-header p {
                    color: #64748b;
                    font-size: 0.95rem;
                    line-height: 1.5;
                }

                /* Forms */
                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .input-group label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #334155;
                }

                .premium-input {
                    width: 100%;
                    padding: 0.875rem 1.25rem;
                    border-radius: 12px;
                    border: 2px solid #e2e8f0;
                    background: #f8fafc;
                    font-size: 1rem;
                    color: #0f172a;
                    transition: all 0.3s ease;
                    outline: none;
                }

                .premium-input:focus {
                    border-color: #ca8a04;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(234, 179, 8, 0.1);
                }

                .forgot-password-link {
                    text-align: right;
                    margin-top: -0.5rem;
                }
                
                .text-secondary-premium {
                    color: #d4af37;
                    font-weight: 600;
                    text-decoration: none;
                    transition: color 0.3s;
                    font-size: 0.9rem;
                }
                
                .text-secondary-premium:hover {
                    color: #b4942d;
                    text-decoration: underline;
                }

                /* Buttons */
                .btn-premium {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    width: 100%;
                    padding: 1rem;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                    color: white;
                    font-weight: 600;
                    font-size: 1.05rem;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.3);
                }

                .btn-premium:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 20px -3px rgba(15, 23, 42, 0.4);
                    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                }

                .btn-premium:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .mt-2 { margin-top: 0.5rem; }

                /* Footer */
                .auth-footer {
                    margin-top: 2rem;
                    text-align: center;
                    color: #64748b;
                }

                /* Animations */
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-fade-in-up {
                    animation: fadeInUp 0.5s ease-out forwards;
                }

                /* Media Queries */
                @media (max-width: 992px) {
                    .auth-visual { display: none; }
                    .auth-form-container { 
                        background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%);
                        padding: 1.5rem;
                    }
                }

                @media (max-width: 480px) {
                    .auth-card { padding: 2.5rem 1.5rem; }
                    .visual-content h2 { font-size: 2.5rem; }
                    .auth-header h2 { font-size: 1.75rem; }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
