import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, MessageSquare, LayoutDashboard, Home, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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
        <nav className="navbar glass">
            <div className="nav-container">
                <Link to="/" className="logo">
                    Tsamssira Pro <span className="logo-icon">🏠</span>
                </Link>

                {/* Mobile Menu Toggle */}
                <button className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
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
                            <div className="user-menu">
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
                .logo-icon {
                    font-size: 1.4rem;
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
                    background: rgba(212, 175, 55, 0.05);
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

                @media (max-width: 992px) {
                    .mobile-toggle { display: block; }
                    .nav-links {
                        position: fixed;
                        top: 0;
                        right: -100%;
                        width: 80%;
                        height: 100vh;
                        background: white;
                        flex-direction: column;
                        justify-content: center;
                        transition: right 0.3s ease;
                        box-shadow: -10px 0 30px rgba(0,0,0,0.1);
                        padding: 2rem;
                        gap: 2rem;
                    }
                    .nav-links.open { right: 0; }
                    .user-menu {
                        flex-direction: column;
                        border-left: none;
                        padding-left: 0;
                        width: 100%;
                    }
                    .auth-buttons { flex-direction: column; width: 100%; }
                    .nav-item { width: 100%; justify-content: center; font-size: 1.2rem; }
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
