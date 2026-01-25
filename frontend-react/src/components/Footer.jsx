import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="container footer-grid">
                <div className="footer-brand">
                    <Link to="/" className="logo">Tsamssira Pro</Link>
                    <p>Votre partenaire de confiance pour l'immobilier en Tunisie. Trouvez la perle rare en quelques clics.</p>
                    <div className="social-links">
                        <Facebook size={20} aria-label="Facebook" style={{ cursor: 'pointer' }} />
                        <Instagram size={20} aria-label="Instagram" style={{ cursor: 'pointer' }} />
                        <Twitter size={20} aria-label="Twitter" style={{ cursor: 'pointer' }} />
                    </div>
                </div>

                <div className="footer-links">
                    <h4>Navigation</h4>
                    <ul>
                        <li><Link to="/">Accueil</Link></li>
                        <li><Link to="/properties">Propriétés</Link></li>
                        <li><Link to="/login">Connexion</Link></li>
                        <li><Link to="/register">Inscription</Link></li>
                    </ul>
                </div>

                <div className="footer-contact">
                    <h4>Contact</h4>
                    <ul>
                        <li><MapPin size={16} /> Tunis, Tunisie</li>
                        <li><Phone size={16} /> +216 20 089 332</li>
                        <li><Mail size={16} /> tsamssirapro@gmail.com</li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Tsamssira Pro. Tous droits réservés.</p>
            </div>

            <style jsx>{`
                .footer-container {
                    background: var(--primary);
                    color: white;
                    padding: 5rem 0 2rem;
                    margin-top: 5rem;
                }
                .footer-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr;
                    gap: 4rem;
                }
                .footer-brand .logo {
                    color: var(--secondary);
                    font-size: 2rem;
                    font-family: var(--font-heading);
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                    display: block;
                    text-decoration: none;
                }
                .footer-brand p {
                    color: #94a3b8;
                    margin-bottom: 2rem;
                    max-width: 300px;
                    line-height: 1.7;
                    font-weight: 500;
                }
                .social-links {
                    display: flex;
                    gap: 1.5rem;
                    color: rgba(255,255,255,0.4);
                }
                .social-links :global(svg) {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .social-links :global(svg):hover {
                    color: var(--secondary);
                    transform: translateY(-3px);
                }
                .footer-links h4, .footer-contact h4 {
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 2rem;
                    color: var(--secondary);
                    font-weight: 800;
                }
                .footer-links ul, .footer-contact ul {
                    list-style: none;
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }
                .footer-links a {
                    color: #64748b;
                    text-decoration: none;
                    transition: all 0.3s;
                    font-weight: 600;
                    font-size: 0.95rem;
                }
                .footer-links a:hover {
                    color: var(--secondary);
                    padding-left: 5px;
                }
                .footer-contact li {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    color: #94a3b8;
                    font-weight: 500;
                }
                .footer-bottom {
                    margin-top: 5rem;
                    padding-top: 2rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    text-align: center;
                    color: #475569;
                    font-size: 0.8rem;
                    font-weight: 700;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }
                @media (max-width: 768px) {
                    .footer-grid { grid-template-columns: 1fr; gap: 3rem; }
                }
            `}</style>
        </footer>
    );
};

export default Footer;
