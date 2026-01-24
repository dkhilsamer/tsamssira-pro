import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Trash2, Shield, UserX, Check } from 'lucide-react';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await api.get('/auth/users');
            setUsers(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur et TOUTES ses propriétés ? Cette action est irréversible.')) return;

        try {
            await api.delete(`/auth/users/${userId}`);
            toast.success('Utilisateur supprimé');
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handlePromoteAdmin = async (userId, currentRole) => {
        if (currentRole === 'admin') return; // Déjà admin
        if (!window.confirm('Voulez-vous promouvoir cet utilisateur Administrateur ?')) return;

        try {
            await api.put(`/auth/users/${userId}/role`, { role: 'admin' });
            toast.success('Rôle mis à jour');
            fetchUsers();
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (loading) return <div className="loading-state"><div className="spinner"></div></div>;

    return (
        <div className="container py-12 animate-fade-in">
            <div className="page-header mb-8">
                <h1 className="text-3xl font-bold text-primary">Gestion des Utilisateurs</h1>
                <p className="text-muted">Administrez les comptes utilisateurs et gérez les permissions.</p>
            </div>

            <div className="users-table-container glass shadow-premium">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Utilisateur</th>
                            <th>Email</th>
                            <th>Rôle</th>
                            <th>Mot de Passe</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div className="user-name-cell">
                                        <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
                                        <span className="font-bold">{user.username}</span>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                                        <Shield size={12} className="mr-1" />
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <code className="password-display">
                                        {user.plain_password || '••••••••'}
                                    </code>
                                </td>
                                <td>
                                    <div className="actions-cell">
                                        {user.role !== 'admin' && (
                                            <button
                                                onClick={() => handlePromoteAdmin(user.id, user.role)}
                                                className="btn-action promote"
                                                title="Promouvoir Admin"
                                            >
                                                <Shield size={18} />
                                            </button>
                                        )}
                                        {user.username !== 'Tadmin' && user.id !== currentUser.id && (
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="btn-action delete"
                                                title="Supprimer Utilisateur"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                .users-table-container {
                    overflow-x: auto;
                    border-radius: 20px;
                    border: 1px solid var(--border);
                }
                .users-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: var(--surface);
                }
                .users-table th {
                    padding: 1.25rem 1.5rem;
                    text-align: left;
                    background: var(--background);
                    color: var(--text-muted);
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    border-bottom: 2px solid var(--border);
                }
                .users-table td {
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid var(--border);
                    color: var(--text-main);
                }
                .users-table tr:hover { background: var(--background); }
                
                .user-name-cell { display: flex; align-items: center; gap: 1rem; }
                .user-avatar {
                    width: 36px; height: 36px;
                    border-radius: 10px;
                    background: var(--primary);
                    color: white;
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 800;
                }

                .badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }
                .badge-admin { background: var(--info-bg); color: var(--info-text); }
                .badge-user { background: var(--border); color: var(--text-muted); }

                .password-display {
                    font-family: var(--font-mono);
                    background: var(--background);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.85rem;
                    color: var(--secondary);
                }

                .actions-cell { display: flex; justify-content: flex-end; gap: 0.75rem; }
                .btn-action {
                    width: 36px; height: 36px;
                    border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                    border: none; cursor: pointer; transition: all 0.2s;
                }
                .btn-action.promote { background: var(--success-bg); color: var(--success-text); }
                .btn-action.promote:hover { background: var(--success-text); color: white; }
                .btn-action.delete { background: var(--danger-bg); color: var(--danger-text); }
                .btn-action.delete:hover { background: var(--danger-text); color: white; }
            `}</style>
        </div>
    );
};

export default UsersPage;
