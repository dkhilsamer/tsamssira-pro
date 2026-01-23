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
                        <Facebook size={20} />
                        <Instagram size={20} />
                        <Twitter size={20} />
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
                    font-size: 1.8rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                    display: block;
                    text-decoration: none;
                }
                .footer-brand p {
                    color: #94a3b8;
                    margin-bottom: 1.5rem;
                }
                .social-links {
                    display: flex;
                    gap: 1.5rem;
                    color: var(--secondary);
                }
                .footer-links h4, .footer-contact h4 {
                    font-size: 1.2rem;
                    margin-bottom: 1.5rem;
                    color: var(--secondary);
                }
                .footer-links ul, .footer-contact ul {
                    list-style: none;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .footer-links a {
                    color: #94a3b8;
                    text-decoration: none;
                    transition: color 0.3s;
                }
                .footer-links a:hover {
                    color: white;
                }
                .footer-contact li {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: #94a3b8;
                }
                .footer-bottom {
                    margin-top: 4rem;
                    padding-top: 2rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    text-align: center;
                    color: #64748b;
                    font-size: 0.9rem;
                }
                @media (max-width: 768px) {
                    .footer-grid { grid-template-columns: 1fr; gap: 3rem; }
                }
            `}</style>
        </footer>
    );
};

export default Footer;
