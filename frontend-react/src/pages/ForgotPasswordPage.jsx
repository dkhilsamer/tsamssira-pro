import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Mail, ArrowLeft, Send, User, CheckCircle } from 'lucide-react';

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
            toast.error(error.message || 'Une erreur est survenue.');
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
                        <h2>Récupérez Votre Accès</h2>
                        <p>Ne vous inquiétez pas, cela arrive. Entrez vos informations et nous vous enverrons un lien pour réinitialiser votre mot de passe et retrouver l'accès à vos propriétés exclusives.</p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="auth-form-container">
                    <div className="auth-card glass-premium animate-fade-in-up">
                        <div className="auth-header">
                            <div className="icon-wrapper">
                                <User size={32} className="auth-icon" />
                            </div>
                            <h2>Mot de passe oublié ?</h2>
                            <p>Confirmez votre identité pour sécuriser votre compte.</p>
                        </div>

                        {!sent ? (
                            <form onSubmit={handleSubmit} className="auth-form">
                                <div className="input-group">
                                    <label><Mail size={16} /> Adresse Email</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="email"
                                            className="premium-input"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="exemple@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label><User size={16} /> Nom d'utilisateur</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            className="premium-input"
                                            required
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            placeholder="Votre nom d'utilisateur"
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="btn-premium w-full mt-6" disabled={loading}>
                                    <span>{loading ? 'Vérification...' : 'Envoyer le lien'}</span>
                                    <Send size={18} className={loading ? 'animate-pulse' : ''} />
                                </button>
                            </form>
                        ) : (
                            <div className="success-state">
                                <div className="success-icon-wrapper animate-bounce-subtle">
                                    <CheckCircle size={56} className="text-success" />
                                </div>
                                <h3>Identité Vérifiée !</h3>
                                <p>Nous avons envoyé un lien de réinitialisation si l'email existe. Pensez à vérifier vos courriers indésirables.</p>

                                {debugLink && (
                                    <div className="debug-notice">
                                        <p className="debug-title">Mode Développement (Render Email Bloqué) :</p>
                                        <a href={debugLink} className="debug-btn">
                                            Lien de réinitialisation direct
                                        </a>
                                    </div>
                                )}

                                <Link to="/login" className="btn-secondary-premium w-full mt-6">
                                    Retour à la connexion
                                </Link>
                            </div>
                        )}

                        <div className="auth-footer">
                            <Link to="/login" className="back-link">
                                <ArrowLeft size={16} /> Revenir en arrière
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                /* Global Auth Wrapper */
                .auth-wrapper {
                    min-height: 100vh;
                    background-color: #0f172a; /* Fallback dark */
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
                    background-image: url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
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
                    background: linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(59,130,246,0.6) 100%);
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
                    font-size: 3rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                    line-height: 1.2;
                    letter-spacing: -1px;
                }

                .visual-content p {
                    font-size: 1.15rem;
                    line-height: 1.6;
                    opacity: 0.9;
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
                    padding: 3rem 2.5rem;
                    border-radius: 24px;
                    background: white;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
                    border: 1px solid rgba(226, 232, 240, 0.8);
                }

                /* Glassmorphism adjustments */
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
                    width: 64px;
                    height: 64px;
                    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.1);
                    transform: rotate(-5deg);
                }

                .auth-icon {
                    color: #3b82f6;
                    transform: rotate(5deg);
                }

                .auth-header h2 {
                    font-size: 1.75rem;
                    font-weight: 700;
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
                    border-color: #3b82f6;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
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
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                    color: white;
                    font-weight: 600;
                    font-size: 1rem;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.2);
                }

                .btn-premium:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 20px -3px rgba(37, 99, 235, 0.3);
                }

                .btn-premium:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .btn-secondary-premium {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    padding: 1rem;
                    border-radius: 12px;
                    background: #f1f5f9;
                    color: #475569;
                    font-weight: 600;
                    font-size: 1rem;
                    text-decoration: none;
                    transition: all 0.3s ease;
                }

                .btn-secondary-premium:hover {
                    background: #e2e8f0;
                    color: #0f172a;
                }

                .mt-6 { margin-top: 1.5rem; }

                /* Success State */
                .success-state {
                    text-align: center;
                    padding: 1rem 0;
                }

                .success-icon-wrapper {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 1.5rem;
                }

                .text-success { color: #10b981; }

                .success-state h3 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 0.75rem;
                }

                .success-state p {
                    color: #64748b;
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                }

                .debug-notice {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    padding: 1rem;
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                }

                .debug-title {
                    font-size: 0.85rem;
                    color: #991b1b;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }

                .debug-btn {
                    display: inline-block;
                    background: #ef4444;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    text-decoration: none;
                    transition: background 0.2s;
                }

                .debug-btn:hover { background: #dc2626; }

                /* Footer */
                .auth-footer {
                    margin-top: 2rem;
                    text-align: center;
                }

                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #64748b;
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 0.95rem;
                    transition: color 0.2s;
                }

                .back-link:hover {
                    color: #3b82f6;
                }

                /* Animations */
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-fade-in-up {
                    animation: fadeInUp 0.5s ease-out forwards;
                }

                @keyframes bounceSubtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                .animate-bounce-subtle {
                    animation: bounceSubtle 2s infinite ease-in-out;
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
                    .auth-card {
                        padding: 2rem 1.5rem;
                    }
                    .visual-content h2 { font-size: 2rem; }
                    .auth-header h2 { font-size: 1.5rem; }
                }
            `}</style>
        </div>
    );
};

export default ForgotPasswordPage;

