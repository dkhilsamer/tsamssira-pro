import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User, Phone, ArrowRight, Calendar, UserCheck } from 'lucide-react';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        phone: '',
        birth_date: '',
        gender: '',
        role: 'viziteur'
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            toast.success('Compte créé ! Vous pouvez vous connecter.');
            navigate('/login');
        } catch (error) {
            toast.error(error.message || 'Erreur lors de la création du compte.');
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
                        <h2>Rejoignez l'Élite</h2>
                        <p>Créez votre compte Tsamssira Pro dès aujourd'hui. Trouvez la propriété de vos rêves ou optimisez la gestion de votre portefeuille immobilier exclusif.</p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="auth-form-container">
                    <div className="auth-card glass-premium animate-fade-in-up">
                        <div className="auth-header">
                            <div className="icon-wrapper">
                                <UserCheck size={32} className="auth-icon" />
                            </div>
                            <h2>Créer un compte</h2>
                            <p>Rejoignez la communauté Tsamssira Pro.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-grid">
                                <div className="input-group">
                                    <label><User size={16} /> Nom d'utilisateur</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            className="premium-input"
                                            required
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            placeholder="ex: JeanDupont"
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label><Mail size={16} /> Email</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="email"
                                            className="premium-input"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="jean@example.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="input-group">
                                    <label><Phone size={16} /> Téléphone</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="tel"
                                            className="premium-input"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+216 20 000 000"
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label><Calendar size={16} /> Date de Naissance</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="date"
                                            className="premium-input"
                                            required
                                            value={formData.birth_date}
                                            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="input-group">
                                    <label><User size={16} /> Sexe</label>
                                    <div className="input-wrapper">
                                        <select
                                            className="premium-input select-premium"
                                            required
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        >
                                            <option value="" disabled>Sélectionner</option>
                                            <option value="Homme">Homme</option>
                                            <option value="Femme">Femme</option>
                                            <option value="Autre">Autre</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label><UserCheck size={16} /> Vous êtes ?</label>
                                    <div className="input-wrapper">
                                        <select
                                            className="premium-input select-premium"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="viziteur">Acheteur / Locataire</option>
                                            <option value="proprietaire">Propriétaire / Agent</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-grid">
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

                                <div className="input-group">
                                    <label><Lock size={16} /> Confirmer Mot de passe</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="password"
                                            className="premium-input"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn-premium w-full mt-4" disabled={loading}>
                                <span>{loading ? 'Création...' : "S'inscrire"}</span>
                                <ArrowRight size={18} className={loading ? 'animate-pulse' : ''} />
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>Déjà un compte ? <Link to="/login" className="text-secondary-premium font-bold">Connectez-vous</Link></p>
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
                    flex: 1.2;
                    position: relative;
                    background-image: url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
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
                    overflow-y: auto;
                }

                .auth-card {
                    width: 100%;
                    max-width: 550px;
                    padding: 3.5rem 2.5rem;
                    border-radius: 24px;
                    background: white;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    margin: auto 0;
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
                    gap: 1.25rem;
                }
                
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.25rem;
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
                
                .select-premium {
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
                    background-position: right 0.5rem center;
                    background-repeat: no-repeat;
                    background-size: 1.5em 1.5em;
                    padding-right: 2.5rem;
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

                .mt-4 { margin-top: 1rem; }

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

                @media (max-width: 768px) {
                    .form-grid {
                        grid-template-columns: 1fr;
                        gap: 1.25rem;
                    }
                }

                @media (max-width: 480px) {
                    .auth-card { padding: 2.5rem 1.5rem; }
                    .visual-content h2 { font-size: 2.5rem; }
                    .auth-header h2 { font-size: 1.75rem; }
                    .auth-form-container { padding: 1rem; }
                }
            `}</style>
        </div>
    );
};

export default RegisterPage;
