import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, MessageSquare, LayoutDashboard, Home, Menu, X, Sun, Moon, Clock, List } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

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

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    return (
        <nav className="navbar glass" aria-label="Menu principal">
            <div className="nav-container">
                <Link to="/" className="logo" aria-label="Retour à l'accueil">
                    <img src="/logo.png" alt="Logo Tsamssira Pro" className="logo-img" /> Tsamssira Pro
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
                        <img src="/logo.png" alt="Logo" className="logo-img-mobile" />
                        <span className="logo-text">Tsamssira Pro</span>
                    </div>
                    <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                        <Home size={18} /> Accueil
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

            <style jsx>{`
                .navbar {
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    padding: 0.75rem 0;
                    min-height: 70px;
                    display: flex;
                    align-items: center;
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                }
                .nav-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }
                .logo {
                    font-family: var(--font-heading);
                    font-size: 1.6rem;
                    font-weight: 700;
                    color: var(--primary);
                    text-decoration: none;
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .logo-img {
                    height: 50px;
                    width: auto;
                    object-fit: contain;
                    mix-blend-mode: ${theme === 'light' ? 'multiply' : 'normal'};
                    filter: ${theme === 'dark' ? 'brightness(0) invert(1)' : 'none'};
                }
                .mobile-toggle {
                    display: none;
                    background: none;
                    border: none;
                    color: var(--primary);
                    cursor: pointer;
                    z-index: 1001;
                }
                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }
                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    text-decoration: none;
                    color: var(--text-main);
                    font-weight: 500;
                    transition: all 0.2s;
                    padding: 0.5rem 0.8rem;
                    border-radius: 8px;
                }
                    .nav-item:hover, .nav-item.active {
                        color: var(--secondary);
                        background: rgba(212, 175, 55, 0.15);
                        font-weight: 800;
                    }
                .user-menu {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding-left: 1.5rem;
                    border-left: 1px solid var(--border);
                }
                .user-name {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    color: var(--primary);
                }
                .btn-logout {
                    background: #fee2e2;
                    border: none;
                    color: var(--danger);
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .btn-logout:hover { background: #fecaca; }
                
                .auth-buttons {
                    display: flex;
                    gap: 0.75rem;
                }
                .btn-primary-outline {
                    border: 2px solid var(--primary);
                    color: var(--primary);
                    background: transparent;
                }
                .theme-toggle {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--text-main);
                    padding: 0.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.3s ease;
                }
                .theme-toggle:hover {
                    transform: rotate(15deg);
                    color: var(--secondary);
                }
                
                .mobile-only { display: none; }

                @media (max-width: 992px) {
                    .mobile-toggle { display: block; }
                    .nav-links {
                        position: fixed;
                        top: 0;
                        right: -100%;
                        width: 80%;
                        height: 100vh;
                        background: var(--surface);
                        flex-direction: column;
                        justify-content: flex-start;
                        transition: right 0.3s ease;
                        box-shadow: -10px 0 30px rgba(0,0,0,0.2);
                        padding: 1.5rem;
                        gap: 0.5rem;
                        border-left: 1px solid var(--border);
                    }
                .mobile-menu-header {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.25rem;
                    padding: 3rem 1rem 2rem;
                    margin-bottom: 1.5rem;
                    border-bottom: 1px solid var(--border);
                    width: 100%;
                    background: var(--background);
                }
                .logo-img-mobile {
                    height: 90px;
                    width: auto;
                    object-fit: contain;
                    filter: ${theme === 'dark' ? 'brightness(0) invert(1)' : 'none'};
                }
                .logo-text {
                    font-family: var(--font-heading);
                    font-weight: 800;
                    font-size: 1.8rem;
                    color: var(--secondary);
                    letter-spacing: -1px;
                }
                .nav-links.open { right: 0; }
                    .user-menu {
                        flex-direction: column;
                        border-left: none;
                        padding-left: 0;
                        width: 100%;
                    }
                    .auth-buttons { flex-direction: column; width: 100%; }
                    .nav-item { 
                        width: 100%; 
                        justify-content: flex-start; 
                        font-size: 1.1rem;
                        padding: 1rem 1.5rem;
                        color: var(--text-main);
                        border-radius: 12px;
                    }
                    .mobile-only {
                        display: flex;
                        flex-direction: column;
                        width: 100%;
                        gap: 1rem;
                        border-top: 1px solid var(--border);
                        padding-top: 1rem;
                    }
                    .nav-item:hover, .nav-item.active {
                        background: var(--background);
                        color: var(--secondary);
                    }
                    .user-name {
                        color: var(--primary);
                        padding: 1rem;
                        font-size: 1.2rem;
                    }
                }

                @media (max-width: 480px) {
                    .logo { font-size: 1.3rem; }
                    .nav-container { padding: 0 1rem; }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
