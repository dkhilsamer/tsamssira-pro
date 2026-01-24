import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Calendar, Save, ArrowLeft } from 'lucide-react';
import './SettingsPage.css';

const SettingsPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        address: '',
        birth_date: '',
        gender: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await api.get('/auth/profile');
            // Format date for input if present
            let birthDate = '';
            if (data.birth_date) {
                birthDate = new Date(data.birth_date).toISOString().split('T')[0];
            }
            setFormData({
                username: data.username || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || '',
                birth_date: birthDate,
                gender: data.gender || ''
            });
        } catch (error) {
            toast.error('Erreur lors du chargement du profil: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await api.put('/auth/profile', formData);
            toast.success(response.message || 'Profil mis à jour !');
            // Update local storage in case username changed
            if (response.user) {
                const currentUser = JSON.parse(localStorage.getItem('user'));
                const newUser = { ...currentUser, ...response.user };
                localStorage.setItem('user', JSON.stringify(newUser));
                // Trigger event to update Navbar
                window.dispatchEvent(new Event("storage"));
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="settings-page container">
            <div className="settings-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    <ArrowLeft size={20} /> Retour
                </button>
                <h1>Paramètres du Profil</h1>
            </div>

            <div className="settings-content glass animate-fade-in">
                <div className="profile-header">
                    <div className="profile-icon">
                        <User size={40} />
                    </div>
                    <div>
                        <h2>{formData.username}</h2>
                        <p>{formData.email}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="settings-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label><User size={16} /> Nom d'utilisateur</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label><Mail size={16} /> Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label><Phone size={16} /> Téléphone</label>
                            <input
                                type="tel"
                                className="form-input"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+216 00 000 000"
                            />
                        </div>

                        <div className="form-group">
                            <label><Calendar size={16} /> Date de Naissance</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.birth_date}
                                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label><User size={16} /> Sexe</label>
                            <select
                                className="form-input"
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="">Choisir...</option>
                                <option value="Homme">Homme</option>
                                <option value="Femme">Femme</option>
                                <option value="Autre">Autre</option>
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label><MapPin size={16} /> Adresse</label>
                            <textarea
                                className="form-input"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                rows="3"
                                placeholder="Votre adresse complète..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Enregistrement...' : 'Sauvegarder les modifications'} <Save size={18} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsPage;
