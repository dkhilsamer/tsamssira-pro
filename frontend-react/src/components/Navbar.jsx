import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, MessageSquare, LayoutDashboard, Home, Menu, X, Sun, Moon, Clock, List, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const Navbar = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    // Close menu on route change and sync user state
    useEffect(() => {
        setIsMenuOpen(false);

        // Sync user state from localStorage (e.g. after login/logout in another tab or component)
        const syncUser = () => {
            setUser(JSON.parse(localStorage.getItem('user')));
        };
        window.addEventListener('storage', syncUser);

        return () => window.removeEventListener('storage', syncUser);
    }, [location]);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            localStorage.removeItem('user');
            setUser(null);
            setIsMenuOpen(false);
            navigate('/');
            toast.success('Déconnexion réussie');
        }
    };
    return (
        <nav className="navbar glass" aria-label="Menu principal">
            <div className="nav-container">
                <Link to="/" className="logo" aria-label="Retour à l'accueil">
                    <img
                        src="/logo.png"
                        alt="Logo Tsamssira Pro"
                        className="logo-img"
                        style={{ height: '60px', width: 'auto' }}
                    />
                </Link>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                    aria-expanded={isMenuOpen}
                    aria-controls="nav-links"
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                <div id="nav-links" className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
                    {/* Logo specifically for mobile menu top */}
                    <div className="mobile-menu-header">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="logo-img-mobile"
                            style={{ height: '120px', width: 'auto' }}
                        />
                    </div>
                    <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                        <Home size={18} /> Accueil
                    </Link>
                    <Link to="/ai-pricing" className={`nav-item ${location.pathname === '/ai-pricing' ? 'active' : ''}`}>
                        <Sparkles size={18} /> Estimation IA
                    </Link>

                    {user ? (
                        <>
                            <Link to="/dashboard" className={`nav-item ${location.pathname.startsWith('/dashboard') ? 'active' : ''}`}>
                                <LayoutDashboard size={18} /> Dashboard
                            </Link>
                            <Link to="/messages" className={`nav-item ${location.pathname === '/messages' ? 'active' : ''}`}>
                                <MessageSquare size={18} /> Messages
                            </Link>

                            {/* Mobile only shortcuts */}
                            <div className="mobile-only">
                                <Link to="/dashboard/my-properties" className={`nav-item ${location.pathname === '/dashboard/my-properties' ? 'active' : ''}`}>
                                    <Home size={18} /> Mes Annonces
                                </Link>
                                <Link to="/dashboard/requests" className={`nav-item ${location.pathname === '/dashboard/requests' ? 'active' : ''}`}>
                                    <List size={18} /> Mes Demandes
                                </Link>
                                <Link to="/dashboard/history" className={`nav-item ${location.pathname === '/dashboard/history' ? 'active' : ''}`}>
                                    <Clock size={18} /> Historique
                                </Link>
                                <button onClick={handleLogout} className="nav-item btn-logout-mobile">
                                    <LogOut size={18} /> Déconnexion
                                </button>
                            </div>
                            <div className="user-menu">
                                <NotificationBell />
                                <button
                                    onClick={toggleTheme}
                                    className="nav-item theme-toggle"
                                    aria-label="Changer le thème"
                                >
                                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                                </button>
                                <span className="user-name">
                                    <User size={18} /> {user.username}
                                </span>
                                <button onClick={handleLogout} className="btn-logout">
                                    <LogOut size={16} /> Quitter
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <button
                                onClick={toggleTheme}
                                className="nav-item theme-toggle"
                                aria-label="Changer le thème"
                            >
                                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                            </button>
                            <Link to="/login" className="btn btn-primary-outline">Connexion</Link>
                            <Link to="/register" className="btn btn-secondary">Inscription</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
